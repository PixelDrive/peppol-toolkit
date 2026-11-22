import z from 'zod';
import { en16931CreditNoteSchema } from '../en16931/CreditNote';
import { CreditNoteTypeCodeSchema } from './CreditNoteTypeCodes';
import { invoiceSchema } from './Invoice';

/**
 * Peppol BIS Billing 3.0 credit note: an EN 16931 credit note whose seller and buyer have an
 * electronic address from the Peppol EAS code list.
 */
export const creditNoteSchema = en16931CreditNoteSchema.extend({
    creditNoteTypeCode: CreditNoteTypeCodeSchema,
    seller: invoiceSchema.shape.seller,
    buyer: invoiceSchema.shape.buyer,
});

export type CreditNote = z.infer<typeof creditNoteSchema>;
