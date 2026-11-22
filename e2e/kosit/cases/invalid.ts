import {
    belgianBuyer,
    belgianSeller,
    creditNote,
    dutchBuyer,
    invoice,
    KositCase,
    line,
} from './helpers';
import { CreditNote, Invoice } from '../../../src';

const base = invoice();

export const invalidCases: KositCase[] = [
    // --- Totals -----------------------------------------------------------
    {
        name: 'invoice - tax inclusive amount is not exclusive + VAT',
        kind: 'invoice',
        expectedErrors: ['BR-CO-15'],
        document: invoice({
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 120,
                payableAmount: 120,
            },
        }),
    },
    {
        name: 'invoice - line extension total differs from sum of lines',
        kind: 'invoice',
        expectedErrors: ['BR-CO-10'],
        document: invoice({
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                lineExtensionAmount: 90,
            },
        }),
    },
    {
        name: 'invoice - payable amount ignores prepaid amount',
        kind: 'invoice',
        expectedErrors: ['BR-CO-16'],
        document: invoice({
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                prepaidAmount: 21,
                payableAmount: 121,
            },
        }),
    },
    {
        name: 'invoice - VAT total differs from sum of subtotals',
        kind: 'invoice',
        expectedErrors: ['BR-CO-14'],
        document: invoice(),
        // Change only the document VAT total and its dependent monetary totals.
        mutateXml: (xml) =>
            xml
                .replace(
                    '<cbc:TaxAmount currencyID="EUR">21.00</cbc:TaxAmount>',
                    '<cbc:TaxAmount currencyID="EUR">25.00</cbc:TaxAmount>'
                )
                .replace(
                    /(<cbc:(?:TaxInclusiveAmount|PayableAmount) currencyID="EUR">)121\.00/g,
                    (_, openingTag: string) => `${openingTag}125.00`
                ),
    },
    {
        name: 'invoice - line net amount is not quantity x price',
        kind: 'invoice',
        expectedErrors: ['PEPPOL-EN16931-R120'],
        document: invoice({
            invoiceLines: [
                line('1', 1, 100, 'S', 21, { lineExtensionAmount: 95 }),
            ],
            taxTotal: [
                {
                    taxAmount: 19.95,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 95,
                            taxAmount: 19.95,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 95,
                taxExclusiveAmount: 95,
                taxInclusiveAmount: 114.95,
                payableAmount: 114.95,
            },
        }),
    },

    {
        name: 'invoice - net unit price differs from gross price minus discount',
        kind: 'invoice',
        expectedErrors: ['PEPPOL-EN16931-R046'],
        document: invoice({
            invoiceLines: [
                line('1', 1, 100, 'S', 21, {
                    priceAllowanceCharge: { amount: 5, baseAmount: 106 },
                }),
            ],
        }),
    },

    // --- VAT breakdown ----------------------------------------------------
    {
        name: 'invoice - standard rate taxable amount differs from lines',
        kind: 'invoice',
        expectedErrors: ['BR-S-08'],
        document: invoice({
            taxTotal: [
                {
                    taxAmount: 18.9,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 90,
                            taxAmount: 18.9,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 118.9,
                payableAmount: 118.9,
            },
        }),
    },
    {
        name: 'invoice - standard rate VAT amount is not taxable x rate',
        kind: 'invoice',
        expectedErrors: ['BR-S-09'],
        document: invoice({
            taxTotal: [
                {
                    taxAmount: 20,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 20,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 120,
                payableAmount: 120,
            },
        }),
    },
    {
        name: 'invoice - seller without VAT identifier on a standard rate',
        kind: 'invoice',
        expectedErrors: ['BR-S-02'],
        document: invoice({
            seller: { ...belgianSeller, taxSchemes: [] },
        }),
    },
    {
        name: 'invoice - exempt VAT category without exemption reason',
        kind: 'invoice',
        expectedErrors: ['BR-E-10'],
        document: invoice({
            invoiceLines: [line('1', 1, 100, 'E', 0)],
            taxTotal: [
                {
                    taxAmount: 0,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 0,
                            taxCategory: { categoryCode: 'E', percent: 0 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 100,
                payableAmount: 100,
            },
        }),
    },
    {
        name: 'invoice - reverse charge with unidentified buyer',
        kind: 'invoice',
        expectedErrors: ['BR-AE-02'],
        document: invoice({
            buyer: {
                ...belgianBuyer,
                taxSchemes: [],
                legalEntity: { registrationName: 'Acme Belgium SA' },
            },
            invoiceLines: [line('1', 1, 100, 'AE', 0)],
            taxTotal: [
                {
                    taxAmount: 0,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 0,
                            taxCategory: {
                                categoryCode: 'AE',
                                percent: 0,
                                exemptionReasonCode: 'VATEX-EU-AE',
                            },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 100,
                payableAmount: 100,
            },
        }),
    },
    {
        name: 'invoice - intra-community supply without delivery information',
        kind: 'invoice',
        expectedErrors: ['BR-IC-11'],
        document: invoice({
            buyer: dutchBuyer,
            invoiceLines: [line('1', 1, 100, 'K', 0)],
            taxTotal: [
                {
                    taxAmount: 0,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 0,
                            taxCategory: {
                                categoryCode: 'K',
                                percent: 0,
                                exemptionReasonCode: 'VATEX-EU-IC',
                            },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 100,
                payableAmount: 100,
            },
        }),
    },

    // --- Allowances / charges ---------------------------------------------
    {
        name: 'invoice - document allowance without reason',
        kind: 'invoice',
        expectedErrors: ['BR-33'],
        document: invoice({
            invoiceLines: [line('1', 1, 110, 'S', 21)],
            allowanceCharge: [
                {
                    chargeIndicator: false,
                    amount: 10,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
            ],
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                lineExtensionAmount: 110,
                allowanceTotalAmount: 10,
            },
        }),
    },

    // --- Mandatory business information -----------------------------------
    {
        name: 'invoice - neither buyer reference nor order reference',
        kind: 'invoice',
        expectedErrors: ['PEPPOL-EN16931-R003'],
        document: invoice({ buyerReference: undefined }),
    },
    {
        name: 'invoice - tax currency without VAT total in that currency',
        kind: 'invoice',
        expectedErrors: ['BR-53'],
        document: invoice({
            documentCurrencyCode: 'USD',
            taxCurrencyCode: 'EUR',
            invoiceLines: [line('1', 1, 100, 'S', 21, { currency: 'USD' })],
            taxTotal: [{ ...base.taxTotal[0], taxAmountCurrency: 'USD' }],
            legalMonetaryTotal: { ...base.legalMonetaryTotal, currency: 'USD' },
        }),
    },

    // --- Code lists -------------------------------------------------------
    {
        name: 'invoice - unknown currency code',
        kind: 'invoice',
        expectedErrors: ['BR-CL-04'],
        document: invoice({
            documentCurrencyCode: 'ZZZ' as Invoice['documentCurrencyCode'],
        }),
    },
    {
        name: 'invoice - unknown invoice type code',
        kind: 'invoice',
        expectedErrors: ['BR-CL-01'],
        document: invoice({
            invoiceTypeCode: 999 as Invoice['invoiceTypeCode'],
        }),
    },
    {
        name: 'invoice - unknown electronic address scheme',
        kind: 'invoice',
        expectedErrors: ['PEPPOL-EN16931-CL008'],
        document: invoice({
            seller: {
                ...belgianSeller,
                endPoint: {
                    scheme: 'XXXX' as Invoice['seller']['endPoint']['scheme'],
                    id: 'BE0732788874',
                },
            },
        }),
    },
    {
        // 0154 is still in the CEF EAS list, used by EN 16931 documents
        name: 'invoice - electronic address scheme removed in BIS 3.0.21',
        kind: 'invoice',
        expectedErrors: ['PEPPOL-EN16931-CL008'],
        document: invoice({
            seller: {
                ...belgianSeller,
                endPoint: {
                    scheme: '0154' as Invoice['seller']['endPoint']['scheme'],
                    id: '12345678',
                },
            },
        }),
    },

    // --- Credit notes -----------------------------------------------------
    {
        name: 'credit note - tax inclusive amount is not exclusive + VAT',
        kind: 'creditNote',
        expectedErrors: ['BR-CO-15'],
        document: creditNote({
            legalMonetaryTotal: {
                ...base.legalMonetaryTotal,
                taxInclusiveAmount: 120,
                payableAmount: 120,
            },
        }),
    },
    {
        name: 'credit note - neither buyer reference nor order reference',
        kind: 'creditNote',
        expectedErrors: ['PEPPOL-EN16931-R003'],
        document: creditNote({ buyerReference: undefined }),
    },
    {
        name: 'credit note - self-billed credit note type code',
        kind: 'creditNote',
        expectedErrors: ['PEPPOL-EN16931-P0101'],
        document: creditNote({
            creditNoteTypeCode: 261 as CreditNote['creditNoteTypeCode'],
        }),
    },

    // --- Syntax (XSD) -----------------------------------------------------
    {
        name: 'invoice - missing mandatory IssueDate element',
        kind: 'invoice',
        expectedErrors: ['cvc-complex-type'],
        document: invoice(),
        mutateXml: (xml) =>
            xml.replace(/\s*<cbc:IssueDate>[^<]*<\/cbc:IssueDate>/, ''),
    },
];
