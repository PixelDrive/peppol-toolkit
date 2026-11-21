import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicCreditNote } from '../src/data/basic-creditNote';

describe('Creditnote Builder', () => {
    let toolkit = new PeppolToolkit();

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should generate a non empty string', () => {
        const invoiceXML = toolkit.creditNoteToPeppolUBL(basicCreditNote);
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

    it('should return <CreditNote> as indicator', () => {
        const invoiceXML = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        expect(invoiceXML).toContain('<CreditNote');
        expect(invoiceXML).toContain(
            'xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"'
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

    it('should always include payable amount even when it is zero', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            legalMonetaryTotal: {
                ...basicCreditNote.legalMonetaryTotal,
                payableAmount: 0,
            },
        });

        expect(creditNoteXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
    });

    it('should omit other zero monetary amounts when generateOnZero is false', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            legalMonetaryTotal: {
                ...basicCreditNote.legalMonetaryTotal,
                payableAmount: 0,
                prepaidAmount: 0,
                allowanceTotalAmount: 0,
                chargeTotalAmount: 0,
                payableRoundingAmount: 0,
            },
        });

        expect(creditNoteXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
        expect(creditNoteXML).not.toContain('<cbc:PrepaidAmount');
        expect(creditNoteXML).not.toContain('<cbc:AllowanceTotalAmount');
        expect(creditNoteXML).not.toContain('<cbc:ChargeTotalAmount');
        expect(creditNoteXML).not.toContain('<cbc:PayableRoundingAmount');
    });

    it('should not nest cac:Party inside specialized party nodes', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
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

        expect(creditNoteXML).toMatch(/<cac:PayeeParty>\s*<cac:PartyName>/);
        expect(creditNoteXML).not.toMatch(/<cac:PayeeParty>\s*<cac:Party>/);
        expect(creditNoteXML).toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:PartyName>/
        );
        expect(creditNoteXML).not.toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:Party>/
        );
    });

    it('should preserve line price precision in PriceAmount', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteLines: [
                {
                    ...basicCreditNote.creditNoteLines[0],
                    price: 10.129,
                },
            ],
        });

        expect(creditNoteXML).toContain(
            '<cbc:PriceAmount currencyID="EUR">10.129</cbc:PriceAmount>'
        );
    });

    it('should preserve line quantity precision in CreditedQuantity and BaseQuantity', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteLines: [
                {
                    ...basicCreditNote.creditNoteLines[0],
                    invoicedQuantity: 1.125,
                    baseQuantity: 0.125,
                },
            ],
        });

        expect(creditNoteXML).toContain(
            '<cbc:CreditedQuantity unitCode="H67">1.125</cbc:CreditedQuantity>'
        );
        expect(creditNoteXML).toContain(
            '<cbc:BaseQuantity unitCode="H67">0.125</cbc:BaseQuantity>'
        );
    });

    it('should not use exponent notation for very small or very large quantities and prices', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteLines: [
                {
                    ...basicCreditNote.creditNoteLines[0],
                    invoicedQuantity: 1e21,
                    baseQuantity: 0.0000001,
                    price: 0.0000001,
                },
            ],
        });

        expect(creditNoteXML).toContain(
            '<cbc:CreditedQuantity unitCode="H67">1000000000000000000000</cbc:CreditedQuantity>'
        );
        expect(creditNoteXML).toContain(
            '<cbc:BaseQuantity unitCode="H67">0.0000001</cbc:BaseQuantity>'
        );
        expect(creditNoteXML).toContain(
            '<cbc:PriceAmount currencyID="EUR">0.0000001</cbc:PriceAmount>'
        );
    });

    describe('amount precision', () => {
        it('should accept a line price with more than two decimals', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
                    creditNoteLines: [
                        {
                            ...basicCreditNote.creditNoteLines[0],
                            price: 33.333,
                        },
                    ],
                })
            ).not.toThrow();
        });

        it('should reject a tax sub total amount with more than two decimals', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
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

        it('should reject legal monetary total amounts with more than two decimals', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
                    legalMonetaryTotal: {
                        ...basicCreditNote.legalMonetaryTotal,
                        taxInclusiveAmount: 121.001,
                    },
                })
            ).toThrow(
                'Invalid amount for "legalMonetaryTotal.taxInclusiveAmount"'
            );
        });

        it('should reject a line extension amount with more than two decimals', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
                    creditNoteLines: [
                        {
                            ...basicCreditNote.creditNoteLines[0],
                            lineExtensionAmount: 99.999,
                        },
                    ],
                })
            ).toThrow(
                'Invalid amount for "creditNoteLines[0].lineExtensionAmount"'
            );
        });

        it('should reject allowance/charge amounts with more than two decimals', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
                    allowanceCharge: [
                        {
                            chargeIndicator: true,
                            amount: 5.125,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                })
            ).toThrow('Invalid amount for "allowanceCharge[0].amount"');
        });
    });

    it('should preserve full precision for the unit price discount and gross price', () => {
        // Net price 1.00 = gross price 1.125 - discount 0.125 (exact price equation)
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteLines: [
                {
                    ...basicCreditNote.creditNoteLines[0],
                    price: 1.0,
                    priceAllowanceCharge: {
                        amount: 0.125,
                        baseAmount: 1.125,
                    },
                },
            ],
        });

        expect(creditNoteXML).toContain(
            '<cbc:PriceAmount currencyID="EUR">1</cbc:PriceAmount>'
        );
        expect(creditNoteXML).toContain(
            '<cbc:Amount currencyID="EUR">0.125</cbc:Amount>'
        );
        expect(creditNoteXML).toContain(
            '<cbc:BaseAmount currencyID="EUR">1.125</cbc:BaseAmount>'
        );
    });

    describe('percentages', () => {
        it('should write integer VAT rates without decimals', () => {
            const creditNoteXML =
                toolkit.creditNoteToPeppolUBL(basicCreditNote);
            expect(creditNoteXML).toContain('<cbc:Percent>21</cbc:Percent>');
            expect(creditNoteXML).not.toContain(
                '<cbc:Percent>21.00</cbc:Percent>'
            );
        });

        it('should write VAT rates with more than two decimals unchanged', () => {
            const creditNoteXML = toolkit.creditNoteToPeppolUBL({
                ...basicCreditNote,
                allowanceCharge: [
                    {
                        chargeIndicator: false,
                        amount: 1,
                        taxCategory: { categoryCode: 'S', percent: 5.125 },
                    },
                ],
                taxTotal: [
                    {
                        taxAmountCurrency: 'EUR',
                        taxAmount: 5.07,
                        subTotals: [
                            {
                                taxableAmount: 99,
                                taxAmount: 5.07,
                                taxCategory: {
                                    categoryCode: 'S',
                                    percent: 5.125,
                                },
                            },
                        ],
                    },
                ],
                creditNoteLines: [
                    {
                        ...basicCreditNote.creditNoteLines[0],
                        taxCategory: { categoryCode: 'S', percent: 5.125 },
                    },
                ],
            });

            // TaxSubtotal, document AllowanceCharge and line ClassifiedTaxCategory
            expect(
                creditNoteXML.match(/<cbc:Percent>5\.125<\/cbc:Percent>/g)
            ).toHaveLength(3);
            expect(creditNoteXML).not.toContain(
                '<cbc:Percent>5.13</cbc:Percent>'
            );
        });
    });

    describe('BR-CO-14', () => {
        it('should throw when the tax total does not equal the sum of its sub totals', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
                    taxTotal: [
                        {
                            ...basicCreditNote.taxTotal[0],
                            taxAmount: 21.01,
                        },
                    ],
                })
            ).toThrow(
                'BR-CO-14 violation in "taxTotal[0]": taxAmount (21.01) must equal the sum of subTotals[].taxAmount (21.00)'
            );
        });

        it('should not check a tax total without sub totals (tax currency total)', () => {
            expect(() =>
                toolkit.creditNoteToPeppolUBL({
                    ...basicCreditNote,
                    taxCurrencyCode: 'USD',
                    taxTotal: [
                        ...basicCreditNote.taxTotal,
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
