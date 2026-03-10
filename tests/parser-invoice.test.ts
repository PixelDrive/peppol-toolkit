import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';

describe('Invoice Parser', () => {
    let toolkit: PeppolToolkit;

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should parse a generated invoice back into an Invoice object', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed).toBeDefined();
        expect(parsed.ID).toBe(basicInvoice.ID);
    });

    it('should preserve the invoice ID', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.ID).toBe('TEST-003');
    });

    it('should preserve the issue date', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.issueDate).toBe('2024-01-01');
    });

    it('should preserve the due date', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.dueDate).toBe('2024-01-31');
    });

    it('should preserve the invoice type code', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.invoiceTypeCode).toBe(380);
    });

    it('should preserve the document currency code', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.documentCurrencyCode).toBe('EUR');
    });

    it('should preserve the buyer reference', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.buyerReference).toBe(basicInvoice.buyerReference);
    });

    it('should include the default customization and profile IDs', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.customizationID).toBe(
            'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0'
        );
        expect(parsed.profileID).toBe(
            'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
        );
    });

    it('should preserve seller information', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.seller.endPoint.id).toBe(
            basicInvoice.seller.endPoint.id
        );
        expect(parsed.seller.endPoint.scheme).toBe(
            basicInvoice.seller.endPoint.scheme
        );
        expect(parsed.seller.legalEntity.registrationName).toBe(
            basicInvoice.seller.legalEntity.registrationName
        );
        expect(parsed.seller.address.country).toBe(
            basicInvoice.seller.address.country
        );
    });

    it('should preserve buyer information', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.buyer.endPoint.id).toBe(basicInvoice.buyer.endPoint.id);
        expect(parsed.buyer.legalEntity.registrationName).toBe(
            basicInvoice.buyer.legalEntity.registrationName
        );
        expect(parsed.buyer.legalEntity.legalForm).toBe(
            basicInvoice.buyer.legalEntity.legalForm
        );
    });

    it('should preserve payment means', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.paymentMeans).toBeDefined();
        expect(parsed.paymentMeans![0].code).toBe('30');
        expect(parsed.paymentMeans![0].financialAccount?.id).toBe(
            basicInvoice.paymentMeans![0].financialAccount!.id
        );
    });

    it('should preserve payment terms note', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.paymentTermsNote).toBe(basicInvoice.paymentTermsNote);
    });

    it('should preserve tax total', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.taxTotal[0].taxAmount).toBe(21);
        expect(parsed.taxTotal[0].taxAmountCurrency).toBe('EUR');
        expect(parsed.taxTotal[0].subTotals[0].taxCategory.categoryCode).toBe(
            'S'
        );
        expect(parsed.taxTotal[0].subTotals[0].taxCategory.percent).toBe(21);
    });

    it('should preserve legal monetary total', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.legalMonetaryTotal.lineExtensionAmount).toBe(100);
        expect(parsed.legalMonetaryTotal.taxExclusiveAmount).toBe(100);
        expect(parsed.legalMonetaryTotal.taxInclusiveAmount).toBe(121);
        expect(parsed.legalMonetaryTotal.payableAmount).toBe(121);
    });

    it('should preserve invoice lines', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.invoiceLines).toHaveLength(1);
        expect(parsed.invoiceLines[0].id).toBe('1');
        expect(parsed.invoiceLines[0].name).toBe('Petit poney');
        expect(parsed.invoiceLines[0].invoicedQuantity).toBe(1);
        expect(parsed.invoiceLines[0].lineExtensionAmount).toBe(100);
        expect(parsed.invoiceLines[0].price).toBe(100);
        expect(parsed.invoiceLines[0].currency).toBe('EUR');
        expect(parsed.invoiceLines[0].unitCode).toBe('H67');
        expect(parsed.invoiceLines[0].taxCategory.categoryCode).toBe('S');
        expect(parsed.invoiceLines[0].taxCategory.percent).toBe(21);
    });

    it('should produce identical XML on a round-trip (build → parse → build)', () => {
        const xml1 = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml1);
        const xml2 = toolkit.invoiceToPeppolUBL(parsed);
        expect(xml2).toBe(xml1);
    });

    it('should throw an error for non-Invoice XML', () => {
        expect(() =>
            toolkit.peppolUBLToInvoice('<CreditNote></CreditNote>')
        ).toThrow('Not a valid UBL Invoice document');
    });

    it('should work with a different invoice type code', () => {
        const xml = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceTypeCode: 383,
        });
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.invoiceTypeCode).toBe(383);
    });

    it('should work without an optional due date', () => {
        const invoice = { ...basicInvoice };
        delete (invoice as Partial<typeof basicInvoice>).dueDate;
        const xml = toolkit.invoiceToPeppolUBL(invoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.dueDate).toBeUndefined();
    });
});
