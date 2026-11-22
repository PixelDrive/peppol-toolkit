import z from 'zod';
import { en16931InvoiceSchema } from './Invoice';
import { CreditNoteTypeCodeSchema } from '../invoices/CreditNoteTypeCodes';

/**
 * Credit note following the EN 16931 core model, without the Peppol CIUS: the seller and the
 * buyer may have no electronic address.
 *
 * The Peppol `creditNoteSchema` extends this schema, so every Peppol credit note is also an
 * EN 16931 credit note.
 */
export const en16931CreditNoteSchema = en16931InvoiceSchema
    .extend({
        customizationID: z.string().optional(),
        profileID: z.string().optional(),
        creditNoteTypeCode: CreditNoteTypeCodeSchema,
        creditNoteLines: en16931InvoiceSchema.shape.invoiceLines.min(1),
    })
    .omit({
        invoiceTypeCode: true,
        invoiceLines: true,
        dueDate: true,
        projectReference: true,
    });

export type En16931CreditNote = z.infer<typeof en16931CreditNoteSchema>;
