import { expect, it, describe } from 'vitest';
import { Invoice, invoiceSchema } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';

describe('InvoiceTypeCodes', () => {
    it('should accept if it is in the supported list', () => {
        const sampleInvoice: Invoice = {
            ...basicInvoice,
            invoiceTypeCode: 380,
        };
        const result = invoiceSchema.safeParse(sampleInvoice);
        expect(result.success).toBe(true);
    });

    it('should return errors if not in supported list', () => {
        const sampleInvoice: Invoice = {
            ...basicInvoice,
            invoiceTypeCode: 381,
        };
        const result = invoiceSchema.safeParse(sampleInvoice);
        console.log(result);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path.toString()).toContain(
            'invoiceTypeCode'
        );
    });
});
