import { z } from 'zod';
import { buyerPartySchema, partySchema } from '../common/Parties';
import { en16931InvoiceSchema } from '../en16931/Invoice';
import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';

/**
 * Peppol BIS Billing 3.0 invoice: an EN 16931 invoice whose seller and buyer have an electronic
 * address from the Peppol EAS code list.
 */
export const invoiceSchema = en16931InvoiceSchema.extend({
    invoiceTypeCode: InvoiceTypeCodeSchema,
    seller: partySchema,
    buyer: buyerPartySchema,
});

export type Invoice = z.infer<typeof invoiceSchema>;
