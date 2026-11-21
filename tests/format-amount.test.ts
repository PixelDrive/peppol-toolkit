import { describe, expect, it } from 'vitest';
import { formatAmount } from '../src/helpers/formatAmount';

describe('formatAmount', () => {
    it('formats amounts with at most two decimals', () => {
        expect(formatAmount('x', 0)).toBe('0.00');
        expect(formatAmount('x', 21)).toBe('21.00');
        expect(formatAmount('x', 0.1)).toBe('0.10');
        expect(formatAmount('x', 52.61)).toBe('52.61');
        expect(formatAmount('x', 1234567.89)).toBe('1234567.89');
    });

    it('formats negative amounts', () => {
        expect(formatAmount('x', -0.5)).toBe('-0.50');
        expect(formatAmount('x', -121)).toBe('-121.00');
    });

    it('rejects half-cent values instead of rounding them with toFixed', () => {
        // Values from the issue: toFixed(2) rounds these differently than ROUND_HALF_UP
        for (const value of [1.005, 2.675, 10.235, 52.605, 0.125]) {
            expect(() => formatAmount('x', value)).toThrow(
                /more than 2 decimal places/
            );
        }
    });

    it('rejects floating point noise', () => {
        expect(() => formatAmount('x', 0.1 + 0.2)).toThrow(
            /more than 2 decimal places/
        );
    });

    it('names the offending field and value in the error message', () => {
        expect(() => formatAmount('taxTotal[0].taxAmount', 52.605)).toThrow(
            'Invalid amount for "taxTotal[0].taxAmount": 52.605 has more than 2 decimal places'
        );
    });

    it('rejects non-finite amounts', () => {
        expect(() => formatAmount('x', Number.NaN)).toThrow(
            /expected a finite number/
        );
        expect(() => formatAmount('x', Number.POSITIVE_INFINITY)).toThrow(
            /expected a finite number/
        );
    });
});
