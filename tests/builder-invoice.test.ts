import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';

describe('Invoices Builder', () => {
    let toolkit = new PeppolToolkit();

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should generate a non empty string', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(basicInvoice);
        expect(invoiceXML.length).toBeGreaterThan(0);
    });

    it('should return <Invoice> as indicator', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(basicInvoice);
        expect(invoiceXML).toContain('<Invoice');
        expect(invoiceXML).toContain(
            'xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"'
        );
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

    it('should always include payable amount even when it is zero', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            legalMonetaryTotal: {
                ...basicInvoice.legalMonetaryTotal,
                payableAmount: 0,
            },
        });

        expect(invoiceXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
    });

    it('should omit other zero monetary amounts when generateOnZero is false', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            legalMonetaryTotal: {
                ...basicInvoice.legalMonetaryTotal,
                payableAmount: 0,
                prepaidAmount: 0,
                allowanceTotalAmount: 0,
                chargeTotalAmount: 0,
                payableRoundingAmount: 0,
            },
        });

        expect(invoiceXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
        expect(invoiceXML).not.toContain('<cbc:PrepaidAmount');
        expect(invoiceXML).not.toContain('<cbc:AllowanceTotalAmount');
        expect(invoiceXML).not.toContain('<cbc:ChargeTotalAmount');
        expect(invoiceXML).not.toContain('<cbc:PayableRoundingAmount');
    });

    it('should not nest cac:Party inside specialized party nodes', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            payeeParty: {
                name: 'Payee Name',
            },
            taxRepresentativeParty: {
                name: 'Tax Rep',
                address: {
                    streetName: 'Tax Street',
                    cityName: 'Tax City',
                    postalZone: '1000',
                    country: 'BE',
                },
                taxScheme: {
                    companyId: 'BE0123456789',
                    schemeID: 'VAT',
                },
            },
        });

        expect(invoiceXML).toMatch(/<cac:PayeeParty>\s*<cac:PartyName>/);
        expect(invoiceXML).not.toMatch(/<cac:PayeeParty>\s*<cac:Party>/);
        expect(invoiceXML).toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:PartyName>/
        );
        expect(invoiceXML).not.toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:Party>/
        );
    });

    it('should build attachments inside line document references', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceLines: [
                {
                    ...basicInvoice.invoiceLines[0],
                    documentReference: {
                        id: 'LINE-DOC-1',
                        documentTypeCode: '916',
                        attachment: {
                            embeddedDocumentBinaryObject: 'SGVsbG8=',
                            mimeCode: 'text/plain',
                            filename: 'line.txt',
                            externalReference: 'https://example.com/line.txt',
                        },
                    },
                },
            ],
        });

        expect(invoiceXML).toContain('<cac:DocumentReference>');
        expect(invoiceXML).toContain('<cbc:ID>LINE-DOC-1</cbc:ID>');
        expect(invoiceXML).toContain(
            '<cbc:DocumentTypeCode>916</cbc:DocumentTypeCode>'
        );
        expect(invoiceXML).toContain('<cac:Attachment>');
        expect(invoiceXML).toContain(
            '<cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain" filename="line.txt">SGVsbG8=</cbc:EmbeddedDocumentBinaryObject>'
        );
        expect(invoiceXML).toContain('<cac:ExternalReference>');
        expect(invoiceXML).toContain(
            '<cbc:URI>https://example.com/line.txt</cbc:URI>'
        );
    });
});
