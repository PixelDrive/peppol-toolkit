import { describe, expect, it } from 'vitest';
import { getPaymentMeansDescription, isValidPaymentMeansCode } from '../src';

describe('Payment Means Codes', () => {
    it('should validate valid payment means codes', () => {
        expect(isValidPaymentMeansCode('1')).toBe(true);
        expect(isValidPaymentMeansCode('10')).toBe(true);
        expect(isValidPaymentMeansCode('20')).toBe(true);
        expect(isValidPaymentMeansCode('30')).toBe(true);
        expect(isValidPaymentMeansCode('42')).toBe(true);
        expect(isValidPaymentMeansCode('48')).toBe(true);
        expect(isValidPaymentMeansCode('49')).toBe(true);
        expect(isValidPaymentMeansCode('58')).toBe(true);
        expect(isValidPaymentMeansCode('59')).toBe(true);
        expect(isValidPaymentMeansCode('ZZZ')).toBe(true);
    });

    it('should reject invalid payment means codes', () => {
        expect(isValidPaymentMeansCode('INVALID')).toBe(false);
        expect(isValidPaymentMeansCode('999')).toBe(false);
        expect(isValidPaymentMeansCode('')).toBe(false);
        expect(isValidPaymentMeansCode('ABC')).toBe(false);
    });

    it('should return correct payment means descriptions', () => {
        expect(getPaymentMeansDescription('1')).toBe('Instrument not defined');
        expect(getPaymentMeansDescription('10')).toBe('In cash');
        expect(getPaymentMeansDescription('20')).toBe('Cheque');
        expect(getPaymentMeansDescription('30')).toBe('Credit transfer');
        expect(getPaymentMeansDescription('42')).toBe('Payment to bank account');
        expect(getPaymentMeansDescription('48')).toBe('Bank card');
        expect(getPaymentMeansDescription('49')).toBe('Direct debit');
        expect(getPaymentMeansDescription('58')).toBe('SEPA credit transfer');
        expect(getPaymentMeansDescription('59')).toBe('SEPA direct debit');
        expect(getPaymentMeansDescription('ZZZ')).toBe('Mutually defined');
    });
});