import {
    CreditNote,
    Invoice,
    PEPPOL_BIS3_CUSTOMIZATION_ID,
    PEPPOL_BIS3_PROFILE_ID,
} from '../documents';
import { UblDocumentWriter } from './UblDocumentWriter';

export class DocumentBuilder {
    private __writer = new UblDocumentWriter();

    /***
     * Generates a Peppol invoice from the given invoice data
     * @param invoice The invoice data
     * @returns The Peppol invoice XML document as a string
     */
    public generatePeppolInvoice(invoice: Invoice) {
        return this.__writer.writeInvoice(invoice, {
            customizationID:
                invoice.customizationID ?? PEPPOL_BIS3_CUSTOMIZATION_ID,
            profileID: invoice.profileID ?? PEPPOL_BIS3_PROFILE_ID,
        });
    }

    /***
     * Generates a Peppol credit note from the given credit note data
     * @param creditNote The credit note data
     * @returns The Peppol credit note XML document as a string
     */
    public generatePeppolCreditNote(creditNote: CreditNote) {
        return this.__writer.writeCreditNote(creditNote, {
            customizationID:
                creditNote.customizationID ?? PEPPOL_BIS3_CUSTOMIZATION_ID,
            profileID: creditNote.profileID ?? PEPPOL_BIS3_PROFILE_ID,
        });
    }
}
