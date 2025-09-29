import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { z } from 'zod';

const date = z.union([z.string(), z.date()]);

export const invoiceSchema = z.object({
    ID: z.string().min(1),
    issueDate: date,
    dueDate: date.optional(),
    invoiceTypeCode: InvoiceTypeCodeSchema,
    note: z.string().optional(),
    taxPointDate: date.optional(),
    documentCurrencyCode: CurrencyCodeSchema,
});

export type Invoice = z.infer<typeof invoiceSchema>;
