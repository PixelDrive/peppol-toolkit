import { z } from 'zod';
import { date } from './Date';

export const lineSchema = z.object({
    id: z.string().min(1),
    note: z.string().optional(),
    invoicedQuantity: z.number().min(0),
    lineExtensionAmount: z.number().min(0),
    accountingCost: z.string().optional(),
    invoicePeriod: z
        .object({
            startDate: date.optional(),
            endDate: date.optional(),
        })
        .optional(),
    orderLineReference: z.string().optional(),
    documentReference: z.string().optional(),
});
