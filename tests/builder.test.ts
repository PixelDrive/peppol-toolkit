import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';
import { basicCreditNote } from '../src/data/basic-creditNote';

describe('InvoicesBuilder', () => {
    let toolkit = new PeppolToolkit();

    describe('Peppol Invoice', () => {
        beforeEach(() => {
            toolkit = new PeppolToolkit();
        });

        it('should generate a non empty string', () => {
            const invoiceXML = toolkit.invoiceToPeppolUBL(basicInvoice);
            console.log(invoiceXML);
            expect(invoiceXML.length).toBeGreaterThan(0);
        });

        it('should work with different invoice type codes', () => {
            const invoiceXML1 = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                invoiceTypeCode: 71,
            });

            const invoiceXML2 = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                invoiceTypeCode: 383,
            });

            expect(invoiceXML1).toContain(
                '<cbc:InvoiceTypeCode>71</cbc:InvoiceTypeCode>'
            );
            expect(invoiceXML2).toContain(
                '<cbc:InvoiceTypeCode>383</cbc:InvoiceTypeCode>'
            );
        });

        it('should work with currency codes', () => {
            const invoiceXML = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                documentCurrencyCode: 'USD',
            });

            expect(invoiceXML.length).toBeGreaterThan(0);
            expect(invoiceXML).toContain(
                '<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>'
            );
        });

        it('should return default profileId and customizationId', () => {
            const invoiceXML1 = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
            });

            expect(invoiceXML1).toContain(
                '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>'
            );
            expect(invoiceXML1).toContain(
                '<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
            );
        });
    });

    describe('Peppol Credit Note', () => {
        beforeEach(() => {
            toolkit = new PeppolToolkit();
        });

        it('should generate a non empty string', () => {
            const invoiceXML = toolkit.creditNoteToPeppolUBL(basicCreditNote);
            console.log(invoiceXML);
            expect(invoiceXML.length).toBeGreaterThan(0);
        });

        it('should work with different credit-note type codes', () => {
            const invoiceXML1 = toolkit.creditNoteToPeppolUBL({
                ...basicCreditNote,
                creditNoteTypeCode: 381,
            });

            const invoiceXML2 = toolkit.creditNoteToPeppolUBL({
                ...basicCreditNote,
                creditNoteTypeCode: 261,
            });

            expect(invoiceXML1).toContain(
                '<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>'
            );
            expect(invoiceXML2).toContain(
                '<cbc:CreditNoteTypeCode>261</cbc:CreditNoteTypeCode>'
            );
        });

        it('should work with currency codes', () => {
            const invoiceXML = toolkit.creditNoteToPeppolUBL({
                ...basicCreditNote,
                documentCurrencyCode: 'USD',
            });

            expect(invoiceXML.length).toBeGreaterThan(0);
            expect(invoiceXML).toContain(
                '<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>'
            );
        });

         it('should return default profileId and customizationId', () => {
            const invoiceXML1 = toolkit.creditNoteToPeppolUBL({
                ...basicCreditNote,
            });

            expect(invoiceXML1).toContain(
                '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>'
            );
            expect(invoiceXML1).toContain(
                '<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
            );
        });
    });
});
