import z from 'zod';
import { partySchema } from '../common';
import { en16931CreditNoteSchema } from '../en16931/CreditNote';

/**
 * Peppol BIS Billing 3.0 credit note: an EN 16931 credit note whose seller and buyer have an
 * electronic address from the Peppol EAS code list.
 */
export const creditNoteSchema = en16931CreditNoteSchema.extend({
    seller: partySchema,
    buyer: partySchema,
});

export type CreditNote = z.infer<typeof creditNoteSchema>;
