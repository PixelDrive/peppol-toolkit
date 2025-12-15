import { DocumentBuilder } from './builder';
import { CreditNote } from './documents/invoices/CreditNote';
import { Invoice } from './documents/invoices/Invoice';

export class PeppolToolkit {
    private __builder = new DocumentBuilder();

    public invoiceToPeppolUBL(invoice: Invoice): string {
        return this.__builder.generatePeppolInvoice(invoice);
    }

    public creditNoteToPeppolUBL(creditNote: CreditNote): string {
        return this.__builder.generatePeppolCreditNote(creditNote);
    }
}

export function createToolkit() {
    return new PeppolToolkit();
}

// Default export for convenience in some import styles
export default {
    PeppolToolkit,
    createToolkit,
};

export * from './documents';
export * from './builder';
export { basicInvoice as exampleInvoice } from './data/basic-invoice';
export { basicCreditNote as exampleCreditNote } from './data/basic-creditNote';
