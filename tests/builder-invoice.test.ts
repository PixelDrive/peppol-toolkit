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
        expect(invoiceXML.data.length).toBeGreaterThan(0);
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

        expect(invoiceXML1.data).toContain(
            '<cbc:InvoiceTypeCode>71</cbc:InvoiceTypeCode>'
        );
        expect(invoiceXML2.data).toContain(
            '<cbc:InvoiceTypeCode>383</cbc:InvoiceTypeCode>'
        );
    });

    it('should work with currency codes', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            documentCurrencyCode: 'USD',
        });

        expect(invoiceXML.data.length).toBeGreaterThan(0);
        expect(invoiceXML.data).toContain(
            '<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>'
        );
    });

    it('should return default profileId and customizationId', () => {
        const invoiceXML1 = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
        });

        expect(invoiceXML1.data).toContain(
            '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>'
        );
        expect(invoiceXML1.data).toContain(
            '<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
        );
    });

    it('should return error if invoice-type-code in data is not supported', () => {
        const invoiceXML1 = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceTypeCode: 290,
        });

        expect(invoiceXML1.success).toBeFalsy();
        expect(invoiceXML1.message).toContain('Invalid InvoiceTypeCode');
    });
});
