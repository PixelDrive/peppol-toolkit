import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { z } from 'zod';

const date = z.union([z.string(), z.date()]);


const invoicePeriod = z.object({
    startDate: date.optional(),
    endDate: date.optional(),
    descriptionCode: z.enum(['3', '35', '432'])
});
export const invoiceSchema = z.object({
    ID: z.string().min(1),
    issueDate: date,
    dueDate: date.optional(),
    invoiceTypeCode: InvoiceTypeCodeSchema,
    note: z.string().optional(),
    taxPointDate: date.optional(),
    documentCurrencyCode: CurrencyCodeSchema,
    taxCurrencyCode: CurrencyCodeSchema.optional,
    accountingCost: z.string().optional(),
    buyerReference: z.string().optional(),
    invoicePeriod: invoicePeriod.optional()
});

export type Invoice = z.infer<typeof invoiceSchema>;
