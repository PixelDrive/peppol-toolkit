import { describe, expect, it } from 'vitest';
import { CreditNote, creditNoteSchema } from '../src';
import { basicCreditNote } from '../src/data/basic-creditNote';

describe('CreditNoteTypeCodes', () => {
    it('should accept if it is in the supported list', () => {
        const sampleCreditNote: CreditNote = {
            ...basicCreditNote,
            creditNoteTypeCode: 381,
        };
        const result = creditNoteSchema.safeParse(sampleCreditNote);
        expect(result.success).toBe(true);
    });

    it('should reject the self-billed credit note code 261 (PEPPOL-EN16931-P0101)', () => {
        const result = creditNoteSchema.safeParse({
            ...basicCreditNote,
            creditNoteTypeCode: 261,
        });
        expect(result.success).toBe(false);
    });

    it('should return errors if not in supported list', () => {
        const sampleCreditNote = {
            ...basicCreditNote,
            creditNoteTypeCode: 380,
        };
        const result = creditNoteSchema.safeParse(sampleCreditNote);
        console.log(result);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.toString()).toContain(
            'creditNoteTypeCode'
        );
    });
});
