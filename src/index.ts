import { Invoice } from './documents';
import { DocumentBuilder } from './builder';

export class PeppolToolkit {
    private __builder = new DocumentBuilder();

    public invoiceToPeppolUBL(invoice: Invoice) {
        return this.__builder.generatePeppolInvoice(invoice);
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
