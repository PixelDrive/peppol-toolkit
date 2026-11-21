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

    it('should generate the same XML for issue dates supplied as strings or Date objects', () => {
        const invoiceWithStringDate = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            issueDate: '2026-05-15',
        });
        const invoiceWithDateObject = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            issueDate: new Date(2026, 4, 15),
        });

        expect(invoiceWithDateObject).toContain(
            '<cbc:IssueDate>2026-05-15</cbc:IssueDate>'
        );
        expect(invoiceWithDateObject).toBe(invoiceWithStringDate);
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

    it('should preserve line price precision in PriceAmount', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceLines: [
                {
                    ...basicInvoice.invoiceLines[0],
                    price: 10.129,
                },
            ],
        });

        expect(invoiceXML).toContain(
            '<cbc:PriceAmount currencyID="EUR">10.129</cbc:PriceAmount>'
        );
    });

    describe('amount precision', () => {
        it('should accept a line price with more than two decimals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    invoiceLines: [
                        { ...basicInvoice.invoiceLines[0], price: 33.333 },
                    ],
                })
            ).not.toThrow();
        });

        it('should reject a tax sub total amount with more than two decimals', () => {
            // 250.50 × 21 / 100 = 52.605, recomputed by the caller without rounding
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    taxTotal: [
                        {
                            taxAmount: 52.61,
                            taxAmountCurrency: 'EUR',
                            subTotals: [
                                {
                                    taxableAmount: 250.5,
                                    taxAmount: 52.605,
                                    taxCategory: {
                                        categoryCode: 'S',
                                        percent: 21,
                                    },
                                },
                            ],
                        },
                    ],
                })
            ).toThrow(
                'Invalid amount for "taxTotal[0].subTotals[0].taxAmount": 52.605 has more than 2 decimal places'
            );
        });

        it('should reject a tax total amount with more than two decimals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    taxTotal: [
                        { ...basicInvoice.taxTotal[0], taxAmount: 21.005 },
                    ],
                })
            ).toThrow('Invalid amount for "taxTotal[0].taxAmount"');
        });

        it('should reject a taxable amount with more than two decimals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    taxTotal: [
                        {
                            ...basicInvoice.taxTotal[0],
                            subTotals: [
                                {
                                    ...basicInvoice.taxTotal[0].subTotals[0],
                                    taxableAmount: 100.001,
                                },
                            ],
                        },
                    ],
                })
            ).toThrow(
                'Invalid amount for "taxTotal[0].subTotals[0].taxableAmount"'
            );
        });

        it('should reject legal monetary total amounts with more than two decimals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    legalMonetaryTotal: {
                        ...basicInvoice.legalMonetaryTotal,
                        payableAmount: 121.005,
                    },
                })
            ).toThrow(
                'Invalid amount for "legalMonetaryTotal.payableAmount": 121.005'
            );

            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    legalMonetaryTotal: {
                        ...basicInvoice.legalMonetaryTotal,
                        prepaidAmount: 0.001,
                    },
                })
            ).toThrow('Invalid amount for "legalMonetaryTotal.prepaidAmount"');
        });

        it('should reject a line extension amount with more than two decimals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    invoiceLines: [
                        {
                            ...basicInvoice.invoiceLines[0],
                            lineExtensionAmount: 99.999,
                        },
                    ],
                })
            ).toThrow(
                'Invalid amount for "invoiceLines[0].lineExtensionAmount"'
            );
        });

        it('should reject allowance/charge amounts with more than two decimals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    allowanceCharge: [
                        {
                            chargeIndicator: false,
                            amount: 5.125,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                })
            ).toThrow('Invalid amount for "allowanceCharge[0].amount"');

            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    invoiceLines: [
                        {
                            ...basicInvoice.invoiceLines[0],
                            allowanceCharge: [
                                {
                                    chargeIndicator: true,
                                    amount: 1,
                                    baseAmount: 10.005,
                                },
                            ],
                        },
                    ],
                })
            ).toThrow(
                'Invalid amount for "invoiceLines[0].allowanceCharge[0].baseAmount"'
            );

            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    invoiceLines: [
                        {
                            ...basicInvoice.invoiceLines[0],
                            priceAllowanceCharge: { amount: 0.005 },
                        },
                    ],
                })
            ).toThrow(
                'Invalid amount for "invoiceLines[0].priceAllowanceCharge.amount"'
            );
        });

        it('should still serialize valid amounts with exactly two decimals', () => {
            const invoiceXML = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                taxTotal: [
                    {
                        taxAmount: 52.61,
                        taxAmountCurrency: 'EUR',
                        subTotals: [
                            {
                                taxableAmount: 250.5,
                                taxAmount: 52.61,
                                taxCategory: { categoryCode: 'S', percent: 21 },
                            },
                        ],
                    },
                ],
            });

            expect(invoiceXML).toContain(
                '<cbc:TaxableAmount currencyID="EUR">250.50</cbc:TaxableAmount>'
            );
            expect(invoiceXML).toContain(
                '<cbc:TaxAmount currencyID="EUR">52.61</cbc:TaxAmount>'
            );
        });
    });

    describe('BR-CO-14', () => {
        it('should throw when the tax total does not equal the sum of its sub totals', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    taxTotal: [
                        {
                            taxAmount: 21.0,
                            taxAmountCurrency: 'EUR',
                            subTotals: [
                                {
                                    taxableAmount: 100,
                                    taxAmount: 21,
                                    taxCategory: {
                                        categoryCode: 'S',
                                        percent: 21,
                                    },
                                },
                                {
                                    taxableAmount: 50,
                                    taxAmount: 3,
                                    taxCategory: {
                                        categoryCode: 'S',
                                        percent: 6,
                                    },
                                },
                            ],
                        },
                    ],
                })
            ).toThrow(
                'BR-CO-14 violation in "taxTotal[0]": taxAmount (21.00) must equal the sum of subTotals[].taxAmount (24.00)'
            );
        });

        it('should accept a tax total that equals the sum of its sub totals', () => {
            const invoiceXML = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                taxTotal: [
                    {
                        taxAmount: 24.0,
                        taxAmountCurrency: 'EUR',
                        subTotals: [
                            {
                                taxableAmount: 100,
                                taxAmount: 21,
                                taxCategory: { categoryCode: 'S', percent: 21 },
                            },
                            {
                                taxableAmount: 50,
                                taxAmount: 3,
                                taxCategory: { categoryCode: 'S', percent: 6 },
                            },
                        ],
                    },
                ],
            });

            expect(invoiceXML).toContain(
                '<cbc:TaxAmount currencyID="EUR">24.00</cbc:TaxAmount>'
            );
        });

        it('should not check a tax total without sub totals (tax currency total)', () => {
            expect(() =>
                toolkit.invoiceToPeppolUBL({
                    ...basicInvoice,
                    taxCurrencyCode: 'USD',
                    taxTotal: [
                        ...basicInvoice.taxTotal,
                        {
                            taxAmount: 22.75,
                            taxAmountCurrency: 'USD',
                            subTotals: [],
                        },
                    ],
                })
            ).not.toThrow();
        });
    });
});
