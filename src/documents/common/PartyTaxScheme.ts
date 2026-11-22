import { z } from 'zod';

export const partyTaxSchemeSchema = z.object({
    companyId: z.string().min(1),
    schemeID: z.string().min(1).optional(),
});
