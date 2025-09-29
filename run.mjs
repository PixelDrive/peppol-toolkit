import { PeppolToolkit } from './dist/index.mjs';
import * as fs from 'node:fs';

const tk = new PeppolToolkit();

const xml = tk.invoiceToPeppolUBL({
    ID: '20250005',
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
        contact: {
            name: 'Simon Loir',
            email: 'simon@email.com',
            phone: '0500/1234567',
        },
    },
});

console.log(xml);
fs.writeFileSync('./test.xml', xml);
