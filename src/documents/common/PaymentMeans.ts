import { z } from 'zod';
import { PaymentMeansCodeSchema } from './PaymentMeansCodes';
import { financialAccountSchema } from './FinancialAccount';
import { date } from './Date';

export const cardAccountSchema = z.object({
    /** Primary Account Number (PAN) of the card used for payment (BT-87) */
    primaryAccountNumberId: z.string().min(1),
    /** Network ID of the card — syntax required element not related to a business term */
    networkId: z.string().min(1),
    /** Name of the payment card holder (BT-88) */
    holderName: z.string().optional(),
});

export const paymentMandateSchema = z.object({
    /** Mandate reference identifier (BT-89) */
    id: z.string().optional(),
    /** Debited account identifier (BT-91) */
    payerFinancialAccountId: z.string().optional(),
});

export const paymentMeansSchema = z.object({
    code: PaymentMeansCodeSchema,
    name: z.string().optional().describe('Payment means expressed as text'),
    paymentDueDate: date.optional().describe('Payment due date (used in credit notes)'),
    paymentId: z.string().optional().describe('Used for reconciliation'),
    financialAccount: financialAccountSchema
        .optional()
        .describe('Credit transfer informations such as IBAN, BIC'),
    cardAccount: cardAccountSchema.optional().describe('Payment card information (BG-18)'),
    paymentMandate: paymentMandateSchema.optional().describe('Direct debit mandate (BG-19)'),
});
