import z from 'zod';
import { invoiceSchema } from './Invoice';
import { CreditNoteTypeCodeSchema } from './CreditNoteTypeCodes';

export const creditNoteSchema = invoiceSchema
    .extend({
        customizationID: z
            .string()
            .default(
                'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0'
            ).optional(),
        profileID: z
            .string()
            .default('urn:fdc:peppol.eu:2017:poacc:billing:01:1.0').optional(),
        creditNoteTypeCode: CreditNoteTypeCodeSchema.default(381).optional(),
        creditNoteLines: invoiceSchema.shape.invoiceLines.min(1),
    })
    .omit({ invoiceTypeCode: true, invoiceLines: true });

export type CreditNote = z.infer<typeof creditNoteSchema>;
