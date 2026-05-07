import { z } from 'zod';
import { addressSchema } from './AdressSchema';

/**
 * Seller tax representative party (BG-11) — required when the seller
 * has a tax representative in the country of the buyer.
 * @see https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxRepresentativeParty/
 */
export const taxRepresentativePartySchema = z.object({
    /** Tax representative name (mandatory) */
    name: z.string().min(1),
    /** Tax representative postal address (mandatory) */
    address: addressSchema,
});

export type TaxRepresentativeParty = z.infer<typeof taxRepresentativePartySchema>;
