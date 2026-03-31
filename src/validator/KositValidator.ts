import { XMLParser } from 'fast-xml-parser';

export interface KositValidatorOptions {
    /**
     * The URL of the Kosit validator service.
     * @default 'http://localhost:8081/'
     */
    endpoint?: string;
}

export interface KositValidationMessage {
    id: string;
    text: string;
    location: string;
}

export interface KositValidationResult {
    valid: boolean;
    errors: KositValidationMessage[];
    warnings: KositValidationMessage[];
    rawXml: string;
}

export class KositValidator {
    private readonly endpoint: string;
    private readonly parser: XMLParser;

    constructor(options?: KositValidatorOptions) {
        this.endpoint = options?.endpoint ?? 'http://localhost:8081/';
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '$',
            parseTagValue: false,
            removeNSPrefix: true,
        });
    }

    /**
     * Validates a UBL XML document against the Kosit validator service.
     * @param xml The XML document to validate.
     * @returns The validation result including validity status, errors, and warnings.
     */
    public async validate(xml: string): Promise<KositValidationResult> {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: xml,
        });

        if (!response.ok && response.status !== 406) {
            throw new Error(
                `Kosit validator returned HTTP ${response.status}: ${response.statusText}`
            );
        }

        const rawXml = await response.text();
        return this.parseReport(rawXml);
    }

    private parseReport(rawXml: string): KositValidationResult {
        const parsed = this.parser.parse(rawXml) as Record<string, unknown>;

        const report = (parsed['report'] ?? parsed['createReportInput']) as
            | Record<string, unknown>
            | undefined;

        if (!report) {
            throw new Error(
                'Unexpected Kosit validator response: missing report element'
            );
        }

        const assessment = report['assessment'] as
            | Record<string, unknown>
            | undefined;

        const valid = assessment
            ? 'accept' in assessment
            : this.inferValidityFromResults(report);

        const errors: KositValidationMessage[] = [];
        const warnings: KositValidationMessage[] = [];

        this.extractMessages(report, errors, warnings);

        return { valid, errors, warnings, rawXml };
    }

    private inferValidityFromResults(report: Record<string, unknown>): boolean {
        const scenarioMatched = report['scenarioMatched'] as
            | Record<string, unknown>
            | undefined;

        if (!scenarioMatched) {
            return false;
        }

        const steps = scenarioMatched['validationStepResult'];
        const stepArray = Array.isArray(steps) ? steps : steps ? [steps] : [];

        return stepArray.every((step: Record<string, unknown>) => {
            const recommendation = step['recommendation'] as string | undefined;
            return recommendation === 'accept';
        });
    }

    private extractMessages(
        report: Record<string, unknown>,
        errors: KositValidationMessage[],
        warnings: KositValidationMessage[]
    ): void {
        const scenarioMatched = report['scenarioMatched'] as
            | Record<string, unknown>
            | undefined;

        if (!scenarioMatched) {
            return;
        }

        const steps = scenarioMatched['validationStepResult'];
        const stepArray = Array.isArray(steps) ? steps : steps ? [steps] : [];

        for (const step of stepArray as Record<string, unknown>[]) {
            this.extractStepMessages(step, errors, warnings);
        }
    }

    private extractStepMessages(
        step: Record<string, unknown>,
        errors: KositValidationMessage[],
        warnings: KositValidationMessage[]
    ): void {
        const messages = step['message'];
        const messageArray = Array.isArray(messages)
            ? messages
            : messages
              ? [messages]
              : [];

        for (const msg of messageArray as Record<string, unknown>[]) {
            const entry: KositValidationMessage = {
                id: String(msg['$id'] ?? msg['id'] ?? ''),
                text: String(msg['#text'] ?? msg['text'] ?? ''),
                location: String(msg['$location'] ?? msg['location'] ?? ''),
            };

            const level = String(
                msg['$level'] ?? msg['level'] ?? ''
            ).toLowerCase();

            if (level === 'warning') {
                warnings.push(entry);
            } else {
                errors.push(entry);
            }
        }
    }
}
