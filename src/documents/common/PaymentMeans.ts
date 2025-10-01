import { z } from 'zod';
import { PaymentMeansCodeSchema } from './PaymentMeansCodes';
import { financialAccountSchema } from './FinancialAccount';

export const paymentMeansSchema = z.object({
    code: PaymentMeansCodeSchema,
    name: z.string().optional().describe('Payment means expressed as text'),
    paymentId: z.string().optional().describe('Used for reconciliation'),
    financialAccount: financialAccountSchema
        .optional()
        .describe('Credit transfer informations such as IBAN, BIC'),
    //TODO: add cardAccount and paymentMandate
});
