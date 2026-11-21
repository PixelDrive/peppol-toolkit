import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KositValidationMessage, PeppolToolkit } from '../../src';
import { KositCase } from './cases/helpers';
import { validCases } from './cases/valid';
import { invalidCases } from './cases/invalid';

const endpoint = process.env.KOSIT_ENDPOINT ?? 'http://localhost:8081/';
const outputDir = join(__dirname, '..', 'output');
const toolkit = new PeppolToolkit();

function generate(testCase: KositCase): string {
    const xml =
        testCase.kind === 'invoice'
            ? toolkit.invoiceToPeppolUBL(testCase.document)
            : toolkit.creditNoteToPeppolUBL(testCase.document);
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

async function run(testCase: KositCase) {
    const xml = generate(testCase);
    const result = await toolkit.validateWithKosit(xml, { endpoint });

    // Keep the generated document and the report for debugging (uploaded by CI).
    const slug = testCase.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, `${slug}.xml`), xml);
    writeFileSync(join(outputDir, `${slug}.report.xml`), result.rawXml);

    return result;
}

describe('KoSIT validation - documents that must be accepted', () => {
    it.each(validCases.map((c) => [c.name, c] as const))(
        '%s',
        async (_name, testCase) => {
            const result = await run(testCase);

            expect(describeMessages(result.errors)).toEqual([]);
            expect(result.valid).toBe(true);
        }
    );
});

describe('KoSIT validation - documents that must be rejected', () => {
    it.each(invalidCases.map((c) => [c.name, c] as const))(
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

    it('every rejected case declares the rule it targets', () => {
        for (const testCase of invalidCases) {
            expect(
                testCase.expectedErrors?.length,
                testCase.name
            ).toBeGreaterThan(0);
        }
    });
});
