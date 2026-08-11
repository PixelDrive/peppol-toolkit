import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';
import { comprehensiveInvoice } from './fixtures/comprehensive-invoice';

const publishedPeppolInvoice = readFileSync(
    new URL('./fixtures/peppol-vat-exempt-invoice.xml', import.meta.url),
    'utf8'
);

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
        expect(parsed.seller.endPoint.id).toBe(basicInvoice.seller.endPoint.id);
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

    it('should parse the published Peppol BIS Billing 3.0 VAT-exempt example', () => {
        const parsed = toolkit.peppolUBLToInvoice(publishedPeppolInvoice);

        expect(parsed).toMatchObject({
            ID: 'Vat-Z',
            issueDate: '2018-08-30',
            invoiceTypeCode: 380,
            documentCurrencyCode: 'GBP',
            buyerReference: 'test reference',
            seller: {
                endPoint: { scheme: '0088', id: '7300010000001' },
                address: { country: 'GB' },
                legalEntity: {
                    registrationName: 'The Sellercompany Incorporated',
                },
            },
            buyer: {
                endPoint: { scheme: '0184', id: 'DK12345678' },
                address: { countrySubentity: 'RegionB', country: 'DK' },
                legalEntity: { registrationName: 'The Buyercompany' },
            },
            paymentTermsNote: 'Payment within 30 days',
            taxTotal: [
                {
                    taxAmount: 0,
                    taxAmountCurrency: 'GBP',
                    subTotals: [
                        {
                            taxableAmount: 1200,
                            taxAmount: 0,
                            taxCategory: {
                                categoryCode: 'E',
                                percent: 0,
                                exemptionReasonCode: 'VATEX-EU-F',
                            },
                        },
                    ],
                },
            ],
            invoiceLines: [
                {
                    id: '1',
                    invoicedQuantity: 10,
                    unitCode: 'EA',
                    orderLineReference: '1',
                    standardItemIdentification: {
                        id: '192387129837129873',
                        schemeID: '0160',
                    },
                    taxCategory: { categoryCode: 'E', percent: 0 },
                },
            ],
        });
        expect(parsed.dueDate).toBeUndefined();
    });

    it('should preserve the published Peppol example through parse and generation', () => {
        const parsed = toolkit.peppolUBLToInvoice(publishedPeppolInvoice);
        const generated = toolkit.invoiceToPeppolUBL(parsed);

        expect(toolkit.peppolUBLToInvoice(generated)).toEqual(parsed);
    });

    it('should preserve all supported optional groups in a comprehensive round-trip', () => {
        const generated = toolkit.invoiceToPeppolUBL(comprehensiveInvoice);
        const parsed = toolkit.peppolUBLToInvoice(generated);

        expect(parsed).toMatchObject({
            note: comprehensiveInvoice.note,
            taxPointDate: comprehensiveInvoice.taxPointDate,
            taxCurrencyCode: comprehensiveInvoice.taxCurrencyCode,
            accountingCost: comprehensiveInvoice.accountingCost,
            invoicePeriod: comprehensiveInvoice.invoicePeriod,
            orderReference: comprehensiveInvoice.orderReference,
            billingReference: comprehensiveInvoice.billingReference,
            despatchDocumentReference:
                comprehensiveInvoice.despatchDocumentReference,
            receiptDocumentReference:
                comprehensiveInvoice.receiptDocumentReference,
            originatorDocumentReference:
                comprehensiveInvoice.originatorDocumentReference,
            contractDocumentReference:
                comprehensiveInvoice.contractDocumentReference,
            additionalDocumentReference:
                comprehensiveInvoice.additionalDocumentReference,
            projectReference: comprehensiveInvoice.projectReference,
            payeeParty: comprehensiveInvoice.payeeParty,
            taxRepresentativeParty: comprehensiveInvoice.taxRepresentativeParty,
            delivery: comprehensiveInvoice.delivery,
            paymentMeans: comprehensiveInvoice.paymentMeans,
            allowanceCharge: comprehensiveInvoice.allowanceCharge,
        });
        expect(parsed.taxTotal).toHaveLength(2);
        expect(parsed.taxTotal[1]).toEqual({
            taxAmount: 23,
            taxAmountCurrency: 'USD',
            subTotals: [],
        });
        expect(parsed.invoiceLines[0]).toMatchObject(
            comprehensiveInvoice.invoiceLines[0]
        );

        const regenerated = toolkit.invoiceToPeppolUBL(parsed);
        expect(toolkit.peppolUBLToInvoice(regenerated)).toEqual(parsed);
    });
});
