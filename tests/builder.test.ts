import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicInvoice } from './data/basic-invoice';
import { Schema } from 'node-schematron';

describe('InvoicesBuilder', () => {
    let toolkit = new PeppolToolkit();

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

    it('should generate a valid UBL invoice', async () => {
        const response = await fetch(
            'https://docs.peppol.eu/poacc/billing/3.0/files/PEPPOL-EN16931-UBL.sch'
        );
        const data = await response.text();

        const schema = Schema.fromString(data);
        const results = schema.validateString(
            toolkit.invoiceToPeppolUBL(basicInvoice),
            { debug: true }
        );
        console.info(results);
        expect(results.length).toBe(0);
    });
});
