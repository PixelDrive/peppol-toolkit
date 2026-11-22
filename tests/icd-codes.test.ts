import { describe, expect, it } from 'vitest';
import { ICDCodes, ICDCodeSchema, isValidICDCode, partySchema } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';

describe('ICD codes', () => {
    it('follow the ICD list of Peppol BIS 3.0.21, plus SEPA', () => {
        expect(Object.keys(ICDCodes)).toHaveLength(244);
        ['0003', '0088', '0208', '0246', '0247', '0248'].forEach((code) => {
            expect(isValidICDCode(code), code).toBe(true);
        });
        expect(isValidICDCode('SEPA')).toBe(true); // BT-90, bank assigned creditor identifier
    });

    it('do not contain EAS only schemes (rejected by BR-CL-10)', () => {
        ['9925', '9930', '9944', '9957', '9958', '9960'].forEach((code) => {
            expect(isValidICDCode(code), code).toBe(false);
            expect(ICDCodeSchema.safeParse(code).success, code).toBe(false);
        });
    });

    it('are used for the party identifiers', () => {
        const party = basicInvoice.seller;
        expect(
            partySchema.safeParse({
                ...party,
                identification: [{ id: '5790000435968', scheme: '0088' }],
            }).success
        ).toBe(true);
        expect(
            partySchema.safeParse({
                ...party,
                identification: [{ id: 'BE0732788874', scheme: '9925' }],
            }).success
        ).toBe(false);
    });
});
