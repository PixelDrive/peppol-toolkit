import { En16931Invoice } from '../documents/en16931/Invoice';

/**
 * EN 16931 invoice to a consumer. The buyer has no electronic address (BT-49) nor VAT
 * identifier, so this invoice cannot be a Peppol BIS invoice (PEPPOL-EN16931-R010).
 */
export const en16931Invoice = {
    ID: 'B2C-2026-001',
    issueDate: '2026-03-01',
    dueDate: '2026-03-31',
    invoiceTypeCode: 380,
    documentCurrencyCode: 'EUR',
    seller: {
        endPoint: { scheme: '0208', id: '0732788874' },
        name: 'Pixeldrive',
        legalEntity: {
            registrationName: 'Pixeldrive SRL',
            companyId: { id: '0732788874', schemeID: '0208' },
        },
        address: {
            streetName: 'Rue de la Station 1',
            cityName: 'Namur',
            postalZone: '5000',
            country: 'BE',
        },
        taxSchemes: [{ companyId: 'BE0732788874', schemeID: 'VAT' }],
        contact: { email: 'billing@example.com' },
    },
    buyer: {
        legalEntity: { registrationName: 'Jane Doe' },
        address: {
            streetName: 'Rue de Fer 12',
            cityName: 'Namur',
            postalZone: '5000',
            country: 'BE',
        },
    },
    paymentMeans: [
        {
            code: '30',
            paymentId: '+++090/9337/55493+++',
            financialAccount: { id: 'BE71096123456769', name: 'Pixeldrive' },
        },
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
            ],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 100,
        taxExclusiveAmount: 100,
        taxInclusiveAmount: 121,
        payableAmount: 121,
    },
    invoiceLines: [
        {
            id: '1',
            invoicedQuantity: 1,
            unitCode: 'C62',
            lineExtensionAmount: 100,
            price: 100,
            name: 'Website maintenance',
            currency: 'EUR',
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
} satisfies En16931Invoice;
