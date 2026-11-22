import { z } from 'zod';
import { lineSchema } from '../common/Line';
import { partySchema } from '../common/Parties';
import { taxTotalSchema } from '../common/TaxTotal';
import { en16931InvoiceSchema } from '../en16931/Invoice';
import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';

/**
 * Peppol BIS Billing 3.0 invoice: an EN 16931 invoice whose seller and buyer have an electronic
 * address from the Peppol EAS code list.
 */
export const invoiceSchema = en16931InvoiceSchema.extend({
    invoiceTypeCode: InvoiceTypeCodeSchema,
    seller: partySchema,
    buyer: partySchema,
    taxTotal: z.array(taxTotalSchema).min(1).max(2),
    invoiceLines: z.array(lineSchema).min(1),
});

export type Invoice = z.infer<typeof invoiceSchema>;
