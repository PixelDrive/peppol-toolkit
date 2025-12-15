/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';
import { creditNoteSchema, lineSchema } from '../src';
import { basicCreditNote } from '../src/data/basic-creditNote';

describe('CreditNote Lines', () => {
    it('should have property "creditNoteLines"', () => {
        const { creditNoteLines, ...theRest } = basicCreditNote;

        const newInvoice = { ...theRest };

        const result = creditNoteSchema.safeParse(newInvoice);
        expect(result.success).toBe(false);
        expect(result.error?.message).toContain(
            'Invalid input: expected array, received undefined'
        );
    });

    it('should have at least 1 line item', () => {
        const sampleInvoice1 = { ...basicCreditNote };
        const sampleInvoice2 = { ...basicCreditNote };

        sampleInvoice1.creditNoteLines = [];

        const result1 = creditNoteSchema.safeParse(sampleInvoice1);
        const result2 = creditNoteSchema.safeParse(sampleInvoice2);

        expect(result1.success).toBe(false);
        expect(result1.error?.message).toContain(
            'Too small: expected array to have >=1 items'
        );

        expect(result2.success).toBe(true);
    });

    it('should return success if the lines include only required fields', () => {
        const creditNoteLines = {
            id: '1',
            invoicedQuantity: 1,
            lineExtensionAmount: 100.0,
            price: 100,
            name: 'Petit poney',
            currency: 'EUR',
            additionalItemProperties: {
                test: 'hello world',
            },
            unitCode: 'DAY',
            taxCategory: {
                percent: 21,
                categoryCode: 'S',
            },
        };
        const result1 = lineSchema.safeParse(creditNoteLines);
        expect(result1.success).toBe(true);
    });

    it('should return failure if the invoiceQuantity is negative', () => {
        const creditNoteLines = {
            id: '1',
            invoicedQuantity: -1,
            lineExtensionAmount: 100.0,
            price: 100,
            name: 'Petit poney',
            currency: 'EUR',
            additionalItemProperties: {
                test: 'hello world',
            },
            unitCode: 'DAY',
            taxCategory: {
                percent: 21,
                categoryCode: 'S',
            },
        };
        const result1 = lineSchema.safeParse(creditNoteLines);
        expect(result1.success).toBe(false);
        expect(result1.error?.message).toContain(
            'Too small: expected number to be >=0'
        );
    });

    it('should return failure if the currencyCode is not in supported list', () => {
        const creditNoteLines = {
            id: '1',
            invoicedQuantity: 10,
            lineExtensionAmount: 100.0,
            price: 100,
            name: 'Petit poney',
            currency: 'INV',
            additionalItemProperties: {
                test: 'hello world',
            },
            unitCode: 'DAY',
            taxCategory: {
                percent: 21,
                categoryCode: 'S',
            },
        };
        const result1 = lineSchema.safeParse(creditNoteLines);
        expect(result1.success).toBe(false);
        expect(result1.error?.message).toContain('Invalid option');
    });

    it('should return failure if the unitCode is not in supported list', () => {
        const creditNoteLines = {
            id: '1',
            invoicedQuantity: 10,
            lineExtensionAmount: 100.0,
            price: 100,
            name: 'Petit poney',
            currency: 'EUR',
            additionalItemProperties: {
                test: 'hello world',
            },
            unitCode: 'DAY1',
            taxCategory: {
                percent: 21,
                categoryCode: 'S',
            },
        };
        const result1 = lineSchema.safeParse(creditNoteLines);
        expect(result1.success).toBe(false);
        expect(result1.error?.message).toContain('Invalid option');
    });

    it('should return failure if the taxCategory is not in supported list', () => {
        const creditNoteLines = {
            id: '1',
            invoicedQuantity: 10,
            lineExtensionAmount: 100.0,
            price: 100,
            name: 'Petit poney',
            currency: 'EUR',
            additionalItemProperties: {
                test: 'hello world',
            },
            unitCode: 'H67',
            taxCategory: {
                percent: 21,
                categoryCode: '',
            },
        };
        const result1 = lineSchema.safeParse(creditNoteLines);
        expect(result1.success).toBe(false);
        expect(result1.error?.issues[0].path).toContain('taxCategory');
        expect(result1.error?.message).toContain('Invalid option');
    });
});
