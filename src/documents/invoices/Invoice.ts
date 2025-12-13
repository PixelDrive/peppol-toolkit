import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';
import { z } from 'zod';
import {
    CurrencyCodeSchema,
    date,
    invoicePeriodSchema,
    legalMonetaryTotalSchema,
    lineSchema,
    partySchema,
    paymentMeansSchema,
    taxTotalSchema,
} from '../common';
export const invoiceSchema = z.object({
    customizationID: z.string().default(
        'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0'
    ).optional(),
    profileID: z.string().default(
        'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
    ).optional(),
    ID: z.string().min(1),
    issueDate: date,
    dueDate: date.optional(),
    invoiceTypeCode: InvoiceTypeCodeSchema.default(380).optional(),
    note: z.string().optional(),
    taxPointDate: date.optional(),
    documentCurrencyCode: CurrencyCodeSchema,
    taxCurrencyCode: CurrencyCodeSchema.optional(),
    accountingCost: z.string().optional(),
    buyerReference: z.string().optional(),
    invoicePeriod: invoicePeriodSchema.optional(),

    seller: partySchema,
    buyer: partySchema,

    paymentMeans: paymentMeansSchema.array().optional(),
    paymentTermsNote: z
        .string()
        .optional()
        .describe('Payment terms that apply (including penalties)'),
    taxTotal: z.array(taxTotalSchema).min(1).max(2),
    legalMonetaryTotal: legalMonetaryTotalSchema,
    invoiceLines: z.array(lineSchema).min(1),
});

export type Invoice = z.infer<typeof invoiceSchema>;
