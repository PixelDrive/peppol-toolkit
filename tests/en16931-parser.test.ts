import { beforeEach, describe, expect, it } from 'vitest';
import {
    detectUblProfile,
    exampleCreditNote,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
    exampleInvoice,
    PEPPOL_BIS3_CUSTOMIZATION_ID,
    PeppolToolkit,
} from '../src';
import {
    emailSeller,
    roundTripCreditNote,
    roundTripInvoice,
    sellerWithoutEndpoint,
    slovakBuyer,
} from './fixtures/en16931-documents';

function useAlternatePrefixes(xml: string, root: 'Invoice' | 'CreditNote') {
    return xml
        .replace(`<${root} `, `<ubl:${root} `)
        .replace(`</${root}>`, `</ubl:${root}>`)
        .replace(' xmlns="', ' xmlns:ubl="')
        .replace(/cbc:/g, 'basic:')
        .replace('xmlns:cbc=', 'xmlns:basic=')
        .replace(/cac:/g, 'aggregate:')
        .replace('xmlns:cac=', 'xmlns:aggregate=');
}

describe('EN 16931 parser', () => {
    let toolkit: PeppolToolkit;

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    describe('round trip', () => {
        it.each([
            ['buyer without electronic address', roundTripInvoice()],
            [
                'electronic addresses outside the Peppol EAS list',
                roundTripInvoice({ seller: emailSeller, buyer: slovakBuyer }),
            ],
            [
                'no electronic address at all',
                roundTripInvoice({ seller: sellerWithoutEndpoint }),
            ],
            [
                'a ProfileID',
                roundTripInvoice({ profileID: 'urn:example:profile:1.0' }),
            ],
        ])('invoice with %s', (_name, invoice) => {
            expect(
                toolkit.en16931UBLToInvoice(
                    toolkit.invoiceToEn16931UBL(invoice)
                )
            ).toEqual(invoice);
        });

        it.each([
            ['buyer without electronic address', roundTripCreditNote()],
            [
                'electronic addresses outside the Peppol EAS list',
                roundTripCreditNote({
                    seller: emailSeller,
                    buyer: slovakBuyer,
                }),
            ],
            [
                'no electronic address at all',
                roundTripCreditNote({ seller: sellerWithoutEndpoint }),
            ],
        ])('credit note with %s', (_name, creditNote) => {
            expect(
                toolkit.en16931UBLToCreditNote(
                    toolkit.creditNoteToEn16931UBL(creditNote)
                )
            ).toEqual(creditNote);
        });
    });

    it('reads a buyer without electronic address', () => {
        const xml = toolkit.invoiceToEn16931UBL(exampleEn16931Invoice);
        const invoice = toolkit.en16931UBLToInvoice(xml);

        expect(invoice.buyer.endPoint).toBeUndefined();
        expect(invoice.seller.endPoint).toEqual({
            scheme: '0208',
            id: '0732788874',
        });
    });

    it('reads an invoice with alternate UBL namespace prefixes', () => {
        const xml = toolkit.invoiceToEn16931UBL(exampleEn16931Invoice);
        const prefixedXml = useAlternatePrefixes(xml, 'Invoice');
        expect(detectUblProfile(prefixedXml)).toBe('en16931');
        expect(toolkit.en16931UBLToInvoice(prefixedXml)).toEqual(
            toolkit.en16931UBLToInvoice(xml)
        );
    });

    it('reads a credit note with alternate UBL namespace prefixes', () => {
        const xml = toolkit.creditNoteToEn16931UBL(exampleEn16931CreditNote);
        const prefixedXml = useAlternatePrefixes(xml, 'CreditNote');
        expect(detectUblProfile(prefixedXml)).toBe('en16931');
        expect(toolkit.en16931UBLToCreditNote(prefixedXml)).toEqual(
            toolkit.en16931UBLToCreditNote(xml)
        );
    });

    it('reads a payee party with an identifier', () => {
        const payeeParty = {
            name: 'Payee',
            identification: { id: '1234', schemeID: '0088' },
        };
        const xml = toolkit.invoiceToEn16931UBL({
            ...exampleEn16931Invoice,
            payeeParty,
        });
        expect(toolkit.en16931UBLToInvoice(xml).payeeParty).toEqual(payeeParty);
    });

    it('preserves note whitespace around XML comments and in CDATA', () => {
        const xml = toolkit
            .invoiceToEn16931UBL({
                ...exampleEn16931Invoice,
                note: [{ content: 'Example' }],
            })
            .replace(
                '>Example</cbc:Note>',
                '>Part A <!-- comment --> remains<![CDATA[ & more]]></cbc:Note>'
            );
        expect(toolkit.en16931UBLToInvoice(xml).note).toEqual([
            { content: 'Part A  remains & more' },
        ]);
    });

    it('accepts Peppol BIS documents', () => {
        const invoice = toolkit.en16931UBLToInvoice(
            toolkit.invoiceToPeppolUBL(exampleInvoice)
        );
        expect(invoice.customizationID).toBe(PEPPOL_BIS3_CUSTOMIZATION_ID);
        expect(invoice.buyer.endPoint).toEqual(exampleInvoice.buyer.endPoint);

        const creditNote = toolkit.en16931UBLToCreditNote(
            toolkit.creditNoteToPeppolUBL(exampleCreditNote)
        );
        expect(creditNote.customizationID).toBe(PEPPOL_BIS3_CUSTOMIZATION_ID);
        expect(creditNote.ID).toBe(exampleCreditNote.ID);
    });
});

describe('Peppol parser', () => {
    let toolkit: PeppolToolkit;

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('still rejects an invoice without buyer electronic address', () => {
        const xml = toolkit.invoiceToEn16931UBL(exampleEn16931Invoice);

        expect(() => toolkit.peppolUBLToInvoice(xml)).toThrow(/endPoint/);
        expect(toolkit.en16931UBLToInvoice(xml).ID).toBe(
            exampleEn16931Invoice.ID
        );
    });

    it('still rejects a credit note without buyer electronic address', () => {
        const xml = toolkit.creditNoteToEn16931UBL(exampleEn16931CreditNote);

        expect(() => toolkit.peppolUBLToCreditNote(xml)).toThrow(/endPoint/);
        expect(toolkit.en16931UBLToCreditNote(xml).ID).toBe(
            exampleEn16931CreditNote.ID
        );
    });

    it('still rejects an electronic address outside the Peppol EAS list', () => {
        const xml = toolkit.invoiceToEn16931UBL({
            ...exampleEn16931Invoice,
            seller: emailSeller,
            buyer: exampleInvoice.buyer,
        });

        expect(() => toolkit.peppolUBLToInvoice(xml)).toThrow(/scheme/);
    });
});
