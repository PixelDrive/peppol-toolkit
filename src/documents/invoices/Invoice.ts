import { z } from 'zod';
import { partySchema } from '../common';
import { en16931InvoiceSchema } from '../en16931/Invoice';

/**
 * Peppol BIS Billing 3.0 invoice: an EN 16931 invoice whose seller and buyer have an electronic
 * address from the Peppol EAS code list.
 */
export const invoiceSchema = en16931InvoiceSchema.extend({
    seller: partySchema,
    buyer: partySchema,
});

export type Invoice = z.infer<typeof invoiceSchema>;
