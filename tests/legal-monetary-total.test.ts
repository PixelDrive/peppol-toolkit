import { describe, expect, it } from 'vitest';
import { legalMonetaryTotalSchema } from '../src/documents/common/LegalMonetaryTotal';

describe('Legal Monetary Total Schema', () => {
    it('should validate a complete monetary total', () => {
        const validMonetaryTotal = {
            currency: 'EUR',
            lineExtensionAmount: 1000.0,
            taxExclusiveAmount: 1000.0,
            taxInclusiveAmount: 1210.0,
            payableAmount: 1210.0,
            payableRoundingAmount: 0.0,
            prepaidAmount: 0.0,
            allowanceTotalAmount: 0.0,
            chargeTotalAmount: 0.0,
            lineExtensionAmountCurrency: 'EUR',
            taxExclusiveAmountCurrency: 'EUR',
            taxInclusiveAmountCurrency: 'EUR',
            payableAmountCurrency: 'EUR',
            prepaidAmountCurrency: 'EUR',
            allowanceTotalAmountCurrency: 'EUR',
            chargeTotalAmountCurrency: 'EUR',
            payableRoundingAmountCurrency: 'EUR',
        };

        const result = legalMonetaryTotalSchema.safeParse(validMonetaryTotal);
        expect(result.success).toBe(true);
    });

    it('should validate minimal required fields only', () => {
        const minimalMonetaryTotal = {
            currency: 'USD',
            lineExtensionAmount: 500.0,
            taxExclusiveAmount: 500.0,
            taxInclusiveAmount: 605.0,
            payableAmount: 605.0,
        };

        const result = legalMonetaryTotalSchema.safeParse(minimalMonetaryTotal);
        expect(result.success).toBe(true);
    });

    it('should reject missing currency', () => {
        const invalidMonetaryTotal = {
            lineExtensionAmount: 1000.0,
            taxExclusiveAmount: 1000.0,
            taxInclusiveAmount: 1210.0,
            payableAmount: 1210.0,
        };

        const result = legalMonetaryTotalSchema.safeParse(invalidMonetaryTotal);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['currency']);
    });

    it('should reject missing required amount fields', () => {
        const invalidMonetaryTotal = {
            currency: 'GBP',
            lineExtensionAmount: 1000.0,
            // Missing taxExclusiveAmount
            taxInclusiveAmount: 1210.0,
            payableAmount: 1210.0,
        };

        const result = legalMonetaryTotalSchema.safeParse(invalidMonetaryTotal);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['taxExclusiveAmount']);
    });

    it('should accept different valid currency codes', () => {
        const monetaryTotalWithDifferentCurrency = {
            currency: 'JPY',
            lineExtensionAmount: 100000,
            taxExclusiveAmount: 100000,
            taxInclusiveAmount: 110000,
            payableAmount: 110000,
        };

        const result = legalMonetaryTotalSchema.safeParse(
            monetaryTotalWithDifferentCurrency
        );
        expect(result.success).toBe(true);
    });

    it('should reject invalid currency code', () => {
        const invalidMonetaryTotal = {
            currency: 'INVALID',
            lineExtensionAmount: 1000.0,
            taxExclusiveAmount: 1000.0,
            taxInclusiveAmount: 1210.0,
            payableAmount: 1210.0,
        };

        const result = legalMonetaryTotalSchema.safeParse(invalidMonetaryTotal);
        expect(result.success).toBe(false);
    });

    it('should handle zero amounts', () => {
        const monetaryTotalWithZeros = {
            currency: 'EUR',
            lineExtensionAmount: 0,
            taxExclusiveAmount: 0,
            taxInclusiveAmount: 0,
            payableAmount: 0,
            payableRoundingAmount: 0,
            prepaidAmount: 0,
            allowanceTotalAmount: 0,
            chargeTotalAmount: 0,
        };

        const result = legalMonetaryTotalSchema.safeParse(
            monetaryTotalWithZeros
        );
        expect(result.success).toBe(true);
    });

    it('should handle negative amounts', () => {
        const monetaryTotalWithNegatives = {
            currency: 'EUR',
            lineExtensionAmount: -100.0,
            taxExclusiveAmount: -100.0,
            taxInclusiveAmount: -121.0,
            payableAmount: -121.0,
            allowanceTotalAmount: 50.0, // Allowances can be positive to reduce the total
        };

        const result = legalMonetaryTotalSchema.safeParse(
            monetaryTotalWithNegatives
        );
        expect(result.success).toBe(true);
    });

    it('should validate with mixed optional currency fields', () => {
        const monetaryTotalMixedCurrencies = {
            currency: 'EUR',
            lineExtensionAmount: 1000.0,
            taxExclusiveAmount: 1000.0,
            taxInclusiveAmount: 1210.0,
            payableAmount: 1210.0,
            prepaidAmount: 100.0,
            lineExtensionAmountCurrency: 'USD', // Different from main currency
            prepaidAmountCurrency: 'GBP', // Different from main currency
        };

        const result = legalMonetaryTotalSchema.safeParse(
            monetaryTotalMixedCurrencies
        );
        expect(result.success).toBe(true);
    });

    it('should reject non-numeric amounts', () => {
        const invalidMonetaryTotal = {
            currency: 'EUR',
            lineExtensionAmount: 'not-a-number',
            taxExclusiveAmount: 1000.0,
            taxInclusiveAmount: 1210.0,
            payableAmount: 1210.0,
        };

        const result = legalMonetaryTotalSchema.safeParse(invalidMonetaryTotal);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['lineExtensionAmount']);
    });
});
