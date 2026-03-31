import { DocumentBuilder } from './builder';
import { DocumentParser } from './parser';
import { CreditNote, getEASFromTaxId, Invoice } from './documents';
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
export { basicInvoice as exampleInvoice } from './data/basic-invoice';
export { basicCreditNote as exampleCreditNote } from './data/basic-creditNote';
