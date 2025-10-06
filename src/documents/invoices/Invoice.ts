import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';
import { z } from 'zod';
import { CurrencyCodeSchema, date, partySchema } from '../common';
import { paymentMeansSchema } from '../common/PaymentMeans';
import { taxTotalSchema } from '../common/TaxTotal';
import { legalMonetaryTotalSchema } from '../common/LegalMonetaryTotal';
import { lineSchema } from '../common/Line';
import { invoicePeriodSchema } from '../common/InvoicePeriodSchema';

export const invoiceSchema = z.object({
    ID: z.string().min(1),
    issueDate: date,
    dueDate: date.optional(),
    invoiceTypeCode: InvoiceTypeCodeSchema,
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
