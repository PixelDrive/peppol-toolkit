import { z } from 'zod';

export const financialAccountSchema = z.object({
    id: z.string().describe('Payment account identifier like IBAN or BBAN'),
    name: z
        .string()
        .optional()
        .describe('Name of the account to which the payment should be made'),
    financialInstitutionBranch: z
        .string()
        .optional()
        .describe('BIC or other clearing code'),
});
