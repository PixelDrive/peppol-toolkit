import z from 'zod';
import { invoiceSchema } from './Invoice';
import { CreditNoteTypeCodeSchema } from './CreditNoteTypeCodes';

export const creditNoteSchema = invoiceSchema
    .extend({
        customizationID: z.optional(
            z.literal(
                'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0'
            )
        ),
        profileID: z.optional(
            z.literal('urn:fdc:peppol.eu:2017:poacc:billing:01:1.0')
        ),
        creditNoteTypeCode: CreditNoteTypeCodeSchema,
        creditNoteLines: invoiceSchema.shape.invoiceLines.min(1),
    })
    .omit({ invoiceTypeCode: true, invoiceLines: true });

export type CreditNote = z.infer<typeof creditNoteSchema>;
