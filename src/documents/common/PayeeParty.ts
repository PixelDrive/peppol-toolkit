import { z } from 'zod';

/**
 * Payee party (BG-10) — used when the payee differs from the seller.
 * @see https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-PayeeParty/
 */
export const payeePartySchema = z.object({
    /** PartyIdentification (0..1) — payee identifier or bank-assigned creditor identifier */
    identification: z
        .object({
            id: z.string().min(1),
            schemeID: z.string().min(1).optional(),
        })
        .optional(),
    /** PartyName — payee name (mandatory) */
    name: z.string().min(1),
    /** PartyLegalEntity (0..1) — payee legal registration identifier */
    legalEntity: z
        .object({
            companyId: z
                .object({
                    id: z.string().min(1),
                    schemeID: z.string().min(1).optional(),
                })
                .optional(),
        })
        .optional(),
});

export type PayeeParty = z.infer<typeof payeePartySchema>;
