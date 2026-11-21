import { creditNote, dutchBuyer, invoice, KositCase, line } from './helpers';

export const validCases: KositCase[] = [
    {
        name: 'invoice - single line, standard rate 21%',
        kind: 'invoice',
        document: invoice(),
    },
    {
        name: 'invoice - several lines with 21% and 6% VAT rates',
        kind: 'invoice',
        document: invoice({
            invoiceLines: [line('1', 2, 50, 'S', 21), line('2', 3, 10, 'S', 6)],
            taxTotal: [
                {
                    taxAmount: 22.8,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 21,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                        {
                            taxableAmount: 30,
                            taxAmount: 1.8,
                            taxCategory: { categoryCode: 'S', percent: 6 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 130,
                taxExclusiveAmount: 130,
                taxInclusiveAmount: 152.8,
                payableAmount: 152.8,
            },
        }),
    },
    {
        name: 'invoice - fractional quantities and 4-decimal prices',
        kind: 'invoice',
        document: invoice({
            invoiceLines: [
                line('1', 2.5, 12.34, 'S', 21),
                line('2', 3, 0.1234, 'S', 21),
            ],
            taxTotal: [
                {
                    taxAmount: 6.56,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 31.22,
                            taxAmount: 6.56,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 31.22,
                taxExclusiveAmount: 31.22,
                taxInclusiveAmount: 37.78,
                payableAmount: 37.78,
            },
        }),
    },
    {
        name: 'invoice - document level allowance and charge',
        kind: 'invoice',
        document: invoice({
            invoiceLines: [line('1', 4, 50, 'S', 21)],
            allowanceCharge: [
                {
                    chargeIndicator: false,
                    reasonCode: '95',
                    reason: 'Discount',
                    amount: 20,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
                {
                    chargeIndicator: true,
                    reasonCode: 'FC',
                    reason: 'Freight',
                    amount: 10,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
            ],
            taxTotal: [
                {
                    taxAmount: 39.9,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 190,
                            taxAmount: 39.9,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 200,
                allowanceTotalAmount: 20,
                chargeTotalAmount: 10,
                taxExclusiveAmount: 190,
                taxInclusiveAmount: 229.9,
                payableAmount: 229.9,
            },
        }),
    },
    {
        name: 'invoice - line level allowance and price discount',
        kind: 'invoice',
        document: invoice({
            invoiceLines: [
                line('1', 2, 50, 'S', 21, {
                    lineExtensionAmount: 90,
                    allowanceCharge: [
                        {
                            chargeIndicator: false,
                            reasonCode: '95',
                            reason: 'Loyalty discount',
                            amount: 10,
                        },
                    ],
                }),
                line('2', 1, 50, 'S', 21, {
                    priceAllowanceCharge: { amount: 5, baseAmount: 55 },
                }),
            ],
            taxTotal: [
                {
                    taxAmount: 29.4,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 140,
                            taxAmount: 29.4,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 140,
                taxExclusiveAmount: 140,
                taxInclusiveAmount: 169.4,
                payableAmount: 169.4,
            },
        }),
    },
    {
        name: 'invoice - partially prepaid',
        kind: 'invoice',
        document: invoice({
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 100,
                taxExclusiveAmount: 100,
                taxInclusiveAmount: 121,
                prepaidAmount: 21,
                payableAmount: 100,
            },
        }),
    },
    {
        name: 'invoice - standard rate mixed with VAT exempt line',
        kind: 'invoice',
        document: invoice({
            invoiceLines: [
                line('1', 1, 100, 'S', 21),
                line('2', 1, 250, 'E', 0),
            ],
            taxTotal: [
                {
                    taxAmount: 21,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 21,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                        {
                            taxableAmount: 250,
                            taxAmount: 0,
                            taxCategory: {
                                categoryCode: 'E',
                                percent: 0,
                                exemptionReason:
                                    'Exempt based on article 44 of the VAT code',
                            },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 350,
                taxExclusiveAmount: 350,
                taxInclusiveAmount: 371,
                payableAmount: 371,
            },
        }),
    },
    {
        name: 'invoice - domestic reverse charge',
        kind: 'invoice',
        document: invoice({
            invoiceLines: [line('1', 10, 50, 'AE', 0)],
            taxTotal: [
                {
                    taxAmount: 0,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 500,
                            taxAmount: 0,
                            taxCategory: {
                                categoryCode: 'AE',
                                percent: 0,
                                exemptionReasonCode: 'VATEX-EU-AE',
                                exemptionReason: 'Reverse charge',
                            },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 500,
                taxExclusiveAmount: 500,
                taxInclusiveAmount: 500,
                payableAmount: 500,
            },
        }),
    },
    {
        name: 'invoice - intra-community supply to the Netherlands',
        kind: 'invoice',
        document: invoice({
            buyer: dutchBuyer,
            delivery: {
                actualDeliveryDate: '2024-02-28',
                deliveryLocation: {
                    address: {
                        streetName: 'Damrak 1',
                        cityName: 'Amsterdam',
                        postalZone: '1012 LG',
                        country: 'NL',
                    },
                },
            },
            invoiceLines: [line('1', 1, 1000, 'K', 0)],
            taxTotal: [
                {
                    taxAmount: 0,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 1000,
                            taxAmount: 0,
                            taxCategory: {
                                categoryCode: 'K',
                                percent: 0,
                                exemptionReasonCode: 'VATEX-EU-IC',
                                exemptionReason: 'Intra-community supply',
                            },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 1000,
                taxExclusiveAmount: 1000,
                taxInclusiveAmount: 1000,
                payableAmount: 1000,
            },
        }),
    },
    {
        name: 'invoice - order reference, period, delivery and notes',
        kind: 'invoice',
        document: invoice({
            buyerReference: undefined,
            orderReference: { id: 'ORDER-778', salesOrderId: 'SO-12' },
            note: [{ content: 'Thank you for your business' }],
            accountingCost: '4217:2323:2323',
            invoicePeriod: { startDate: '2024-02-01', endDate: '2024-02-29' },
            contractDocumentReference: 'CONTRACT-2024-7',
            projectReference: 'PROJ-42',
            delivery: {
                actualDeliveryDate: '2024-02-15',
                deliveryPartyName: 'Acme Warehouse',
            },
        }),
    },
    {
        name: 'invoice - USD with VAT accounted in EUR',
        kind: 'invoice',
        document: invoice({
            documentCurrencyCode: 'USD',
            taxCurrencyCode: 'EUR',
            invoiceLines: [line('1', 1, 100, 'S', 21, { currency: 'USD' })],
            taxTotal: [
                {
                    taxAmount: 21,
                    taxAmountCurrency: 'USD',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 21,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                    ],
                },
                {
                    taxAmount: 19.32,
                    taxAmountCurrency: 'EUR',
                    subTotals: [],
                },
            ],
            legalMonetaryTotal: {
                currency: 'USD',
                lineExtensionAmount: 100,
                taxExclusiveAmount: 100,
                taxInclusiveAmount: 121,
                payableAmount: 121,
            },
        }),
    },
    {
        name: 'credit note - single line, standard rate 21%',
        kind: 'creditNote',
        document: creditNote(),
    },
    {
        name: 'credit note - several lines with 21% and 6% VAT rates',
        kind: 'creditNote',
        document: creditNote({
            creditNoteLines: [
                line('1', 2, 50, 'S', 21),
                line('2', 3, 10, 'S', 6),
            ],
            taxTotal: [
                {
                    taxAmount: 22.8,
                    taxAmountCurrency: 'EUR',
                    subTotals: [
                        {
                            taxableAmount: 100,
                            taxAmount: 21,
                            taxCategory: { categoryCode: 'S', percent: 21 },
                        },
                        {
                            taxableAmount: 30,
                            taxAmount: 1.8,
                            taxCategory: { categoryCode: 'S', percent: 6 },
                        },
                    ],
                },
            ],
            legalMonetaryTotal: {
                currency: 'EUR',
                lineExtensionAmount: 130,
                taxExclusiveAmount: 130,
                taxInclusiveAmount: 152.8,
                payableAmount: 152.8,
            },
        }),
    },
];
