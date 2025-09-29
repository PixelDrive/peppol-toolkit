import { describe, expect, it } from 'vitest';
import { getCurrencyDescription, isValidCurrencyCode } from '../src';

describe('Currency Codes', () => {
    it('should validate valid currency codes', () => {
        expect(isValidCurrencyCode('USD')).toBe(true);
        expect(isValidCurrencyCode('EUR')).toBe(true);
        expect(isValidCurrencyCode('GBP')).toBe(true);
        expect(isValidCurrencyCode('JPY')).toBe(true);
    });

    it('should reject invalid currency codes', () => {
        expect(isValidCurrencyCode('INVALID')).toBe(false);
        expect(isValidCurrencyCode('XYZ')).toBe(false);
        expect(isValidCurrencyCode('')).toBe(false);
    });

    it('should return correct currency descriptions', () => {
        expect(getCurrencyDescription('USD')).toBe('US Dollar');
        expect(getCurrencyDescription('EUR')).toBe('Euro');
        expect(getCurrencyDescription('GBP')).toBe('Pound Sterling');
        expect(getCurrencyDescription('JPY')).toBe('Yen');
        expect(getCurrencyDescription('AED')).toBe('UAE Dirham');
    });
});
