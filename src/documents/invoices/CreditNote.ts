import z from 'zod';
import { invoiceSchema } from './Invoice';
import { CreditNoteTypeCodeSchema } from './CreditNoteTypeCodes';
import { date } from '../common';


const billingReference = z.object({
    invoiceDocReference: z.object({
        id: z.string(),
        issueDate: date.optional()
    })
}).optional();

export const creditNoteSchema = invoiceSchema
    .extend({
        customizationID: z.string().optional(),
        profileID: z.string().optional(),
        creditNoteTypeCode: CreditNoteTypeCodeSchema.default(381).optional(),
        creditNoteLines: invoiceSchema.shape.invoiceLines.min(1),
        billingReference: billingReference,
    })
    .omit({ invoiceTypeCode: true, invoiceLines: true, dueDate: true });

export type CreditNote = z.infer<typeof creditNoteSchema>;
