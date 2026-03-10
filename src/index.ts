import { DocumentBuilder } from './builder';
import { DocumentParser } from './parser';
import { CreditNote } from './documents/invoices/CreditNote';
import { Invoice } from './documents/invoices/Invoice';

export class PeppolToolkit {
    private __builder = new DocumentBuilder();
    private __parser = new DocumentParser();

    public invoiceToPeppolUBL(invoice: Invoice): string {
        return this.__builder.generatePeppolInvoice(invoice);
    }

    public creditNoteToPeppolUBL(creditNote: CreditNote): string {
        return this.__builder.generatePeppolCreditNote(creditNote);
    }

    public peppolUBLToInvoice(xml: string): Invoice {
        return this.__parser.parseInvoice(xml);
    }

    public peppolUBLToCreditNote(xml: string): CreditNote {
        return this.__parser.parseCreditNote(xml);
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
export * from './parser';
export { basicInvoice as exampleInvoice } from './data/basic-invoice';
export { basicCreditNote as exampleCreditNote } from './data/basic-creditNote';
