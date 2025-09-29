import { Invoice } from '../../src';

export const basicInvoice = {
    ID: 'TEST-003',
    issueDate: '2024-01-01',
    dueDate: '2024-01-31',
    invoiceTypeCode: 383,
    documentCurrencyCode: 'EUR',
} satisfies Invoice;
