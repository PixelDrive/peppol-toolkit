import { beforeEach, describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';
import { fullInvoice } from './fixtures/full-documents';

function expectZodPath(fn: () => unknown, expectedPath: (string | number)[]) {
    let caught: unknown;
    try {
        fn();
    } catch (error) {
        caught = error;
    }
    expect(caught).toBeInstanceOf(ZodError);
    expect(
        (caught as ZodError).issues.map((issue) => issue.path)
    ).toContainEqual(expectedPath);
}

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

    it('should still parse received documents whose amounts have more than two decimals', () => {
        // Amount precision is only enforced when building documents, never when parsing them
        const xml = toolkit
            .invoiceToPeppolUBL(basicInvoice)
            .split('<cbc:TaxAmount currencyID="EUR">21.00</cbc:TaxAmount>')
            .join('<cbc:TaxAmount currencyID="EUR">21.005</cbc:TaxAmount>');
        expect(xml).toContain('21.005');
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.taxTotal[0].taxAmount).toBe(21.005);
        expect(parsed.taxTotal[0].subTotals[0].taxAmount).toBe(21.005);
    });

    it('should read back every supported element', () => {
        const xml = toolkit.invoiceToPeppolUBL(fullInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);

        // Building the parsed invoice again gives the same document
        expect(toolkit.invoiceToPeppolUBL(parsed)).toBe(xml);
        expect(parsed.invoiceLines[0].priceAllowanceCharge).toEqual(
            fullInvoice.invoiceLines[0].priceAllowanceCharge
        );
        expect(toolkit.en16931UBLToInvoice(xml)).toEqual(parsed);
    });

    describe('empty, missing, and repeated XML elements (#31)', () => {
        it('should reject empty elements with attributes instead of parsing "[object Object]"', () => {
            const baseXml = toolkit.invoiceToPeppolUBL(basicInvoice);

            const emptyEndpoint = baseXml.replace(
                '<cbc:EndpointID schemeID="9925">0732788874</cbc:EndpointID>',
                '<cbc:EndpointID schemeID="9925"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyEndpoint),
                ['seller', 'endPoint', 'id']
            );

            const emptyPartyId = baseXml.replace(
                '<cbc:ID>BE0732788874</cbc:ID>',
                '<cbc:ID schemeID="0088"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyPartyId),
                ['seller', 'identification', 0, 'id']
            );

            const emptyNote = toolkit
                .invoiceToPeppolUBL({
                    ...basicInvoice,
                    note: [{ content: 'Note', languageID: 'en' }],
                })
                .replace(
                    '<cbc:Note languageID="en">Note</cbc:Note>',
                    '<cbc:Note languageID="en"/>'
                );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyNote),
                ['note', 0, 'content']
            );

            const emptyCompanyId = baseXml.replace(
                '<cbc:CompanyID>0732788874</cbc:CompanyID>',
                '<cbc:CompanyID schemeID="0208"/>'
            );
            expect(
                toolkit.peppolUBLToInvoice(emptyCompanyId).seller.legalEntity
                    .companyId
            ).toBeUndefined();
        });

        it('should reject duplicate scalar elements instead of joining array values', () => {
            const duplicateId = toolkit
                .invoiceToPeppolUBL(basicInvoice)
                .replace(
                    '<cbc:ID>TEST-003</cbc:ID>',
                    '<cbc:ID>TEST-003</cbc:ID><cbc:ID>TEST-004</cbc:ID>'
                );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(duplicateId),
                ['ID']
            );
        });

        it('should reject missing LineExtensionAmount in LegalMonetaryTotal instead of defaulting to 0', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(basicInvoice)
                .replace(
                    /<cbc:LineExtensionAmount currencyID="EUR">100\.00<\/cbc:LineExtensionAmount>\s*<cbc:TaxExclusiveAmount/,
                    '<cbc:TaxExclusiveAmount'
                );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(xml),
                ['legalMonetaryTotal', 'lineExtensionAmount']
            );
        });

        it('should parse empty optional numeric elements as undefined instead of 0', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(fullInvoice)
                .replace(/<cbc:Percent>21<\/cbc:Percent>/g, '<cbc:Percent/>')
                .replace(
                    '<cbc:MultiplierFactorNumeric>10</cbc:MultiplierFactorNumeric>',
                    '<cbc:MultiplierFactorNumeric/>'
                )
                .replace(
                    '<cbc:MultiplierFactorNumeric>5</cbc:MultiplierFactorNumeric>',
                    '<cbc:MultiplierFactorNumeric/>'
                );
            const parsed = toolkit.peppolUBLToInvoice(xml);

            expect(
                parsed.taxTotal[0].subTotals[0].taxCategory.percent
            ).toBeUndefined();
            expect(parsed.taxTotal[0].subTotals[1].taxCategory.percent).toBe(0);
            expect(parsed.invoiceLines[0].taxCategory.percent).toBeUndefined();
            expect(
                parsed.allowanceCharge?.[0].taxCategory.percent
            ).toBeUndefined();
            expect(
                parsed.allowanceCharge?.[0].multiplierFactorNumeric
            ).toBeUndefined();
            expect(
                parsed.invoiceLines[0].allowanceCharge?.[0]
                    .multiplierFactorNumeric
            ).toBeUndefined();
        });

        it('should parse numeric elements that carry XML attributes', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(basicInvoice)
                .replace(
                    '<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>',
                    '<cbc:InvoiceTypeCode listID="UNCL1001">380</cbc:InvoiceTypeCode>'
                );
            expect(toolkit.peppolUBLToInvoice(xml).invoiceTypeCode).toBe(380);
        });

        it('should defer line allowanceCharge currency validation to the document schema', () => {
            const xml = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                invoiceLines: [
                    {
                        ...basicInvoice.invoiceLines[0],
                        allowanceCharge: [
                            { chargeIndicator: false, amount: 10 },
                        ],
                    },
                ],
            });

            const withoutCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.00</cbc:Amount>',
                '<cbc:Amount>10.00</cbc:Amount>'
            );
            expect(
                toolkit.peppolUBLToInvoice(withoutCurrency).invoiceLines[0]
                    .allowanceCharge?.[0].currency
            ).toBeUndefined();

            const invalidCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.00</cbc:Amount>',
                '<cbc:Amount currencyID="INVALID">10.00</cbc:Amount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(invalidCurrency),
                ['invoiceLines', 0, 'allowanceCharge', 0, 'currency']
            );
        });

        it('should preserve multiple cac:AddressLine elements', () => {
            const xml = toolkit
                .invoiceToPeppolUBL({
                    ...basicInvoice,
                    seller: {
                        ...basicInvoice.seller,
                        address: {
                            ...basicInvoice.seller.address,
                            addressLine: 'Third floor',
                        },
                    },
                })
                .replace(
                    '<cac:AddressLine>',
                    '<cac:AddressLine><cbc:Line>Building A</cbc:Line></cac:AddressLine><cac:AddressLine/><cac:AddressLine>'
                );

            expect(
                toolkit.peppolUBLToInvoice(xml).seller.address.addressLine
            ).toBe('Building A\nThird floor');
        });
    });
});
