import { describe, expect, it } from 'vitest';
import {
    detectUblProfile,
    exampleCreditNote,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
    exampleInvoice,
    PeppolToolkit,
} from '../src';

const toolkit = new PeppolToolkit();

function invoiceWithCustomizationID(customizationID: string) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>${customizationID}</cbc:CustomizationID>
</Invoice>`;
}

describe('detectUblProfile', () => {
    it('recognizes Peppol BIS documents', () => {
        expect(
            detectUblProfile(toolkit.invoiceToPeppolUBL(exampleInvoice))
        ).toBe('peppol-bis3');
        expect(
            detectUblProfile(toolkit.creditNoteToPeppolUBL(exampleCreditNote))
        ).toBe('peppol-bis3');
    });

    it('recognizes EN 16931 documents', () => {
        expect(
            detectUblProfile(toolkit.invoiceToEn16931UBL(exampleEn16931Invoice))
        ).toBe('en16931');
        expect(
            detectUblProfile(
                toolkit.creditNoteToEn16931UBL(exampleEn16931CreditNote)
            )
        ).toBe('en16931');
    });

    it('recognizes Peppol BIS extensions', () => {
        expect(
            detectUblProfile(
                invoiceWithCustomizationID(
                    'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0#conformant#urn:example:extension'
                )
            )
        ).toBe('peppol-bis3');
    });

    it('recognizes a root element with a namespace prefix', () => {
        const xml = `<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
            xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
            <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
        </ubl:Invoice>`;
        expect(detectUblProfile(xml)).toBe('en16931');
    });

    it.each([
        [
            'another CIUS (XRechnung)',
            invoiceWithCustomizationID(
                'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0'
            ),
        ],
        [
            'an identifier only starting like the Peppol one',
            invoiceWithCustomizationID(
                'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.01'
            ),
        ],
        [
            'Peppol BIS Self-Billing',
            invoiceWithCustomizationID(
                'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:selfbilling:3.0'
            ),
        ],
        ['an empty CustomizationID', invoiceWithCustomizationID('')],
        [
            'a document without CustomizationID',
            '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"/>',
        ],
        [
            'another root element',
            '<Order><CustomizationID>urn:cen.eu:en16931:2017</CustomizationID></Order>',
        ],
        ['text that is not XML', 'not xml'],
        ['malformed XML', '<<<'],
    ])('returns unknown for %s', (_name, xml) => {
        expect(detectUblProfile(xml)).toBe('unknown');
    });

    it('is available on PeppolToolkit', () => {
        expect(PeppolToolkit.detectUblProfile).toBe(detectUblProfile);
    });
});
