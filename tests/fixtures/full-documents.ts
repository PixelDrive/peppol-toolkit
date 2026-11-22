import { CreditNote, Invoice } from '../../src';

/**
 * Peppol documents filling every element the builder can write, including the
 * fallbacks (Date objects, default tax scheme, currencies inherited from the
 * document). Their XML is snapshotted in peppol-output.test.ts so that any change
 * to the serialization shows up. Only the serialization matters here: the documents
 * are not meant to be submitted for validation.
 */

const seller: Invoice['seller'] = {
    endPoint: { scheme: '9925', id: 'BE0732788874' },
    identification: [
        { id: '5790000435968', scheme: '0088' },
        { id: 'SELLER-REF-1' },
    ],
    name: 'Pixeldrive',
    address: {
        streetName: 'Rue de la Station 1',
        additionalStreetName: 'Bâtiment B',
        cityName: 'Namur',
        postalZone: '5000',
        countrySubentity: 'Namur',
        addressLine: 'Third floor',
        country: 'BE',
    },
    taxSchemes: [
        { companyId: 'BE0732788874', schemeID: 'VAT' },
        { companyId: 'TAX-REG-42' },
    ],
    legalEntity: {
        registrationName: 'Pixeldrive SRL',
        companyId: { id: '0732788874', schemeID: '0208' },
        legalForm: 'Société à responsabilité limitée',
    },
    contact: {
        name: 'Simon Loir',
        phone: '+32 81 00 00 00',
        email: 'billing@example.com',
    },
};

const buyer: Invoice['buyer'] = {
    endPoint: { scheme: '0208', id: '0403170701' },
    address: { country: 'BE' },
    legalEntity: {
        registrationName: 'Acme Belgium SA',
        companyId: { id: '0403170701' },
    },
    contact: { email: 'ap@acme.example' },
};

const fullLine: Invoice['invoiceLines'][number] = {
    id: '1',
    note: [
        { content: 'Line note' },
        { content: 'Note de ligne', languageID: 'fr' },
    ],
    invoicedQuantity: 2.125,
    unitCode: 'HUR',
    lineExtensionAmount: 190,
    currency: 'EUR',
    accountingCost: 'COST-CENTER-7',
    invoicePeriod: { startDate: new Date(2026, 1, 1), endDate: '2026-02-28' },
    orderLineReference: '10',
    documentReference: { id: 'TIMESHEET-1', documentTypeCode: '130' },
    allowanceCharge: [
        {
            chargeIndicator: false,
            reasonCode: '95',
            reason: 'Volume discount',
            multiplierFactorNumeric: 5,
            amount: 10,
            baseAmount: 200,
        },
        {
            chargeIndicator: true,
            reason: 'Packing',
            amount: 5,
            currency: 'EUR',
        },
    ],
    name: 'Consulting',
    description: 'Consulting services, February',
    buyersItemIdentification: 'BUYER-ITEM-1',
    sellersItemIdentification: 'SELLER-ITEM-1',
    standardItemIdentification: { id: '05449000214911', schemeID: '0160' },
    originCountry: 'BE',
    commodityClassification: [
        { code: '72224000', listID: 'STI' },
        { code: '86.90', listID: 'ZZZ', listVersionID: '2.1' },
    ],
    taxCategory: { categoryCode: 'S', percent: 21 },
    additionalItemProperties: [{ name: 'Seniority', value: 'Senior' }],
    price: 89.4118,
    baseQuantity: 1,
    priceAllowanceCharge: { amount: 10.5882, baseAmount: 100, currency: 'EUR' },
};

const minimalLine: Invoice['invoiceLines'][number] = {
    id: '2',
    invoicedQuantity: 1,
    unitCode: 'C62',
    lineExtensionAmount: 50,
    currency: 'EUR',
    name: 'Training material',
    taxCategory: { categoryCode: 'E', percent: 0 },
    price: 50,
};

const sharedFields = {
    note: [
        { content: 'First note' },
        { content: 'Zweite Notiz', languageID: 'de' },
    ],
    taxPointDate: '2026-02-28',
    documentCurrencyCode: 'EUR',
    taxCurrencyCode: 'USD',
    accountingCost: '4217:2323:2323',
    buyerReference: 'PO-4521',
    invoicePeriod: {
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        descriptionCode: '35',
    },
    orderReference: { id: 'PO-4521', salesOrderId: 'SO-998' },
    billingReference: [
        {
            invoiceDocReference: {
                id: 'INV-2026-001',
                issueDate: new Date(2026, 0, 15),
            },
        },
        { invoiceDocReference: { id: 'INV-2026-002' } },
    ],
    despatchDocumentReference: 'DESPATCH-1',
    receiptDocumentReference: 'RECEIPT-1',
    originatorDocumentReference: 'TENDER-1',
    contractDocumentReference: 'CONTRACT-1',
    additionalDocumentReference: [
        {
            id: 'ATTACHMENT-1',
            documentDescription: 'Timesheet',
            attachment: {
                embeddedDocumentBinaryObject: 'aGVsbG8gd29ybGQ=',
                mimeCode: 'application/pdf',
                filename: 'timesheet.pdf',
            },
        },
        {
            id: 'ATTACHMENT-2',
            attachment: { externalReference: 'https://example.com/terms.pdf' },
        },
        { id: 'METER-42', schemeID: 'ABT', documentTypeCode: '130' },
    ],
    seller,
    buyer,
    payeeParty: {
        identification: { id: 'BE12ZZZ0000000001', schemeID: 'SEPA' },
        name: 'Payee Factoring NV',
        legalEntity: { companyId: { id: '0403170701', schemeID: '0208' } },
    },
    taxRepresentativeParty: {
        name: 'Tax Representative BV',
        address: {
            streetName: 'Damrak 1',
            cityName: 'Amsterdam',
            postalZone: '1012 LG',
            country: 'NL',
        },
        taxScheme: { companyId: 'NL123456789B01' },
    },
    delivery: {
        actualDeliveryDate: '2026-02-27',
        deliveryLocation: {
            id: '5790000435975',
            locationSchemeID: '0088',
            address: {
                streetName: 'Dock 4',
                cityName: 'Antwerpen',
                postalZone: '2000',
                country: 'BE',
            },
        },
        deliveryPartyName: 'Warehouse Antwerpen',
    },
    paymentMeans: [
        {
            code: '30',
            name: 'Credit transfer',
            paymentDueDate: '2026-03-31',
            paymentId: '+++090/9337/55493+++',
            financialAccount: {
                id: 'BE71096123456769',
                name: 'Pixeldrive',
                financialInstitutionBranch: 'GKCCBEBB',
            },
        },
        {
            code: '54',
            cardAccount: {
                primaryAccountNumberId: '1234',
                networkId: 'VISA',
                holderName: 'S. Loir',
            },
        },
        {
            code: '59',
            paymentMandate: {
                id: 'MANDATE-1',
                payerFinancialAccountId: 'BE68539007547034',
            },
        },
        { code: '58', financialAccount: { id: 'BE71096123456769' } },
    ],
    paymentTermsNote: 'Payment within 30 days',
    allowanceCharge: [
        {
            chargeIndicator: false,
            reasonCode: '95',
            reason: 'Loyalty discount',
            multiplierFactorNumeric: 10,
            amount: 20,
            baseAmount: 200,
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
        {
            chargeIndicator: true,
            reasonCode: 'FC',
            reason: 'Freight',
            amount: 10,
            currency: 'EUR',
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
    taxTotal: [
        {
            taxAmount: 37.8,
            taxAmountCurrency: 'EUR',
            subTotals: [
                {
                    taxableAmount: 180,
                    taxAmount: 37.8,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
                {
                    taxableAmount: 50,
                    taxableAmountCurrency: 'EUR',
                    taxAmount: 0,
                    taxAmountCurrency: 'EUR',
                    taxCategory: {
                        categoryCode: 'E',
                        percent: 0,
                        exemptionReasonCode: 'VATEX-EU-132-1I',
                        exemptionReason: 'Exempt: vocational training',
                    },
                },
            ],
        },
        { taxAmount: 40.96, taxAmountCurrency: 'USD', subTotals: [] },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 240,
        allowanceTotalAmount: 20,
        chargeTotalAmount: 10,
        taxExclusiveAmount: 230,
        taxExclusiveAmountCurrency: 'EUR',
        taxInclusiveAmount: 267.8,
        prepaidAmount: 100,
        payableRoundingAmount: 0.2,
        payableAmount: 168,
        payableAmountCurrency: 'EUR',
    },
} satisfies Partial<Invoice> & Partial<CreditNote>;

export const fullInvoice: Invoice = {
    ...sharedFields,
    ID: 'INV-2026-042',
    issueDate: '2026-03-01',
    dueDate: new Date(2026, 2, 31),
    invoiceTypeCode: 380,
    projectReference: 'PROJECT-1',
    invoiceLines: [fullLine, minimalLine],
};

export const fullCreditNote: CreditNote = {
    ...sharedFields,
    customizationID:
        'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
    profileID: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
    ID: 'CN-2026-007',
    issueDate: new Date(2026, 2, 15),
    creditNoteTypeCode: 396,
    creditNoteLines: [fullLine, minimalLine],
};
