import { En16931CreditNote } from '../documents/en16931/CreditNote';
import { en16931Invoice } from './en16931-invoice';

/**
 * EN 16931 credit note to a consumer, partially crediting the example EN 16931 invoice.
 * Like the invoice, the buyer has no electronic address.
 */
export const en16931CreditNote = {
    ID: 'B2C-CN-2026-001',
    issueDate: '2026-03-15',
    creditNoteTypeCode: 381,
    documentCurrencyCode: 'EUR',
    billingReference: [
        {
            invoiceDocReference: {
                id: en16931Invoice.ID,
                issueDate: en16931Invoice.issueDate,
            },
        },
    ],
    seller: en16931Invoice.seller,
    buyer: en16931Invoice.buyer,
    taxTotal: [
        {
            taxAmount: 10.5,
            taxAmountCurrency: 'EUR',
            subTotals: [
                {
                    taxableAmount: 50,
                    taxAmount: 10.5,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
            ],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 50,
        taxExclusiveAmount: 50,
        taxInclusiveAmount: 60.5,
        payableAmount: 60.5,
    },
    creditNoteLines: [
        {
            id: '1',
            invoicedQuantity: 1,
            unitCode: 'C62',
            lineExtensionAmount: 50,
            price: 50,
            name: 'Website maintenance (partial refund)',
            currency: 'EUR',
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
} satisfies En16931CreditNote;
