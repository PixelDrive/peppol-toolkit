import { z } from 'zod';
import { date } from './Date';

export const invoicePeriodSchema = z.object({
    startDate: date.optional(),
    endDate: date.optional(),
    descriptionCode: z.enum(['3', '35', '432']),
});
