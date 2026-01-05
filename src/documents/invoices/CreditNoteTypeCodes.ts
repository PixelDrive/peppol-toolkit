import { z } from 'zod';

/**
 * Invoice type codes as defined by the EU
 * @see https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL1001-cn/
 * */
export const CreditNoteTypeCodes = {
    81: 'Credit note related to goods or services',
    83: 'Credit note related to financial adjustments',
    261: 'Self-billed credit-note',
    381: 'Credit note',
    396: 'Factored credit note',
    532: "Forwarder's credit note",
} as const;

export type CreditNoteTypeCodes = keyof typeof CreditNoteTypeCodes;

/**
 * Get the description of an invoice type code
 * @param code The code to get the description for
 * @returns The description of the code
 */
export function getCreditNoteTypeCodeDescription(
    code: CreditNoteTypeCodes
): string {
    return CreditNoteTypeCodes[code];
}

/**
 * Check if a given code is a valid invoice type code
 * @param code The code to check
 */
export function isValidCreditNoteTypeCode(
    code: number
): code is CreditNoteTypeCodes {
    return code in CreditNoteTypeCodes;
}

// Zod schema for invoice type codes (numeric codes)
export const CreditNoteTypeCodeSchema = z
    .number()
    .int()
    .refine((code) => isValidCreditNoteTypeCode(code), {
        message: 'Invalid CreditNoteTypeCode',
    });
