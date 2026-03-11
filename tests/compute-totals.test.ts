import { describe, it, expect } from 'vitest';
import { PeppolToolkit } from '../src';

const computePeppolTotals = PeppolToolkit.computeTotals;

describe('computePeppolTotals', () => {
    describe('single item', () => {
        it('computes correct totals for a simple item', () => {
            const { baseAmount, taxAmount, totalAmount } = computePeppolTotals([
                { price: 10, quantity: 1, taxPercent: 21 },
            ]);
            expect(baseAmount.toString()).toBe('10');
            expect(taxAmount.toString()).toBe('2.1');
            expect(totalAmount.toString()).toBe('12.1');
        });

        it('rounds the line extension amount to 2 decimal places (ROUND_HALF_UP)', () => {
            const { baseAmount } = computePeppolTotals([
                { price: '1.115', quantity: 1, taxPercent: 0 },
            ]);
            expect(baseAmount.toString()).toBe('1.12');
        });

        it('rounds the tax amount to 2 decimal places (ROUND_HALF_UP)', () => {
            const { taxAmount } = computePeppolTotals([
                { price: '1.11', quantity: 1, taxPercent: 21 },
            ]);
            expect(taxAmount.toString()).toBe('0.23');
        });

        it('handles zero VAT rate', () => {
            const { baseAmount, taxAmount, totalAmount } = computePeppolTotals([
                { price: '50.00', quantity: 2, taxPercent: 0 },
            ]);
            expect(baseAmount.toString()).toBe('100');
            expect(taxAmount.toString()).toBe('0');
            expect(totalAmount.toString()).toBe('100');
        });
    });

    describe('multiple items with the same VAT rate', () => {
        it('groups items by VAT rate and rounds tax per group, not per line', () => {
            const { taxAmount, baseAmount, totalAmount } = computePeppolTotals([
                { price: '1.11', quantity: 1, taxPercent: 21 },
                { price: '1.11', quantity: 1, taxPercent: 21 },
            ]);
            expect(baseAmount.toString()).toBe('2.22');
            expect(taxAmount.toString()).toBe('0.47');
            expect(totalAmount.toString()).toBe('2.69');
        });
    });

    describe('multiple items with different VAT rates', () => {
        it('computes tax per VAT-rate group independently', () => {
            const { baseAmount, taxAmount, totalAmount } = computePeppolTotals([
                { price: '5.00', quantity: 1, taxPercent: 6 },
                { price: '10.00', quantity: 1, taxPercent: 21 },
            ]);
            expect(baseAmount.toString()).toBe('15');
            expect(taxAmount.toString()).toBe('2.4');
            expect(totalAmount.toString()).toBe('17.4');
        });

        it('produces Peppol-correct totals that may differ from naive per-line summation', () => {
            // item1: 1.01 at 6% -> per-line tax = 0.0606
            // item2: 1.07 at 21% -> per-line tax = 0.2247
            // Naive sum (no rounding): 0.0606 + 0.2247 = 0.2853 -> rounds to 0.29
            // Peppol (per-group):
            //   group 6%:  base=1.01, tax = round(0.0606, 2) = 0.06
            //   group 21%: base=1.07, tax = round(0.2247, 2) = 0.22
            //   total tax = 0.06 + 0.22 = 0.28  <-- differs from naive 0.29
            const { baseAmount, taxAmount, totalAmount } = computePeppolTotals([
                { price: '1.01', quantity: 1, taxPercent: 6 },
                { price: '1.07', quantity: 1, taxPercent: 21 },
            ]);
            expect(baseAmount.toString()).toBe('2.08');
            expect(taxAmount.toString()).toBe('0.28');
            expect(totalAmount.toString()).toBe('2.36');
        });
    });

    describe('invoicedQuantity handling', () => {
        it('multiplies price by invoicedQuantity before rounding', () => {
            // 3 units at 10.00 -> lineAmount = 30.00
            const { baseAmount, taxAmount } = computePeppolTotals([
                { price: '10.00', quantity: 3, taxPercent: 21 },
            ]);
            expect(baseAmount.toString()).toBe('30');
            expect(taxAmount.toString()).toBe('6.3');
        });
    });

    describe('string and number price', () => {
        it('accepts string price', () => {
            const { baseAmount } = computePeppolTotals([
                { price: '9.99', quantity: 1, taxPercent: 0 },
            ]);
            expect(baseAmount.toString()).toBe('9.99');
        });

        it('accepts number price', () => {
            const { baseAmount } = computePeppolTotals([
                { price: 9.99, quantity: 1, taxPercent: 0 },
            ]);
            expect(baseAmount.toString()).toBe('9.99');
        });
    });

    describe('empty items', () => {
        it('returns zero totals for empty items array', () => {
            const { baseAmount, taxAmount, totalAmount } = computePeppolTotals(
                []
            );
            expect(baseAmount.toString()).toBe('0');
            expect(taxAmount.toString()).toBe('0');
            expect(totalAmount.toString()).toBe('0');
        });
    });

    describe('lines', () => {
        it('returns items with lineExtensionAmount', () => {
            const { itemsWithLineExtensionAmount } = computePeppolTotals([
                { price: '2.45', quantity: 2, taxPercent: 0 },
            ]);
            expect(itemsWithLineExtensionAmount.length).toBe(1);
            expect(
                itemsWithLineExtensionAmount[0].lineExtensionAmount.toString()
            ).toBe('4.9');
        });

        it('returns items with custom properties', () => {
            const { itemsWithLineExtensionAmount } = computePeppolTotals([
                { price: '2.45', quantity: 2, taxPercent: 0, taxCategory: 'A' },
            ]);

            expect(itemsWithLineExtensionAmount[0].taxCategory).toBe('A');
        });
    });
});
