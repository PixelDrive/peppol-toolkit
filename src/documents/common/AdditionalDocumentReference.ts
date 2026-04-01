import { z } from 'zod';

/**
 * Additional supporting document reference (BG-24)
 * @see https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AdditionalDocumentReference/
 */
export const additionalDocumentReferenceSchema = z.object({
    /** Document identifier (BT-18, BT-122) */
    id: z.string().min(1),
    /** Scheme identifier for the document ID */
    schemeID: z.string().optional(),
    /** Code "130" for invoice object reference, "50" for project reference */
    documentTypeCode: z.string().optional(),
    /** Description of the supporting document */
    documentDescription: z.string().optional(),
    /** Embedded document attachment */
    attachment: z
        .object({
            /** Base64 encoded embedded document */
            embeddedDocumentBinaryObject: z.string().optional(),
            /** MIME type of the embedded document */
            mimeCode: z.string().optional(),
            /** File name of the attached document */
            filename: z.string().optional(),
            /** External document URL */
            externalReference: z.string().optional(),
        })
        .optional(),
});
