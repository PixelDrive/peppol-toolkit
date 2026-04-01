import z from 'zod';
import { invoiceSchema } from './Invoice';
import { CreditNoteTypeCodeSchema } from './CreditNoteTypeCodes';

export const creditNoteSchema = invoiceSchema
    .extend({
        customizationID: z.string().optional(),
        profileID: z.string().optional(),
        creditNoteTypeCode: CreditNoteTypeCodeSchema,
        creditNoteLines: invoiceSchema.shape.invoiceLines.min(1),
    })
    .omit({ invoiceTypeCode: true, invoiceLines: true, dueDate: true, projectReference: true });

export type CreditNote = z.infer<typeof creditNoteSchema>;
