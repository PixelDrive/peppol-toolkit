import { describe, expect, it } from 'vitest';
import {
    detectUblProfile,
    EN16931_CUSTOMIZATION_ID,
    exampleCreditNote,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
    exampleInvoice,
    PEPPOL_BIS3_CUSTOMIZATION_ID,
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

    it('recognizes a document starting with a UTF-8 BOM or whitespace', () => {
        const xml = toolkit.invoiceToPeppolUBL(exampleInvoice);
        expect(detectUblProfile(`\uFEFF${xml}`)).toBe('peppol-bis3');
        expect(detectUblProfile(`\n  ${xml}`)).toBe('peppol-bis3');
    });

    it('recognizes CustomizationID declared in the default namespace locally', () => {
        const xml = invoiceWithCustomizationID(EN16931_CUSTOMIZATION_ID)
            .replace(
                '<cbc:CustomizationID>',
                '<CustomizationID xmlns="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">'
            )
            .replace('</cbc:CustomizationID>', '</CustomizationID>');
        expect(detectUblProfile(xml)).toBe('en16931');
    });

    const peppolXml = invoiceWithCustomizationID(PEPPOL_BIS3_CUSTOMIZATION_ID);

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
        ['a missing closing root tag', peppolXml.replace('</Invoice>', '')],
        ['two XML roots', `${peppolXml}<Invoice/>`],
        [
            'Invoice in a different namespace',
            peppolXml.replace(
                'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                'urn:example:invoice'
            ),
        ],
        [
            'CustomizationID in a locally rebound namespace',
            peppolXml.replace(
                '<cbc:CustomizationID>',
                '<cbc:CustomizationID xmlns:cbc="urn:example:customization">'
            ),
        ],
        [
            'a nested CustomizationID',
            peppolXml
                .replace(
                    '<cbc:CustomizationID>',
                    '<Other><cbc:CustomizationID>'
                )
                .replace(
                    '</cbc:CustomizationID>',
                    '</cbc:CustomizationID></Other>'
                ),
        ],
    ])('returns unknown for %s', (_name, xml) => {
        expect(detectUblProfile(xml)).toBe('unknown');
    });

    it('is available on PeppolToolkit', () => {
        expect(PeppolToolkit.detectUblProfile).toBe(detectUblProfile);
    });
});
