import {
    CreditNote,
    EN16931_CUSTOMIZATION_ID,
    En16931CreditNote,
    En16931Invoice,
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
     * @throws TypeError when the seller or the buyer has no electronic address (`endPoint`)
     */
    public generatePeppolInvoice(invoice: Invoice) {
        this.__assertPeppolEndpoints(invoice, 'invoiceToEn16931UBL');
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
     * @throws TypeError when the seller or the buyer has no electronic address (`endPoint`)
     */
    public generatePeppolCreditNote(creditNote: CreditNote) {
        this.__assertPeppolEndpoints(creditNote, 'creditNoteToEn16931UBL');
        return this.__writer.writeCreditNote(creditNote, {
            customizationID:
                creditNote.customizationID ?? PEPPOL_BIS3_CUSTOMIZATION_ID,
            profileID: creditNote.profileID ?? PEPPOL_BIS3_PROFILE_ID,
        });
    }

    /***
     * Generates an EN 16931 invoice (core model, without the Peppol CIUS) from the given invoice
     * data, for invoices that do not travel over Peppol: for example to a consumer, or to a party
     * without a Peppol electronic address.
     *
     * The CustomizationID is always `urn:cen.eu:en16931:2017` (`invoice.customizationID` is
     * ignored). The ProfileID is only written when `invoice.profileID` is given.
     * @param invoice The invoice data
     * @returns The EN 16931 invoice XML document as a string
     */
    public generateEn16931Invoice(invoice: En16931Invoice) {
        return this.__writer.writeInvoice(invoice, {
            customizationID: EN16931_CUSTOMIZATION_ID,
            profileID: invoice.profileID,
        });
    }

    /***
     * Generates an EN 16931 credit note (core model, without the Peppol CIUS) from the given credit
     * note data, for credit notes that do not travel over Peppol.
     *
     * The CustomizationID is always `urn:cen.eu:en16931:2017` (`creditNote.customizationID` is
     * ignored). The ProfileID is only written when `creditNote.profileID` is given.
     * @param creditNote The credit note data
     * @returns The EN 16931 credit note XML document as a string
     */
    public generateEn16931CreditNote(creditNote: En16931CreditNote) {
        return this.__writer.writeCreditNote(creditNote, {
            customizationID: EN16931_CUSTOMIZATION_ID,
            profileID: creditNote.profileID,
        });
    }

    /**
     * Peppol BIS requires the electronic address of the seller (BT-34, PEPPOL-EN16931-R020) and of
     * the buyer (BT-49, PEPPOL-EN16931-R010). The Peppol types already require `endPoint`; this
     * check covers untyped input, which the shared writer would otherwise serialize without
     * cbc:EndpointID.
     * @param document The invoice or credit note data
     * @param en16931Alternative The toolkit method building the same document as EN 16931
     */
    private __assertPeppolEndpoints(
        document: Pick<Invoice, 'seller' | 'buyer'>,
        en16931Alternative: string
    ) {
        const parties = [
            ['seller', document.seller, 'BT-34, PEPPOL-EN16931-R020'],
            ['buyer', document.buyer, 'BT-49, PEPPOL-EN16931-R010'],
        ] as const;
        for (const [role, party, rule] of parties) {
            if (!party.endPoint) {
                throw new TypeError(
                    `Missing ${role}.endPoint: Peppol BIS requires the ${role} electronic address (${rule}). ` +
                        `Documents that do not travel over Peppol can be built as EN 16931 documents with ${en16931Alternative}.`
                );
            }
        }
    }
}
