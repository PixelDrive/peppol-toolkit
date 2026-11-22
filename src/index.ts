import { DocumentBuilder } from './builder';
import { DocumentParser, detectUblProfile } from './parser';
import {
    CreditNote,
    En16931CreditNote,
    En16931Invoice,
    getEASFromTaxId,
    Invoice,
} from './documents';
import { computeTotals } from './helpers/computeTotals';
import {
    KositValidator,
    KositValidatorOptions,
    KositValidationResult,
} from './validator';

export class PeppolToolkit {
    private __builder = new DocumentBuilder();
    private __parser = new DocumentParser();
    private __kositValidator: KositValidator | null = null;

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

    /**
     * Converts an invoice to an EN 16931 UBL document (core model, without the Peppol CIUS), for
     * invoices that do not travel over Peppol (e.g. to a consumer). The seller and the buyer may
     * have no electronic address.
     * @param invoice The invoice data
     * @returns The EN 16931 UBL Invoice XML document
     */
    public invoiceToEn16931UBL(invoice: En16931Invoice): string {
        return this.__builder.generateEn16931Invoice(invoice);
    }

    /**
     * Converts a credit note to an EN 16931 UBL document (core model, without the Peppol CIUS).
     * The seller and the buyer may have no electronic address.
     * @param creditNote The credit note data
     * @returns The EN 16931 UBL CreditNote XML document
     */
    public creditNoteToEn16931UBL(creditNote: En16931CreditNote): string {
        return this.__builder.generateEn16931CreditNote(creditNote);
    }

    /**
     * Parses a UBL Invoice following the EN 16931 model (Peppol BIS invoices included)
     * @param xml The UBL Invoice XML string
     */
    public en16931UBLToInvoice(xml: string): En16931Invoice {
        return this.__parser.parseEn16931Invoice(xml);
    }

    /**
     * Parses a UBL CreditNote following the EN 16931 model (Peppol BIS credit notes included)
     * @param xml The UBL CreditNote XML string
     */
    public en16931UBLToCreditNote(xml: string): En16931CreditNote {
        return this.__parser.parseEn16931CreditNote(xml);
    }

    /**
     * Validates a UBL XML document using the Kosit validator service.
     * @param xml The XML document to validate.
     * @param options Optional configuration for the validator endpoint.
     * @returns The validation result including validity status, errors, and warnings.
     */
    public async validateWithKosit(
        xml: string,
        options?: KositValidatorOptions
    ): Promise<KositValidationResult> {
        const validator = options
            ? new KositValidator(options)
            : (this.__kositValidator ??= new KositValidator());
        return await validator.validate(xml);
    }

    public static computeTotals = computeTotals;
    public static getEASFromTaxId = getEASFromTaxId;
    public static detectUblProfile = detectUblProfile;
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
export * from './validator';
export type { UBLLineItem, VATBreakdownEntry } from './helpers/computeTotals';
export { basicInvoice as exampleInvoice } from './data/basic-invoice';
export { basicCreditNote as exampleCreditNote } from './data/basic-creditNote';
export { en16931Invoice as exampleEn16931Invoice } from './data/en16931-invoice';
export { en16931CreditNote as exampleEn16931CreditNote } from './data/en16931-creditNote';
