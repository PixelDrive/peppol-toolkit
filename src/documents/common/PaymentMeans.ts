import { z } from 'zod';
import { PaymentMeansCodeSchema } from './PaymentMeansCodes';
import { financialAccountSchema } from './FinancialAccount';
import { date } from './Date';

export const paymentMeansSchema = z.object({
    code: PaymentMeansCodeSchema,
    name: z.string().optional().describe('Payment means expressed as text'),
    paymentDueDate: date.optional().describe('Payment due date (used in credit notes)'),
    paymentId: z.string().optional().describe('Used for reconciliation'),
    financialAccount: financialAccountSchema
        .optional()
        .describe('Credit transfer informations such as IBAN, BIC'),
    //TODO: add cardAccount and paymentMandate
});
