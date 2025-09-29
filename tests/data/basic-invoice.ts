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
} satisfies Invoice;
