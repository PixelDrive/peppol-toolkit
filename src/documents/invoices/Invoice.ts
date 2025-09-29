import { InvoiceTypeCode } from './InvoiceTypeCodes';
import { CurrencyCode } from './CurrencyCodes';

export type Invoice = {
    ID: string;
    issueDate: Date | string;
    dueDate?: Date | string;
    invoiceTypeCode: InvoiceTypeCode;
    note?: string;
    taxPointDate?: Date | string;
    documentCurrencyCode: CurrencyCode;
};
