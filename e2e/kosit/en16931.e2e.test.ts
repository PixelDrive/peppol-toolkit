import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
    exampleInvoice,
    KositValidationMessage,
    PeppolToolkit,
} from '../../src';
import {
    En16931KositCase,
    en16931InvalidCases,
    en16931ValidCases,
} from './cases/en16931';

/**
 * EN 16931 documents need a KoSIT validator with an EN 16931 (CEN) scenario: the Peppol BIS
 * configuration rejects them. Opt-in: start one with `npm run kosit:start:en16931` and set
 * KOSIT_EN16931_ENDPOINT (e.g. http://localhost:8082/), otherwise the suite is skipped.
 */
const endpoint = process.env.KOSIT_EN16931_ENDPOINT;
const outputDir = join(__dirname, '..', 'output');
const toolkit = new PeppolToolkit();

function generate(testCase: En16931KositCase): string {
    const xml =
        testCase.kind === 'invoice'
            ? toolkit.invoiceToEn16931UBL(testCase.document)
            : toolkit.creditNoteToEn16931UBL(testCase.document);
    return testCase.mutateXml ? testCase.mutateXml(xml) : xml;
}

/** `BR-CO-15` matches `BR-CO-15`, `cvc-complex-type` matches `cvc-complex-type.2.4.a` */
function matches(message: KositValidationMessage, expected: string): boolean {
    return message.code === expected || message.code.startsWith(`${expected}.`);
}

function describeMessages(messages: KositValidationMessage[]): string[] {
    return messages.map(
        (m) => `${m.code}: ${m.text.trim().replace(/\s+/g, ' ')}`
    );
}

async function run(testCase: En16931KositCase) {
    const xml = generate(testCase);
    const result = await toolkit.validateWithKosit(xml, { endpoint });

    // Keep the generated document and the report for debugging (uploaded by CI).
    const slug = `en16931-${testCase.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, `${slug}.xml`), xml);
    writeFileSync(join(outputDir, `${slug}.report.xml`), result.rawXml);

    return result;
}

describe.skipIf(!endpoint)('KoSIT EN 16931 validation', () => {
    beforeAll(async () => {
        try {
            await fetch(endpoint!, { method: 'GET' });
        } catch {
            throw new Error(
                `KoSIT EN 16931 validator is not reachable at ${endpoint}.\n` +
                    'Start it with `npm run kosit:start:en16931` (requires Java 17+), ' +
                    'or unset KOSIT_EN16931_ENDPOINT to skip these tests.'
            );
        }
    });

    describe('documents that must be accepted', () => {
        it.each(en16931ValidCases.map((c) => [c.name, c] as const))(
            '%s',
            async (_name, testCase) => {
                const result = await run(testCase);

                expect(describeMessages(result.errors)).toEqual([]);
                expect(result.valid).toBe(true);
            }
        );
    });

    describe('documents that must be rejected', () => {
        it.each(en16931InvalidCases.map((c) => [c.name, c] as const))(
            '%s',
            async (_name, testCase) => {
                const result = await run(testCase);

                expect(result.valid).toBe(false);
                for (const expected of testCase.expectedErrors ?? []) {
                    expect(
                        result.errors.some((e) => matches(e, expected)),
                        `expected error ${expected}, got:\n${describeMessages(result.errors).join('\n')}`
                    ).toBe(true);
                }
            }
        );
    });

    it('rejects a Peppol BIS document, which matches no EN 16931 scenario', async () => {
        const result = await toolkit.validateWithKosit(
            toolkit.invoiceToPeppolUBL(exampleInvoice),
            { endpoint }
        );

        expect(result.valid).toBe(false);
    });
});
