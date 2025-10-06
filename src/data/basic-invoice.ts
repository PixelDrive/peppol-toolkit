import { Invoice } from '../../src';

export const basicInvoice = {
    ID: 'TEST-003',
    issueDate: '2024-01-01',
    dueDate: '2024-01-31',
    invoiceTypeCode: 383,
    documentCurrencyCode: 'EUR',

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
                    taxableAmount: 100.0,
                    taxAmount: 21.0,
                    taxCategory: {
                        categoryCode: 'S',
                    },
                },
            ],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 100.0,
        taxExclusiveAmount: 100.0,
        taxInclusiveAmount: 121.0,
        prepaidAmount: 0.0,
        payableAmount: 121.0,
    },
} satisfies Invoice;
