import { DocumentBuilder } from './builder';
import { CreditNote, creditNoteSchema } from './documents/invoices/CreditNote';
import { Invoice, invoiceSchema } from './documents/invoices/Invoice';

type InvoiceGenerationResult = {
    message: string;
    success: boolean;
    data: string; //xml string
};
export class PeppolToolkit {
    private __builder = new DocumentBuilder();

    #validateSchemaAndReturnResult<
        T extends typeof invoiceSchema | typeof creditNoteSchema,
    >(
        ublInJson: Invoice | CreditNote,
        schema: T,
        invoiceDataCreator: (...args: unknown[]) => string
    ) {
        const result = schema.safeParse(ublInJson);
        if (result.error && result.success === false) {
            return {
                message: result.error.message,
                success: false,
                data: '',
            };
        }
        const generatedData = invoiceDataCreator(ublInJson);
        return {
            message: '',
            success: true,
            data: generatedData,
        };
    }

    public invoiceToPeppolUBL(invoice: Invoice): InvoiceGenerationResult {
        return this.#validateSchemaAndReturnResult(invoice, invoiceSchema, () =>
            this.__builder.generatePeppolInvoice(invoice)
        );
    }

    public creditNoteToPeppolUBL(
        creditNote: CreditNote
    ): InvoiceGenerationResult {
        return this.#validateSchemaAndReturnResult(
            creditNote,
            creditNoteSchema,
            () => this.__builder.generatePeppolCreditNote(creditNote)
        );
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
