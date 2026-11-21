import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
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

    describe('per-rate amounts', () => {
        it('returns the rounded VAT amount per rate (ROUND_HALF_UP)', () => {
            // 250.50 × 21 / 100 = 52.605 -> 52.61 (half-up), not 52.60 (toFixed)
            const { taxAmount, taxAmountPerRate, taxableAmountPerRate } =
                computePeppolTotals([
                    { price: '250.50', quantity: 1, taxPercent: 21 },
                ]);
            expect(taxableAmountPerRate.get('21')?.toString()).toBe('250.5');
            expect(taxAmountPerRate.get('21')?.toString()).toBe('52.61');
            expect(taxAmount.toString()).toBe('52.61');
        });

        it('uses the same keys for taxableAmountPerRate and taxAmountPerRate', () => {
            const { taxableAmountPerRate, taxAmountPerRate } =
                computePeppolTotals([
                    { price: '5.00', quantity: 1, taxPercent: 6 },
                    { price: '10.00', quantity: 1, taxPercent: 21 },
                    { price: '7.00', quantity: 1, taxPercent: 0 },
                ]);
            expect([...taxAmountPerRate.keys()]).toEqual([
                ...taxableAmountPerRate.keys(),
            ]);
            expect([...taxAmountPerRate.keys()]).toEqual(['6', '21', '0']);
            expect(taxAmountPerRate.get('6')?.toString()).toBe('0.3');
            expect(taxAmountPerRate.get('21')?.toString()).toBe('2.1');
            expect(taxAmountPerRate.get('0')?.toString()).toBe('0');
        });

        it('sums the per-rate VAT amounts to exactly taxAmount (BR-CO-14)', () => {
            const { taxAmount, taxAmountPerRate } = computePeppolTotals([
                { price: '1.01', quantity: 1, taxPercent: 6 },
                { price: '1.07', quantity: 1, taxPercent: 21 },
                { price: '250.50', quantity: 1, taxPercent: 21 },
            ]);
            let sum = new Decimal(0);
            for (const amount of taxAmountPerRate.values()) {
                sum = sum.add(amount);
            }
            expect(sum.equals(taxAmount)).toBe(true);
            expect(taxAmountPerRate.get('21')?.toString()).toBe('52.83');
        });

        it('groups per-rate VAT on the rounded group taxable amount', () => {
            // group 21%: 1.11 + 1.11 = 2.22 -> 0.4662 -> 0.47 (per-line rounding would give 0.46)
            const { taxAmountPerRate } = computePeppolTotals([
                { price: '1.11', quantity: 1, taxPercent: 21 },
                { price: '1.11', quantity: 1, taxPercent: 21 },
            ]);
            expect(taxAmountPerRate.get('21')?.toString()).toBe('0.47');
        });

        it('returns empty maps for empty items array', () => {
            const { taxableAmountPerRate, taxAmountPerRate } =
                computePeppolTotals([]);
            expect(taxableAmountPerRate.size).toBe(0);
            expect(taxAmountPerRate.size).toBe(0);
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
