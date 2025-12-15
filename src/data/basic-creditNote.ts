import { CreditNote } from '../documents/invoices/CreditNote';

export const basicCreditNote = {
    ID: 'TEST-003',
    issueDate: '2024-01-01',
    creditNoteTypeCode: 381,
    documentCurrencyCode: 'EUR',
    buyerReference: "Test Buyer's Reference",
    billingReference: {
        invoiceDocReference: {
            id: 'INV-001',
            issueDate: '2017-09-15',
        },
    },
    seller: {
        endPoint: {
            scheme: '9925',
            id: '0732788874',
        },
        legalEntity: {
            companyId: '0732788874',
            registrationName: 'Loir, Simon',
        },
        name: 'Test Seller',
        address: {
            streetName: 'Test Street',
            cityName: 'Test City',
            postalZone: '12345',
            country: 'BE',
        },
        taxSchemeCompanyID: 'BE0732788874',
        identification: [
            {
                id: 'BE0732788874',
            },
        ],
    },

    buyer: {
        endPoint: {
            scheme: '9925',
            id: '0732788874',
        },
        legalEntity: {
            companyId: '0732788874',
            legalForm: 'SRL',
            registrationName: 'Loir, Simon',
        },
        name: 'Test Seller',
        address: {
            streetName: 'Test Street',
            cityName: 'Test City',
            postalZone: '12345',
            country: 'BE',
        },
        taxSchemeCompanyID: 'BE0732788874',
        identification: [
            {
                id: 'BE0732788874',
            },
        ],
    },

    paymentMeans: [
        {
            paymentId: '20250008',
            name: 'Nom de la banque ou du moyen de payement',
            code: '30',
            financialAccount: {
                financialInstitutionBranch: 'GEGBA',
                name: 'Simon Loir',
                id: 'BE11 0001 4455 6666 7894',
            },
        },
    ],

    paymentTermsNote:
        "Toute facture non payée à l'échéance sera majorée de 15%",
    taxTotal: [
        {
            taxAmountCurrency: 'EUR',
            taxAmount: 21.0,
            subTotals: [
                {
                    taxableAmount: 100,
                    taxAmount: 21,
                    taxCategory: {
                        categoryCode: 'S',
                        percent: 21,
                    },
                },
            ],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 100,
        taxExclusiveAmount: 100,
        taxInclusiveAmount: 121,
        prepaidAmount: 0,
        payableAmount: 121,
    },
    creditNoteLines: [
        {
            id: '1',
            invoicedQuantity: 1,
            lineExtensionAmount: 100.0,
            price: 100,
            name: 'Petit poney',
            currency: 'EUR',
            additionalItemProperties: {
                test: 'hello world',
            },
            unitCode: 'H67',
            taxCategory: {
                percent: 21,
                categoryCode: 'S',
            },
        },
    ],
} satisfies CreditNote;
