import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';
import { z } from 'zod';
import { CurrencyCodeSchema, partySchema } from '../common';
import { paymentMeansSchema } from '../common/PaymentMeans';

const date = z.union([z.string(), z.date()]);

const invoicePeriodSchema = z.object({
    startDate: date.optional(),
    endDate: date.optional(),
    descriptionCode: z.enum(['3', '35', '432']),
});

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
});

export type Invoice = z.infer<typeof invoiceSchema>;
