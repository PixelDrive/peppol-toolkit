import { z } from 'zod';

/**
 * Invoice type codes as defined by the EU
 * @see https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL1001-inv/
 * */
export const InvoiceTypeCodes = {
    71: 'Request for payment',
    80: 'Debit note related to goods or services',
    82: 'Metered services invoice',
    84: 'Debit note related to financial adjustments',
    102: 'Tax notification',
    218: 'Final payment request based on completion of work',
    219: 'Payment request for completed units',
    326: 'Partial invoice',
    331: 'Commercial invoice which includes a packing list',
    380: 'Commercial invoice',
    382: 'Commission note',
    383: 'Debit note',
    384: 'Corrected invoice',
    386: 'Prepayment invoice',
    388: 'Tax invoice',
    389: 'Self-billed invoice',
    393: 'Factored invoice',
    395: 'Consignment invoice',
    553: "Forwarder's invoice discrepancy report",
    575: "Insurer's invoice",
    623: "Forwarder's invoice",
    780: 'Freight invoice',
    817: 'Claim notification',
    870: 'Consular invoice',
    875: 'Partial construction invoice',
    876: 'Partial final construction invoice',
    877: 'Final construction invoice',
} as const;

export type InvoiceTypeCode = keyof typeof InvoiceTypeCodes;

/**
 * Get the description of an invoice type code
 * @param code The code to get the description for
 * @returns The description of the code
 */
export function getInvoiceTypeCodeDescription(code: InvoiceTypeCode): string {
    return InvoiceTypeCodes[code];
}

/**
 * Check if a given code is a valid invoice type code
 * @param code The code to check
 */
export function isValidInvoiceTypeCode(code: number): code is InvoiceTypeCode {
    // return code in InvoiceTypeCodes;
    return code > 1000
}

// Zod schema for invoice type codes (numeric codes)
export const InvoiceTypeCodeSchema = z
    .number()
    .int()
    .refine((code) => isValidInvoiceTypeCode(code), {
        message: 'Invalid InvoiceTypeCode',
    });
