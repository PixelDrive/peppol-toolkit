import { describe, expect, it } from 'vitest';
import { CountryCodeSchema } from '../src/documents/common/CountryCodes';

describe('Country Codes Schema', () => {
    it('should validate common country codes', () => {
        const validCodes = [
            'US',
            'GB',
            'DE',
            'FR',
            'IT',
            'ES',
            'NL',
            'BE',
            'AT',
            'CH',
        ];

        validCodes.forEach((code) => {
            const result = CountryCodeSchema.safeParse(code);
            expect(result.success).toBe(true);
        });
    });

    it('should validate additional European country codes', () => {
        const europeanCodes = [
            'DK',
            'SE',
            'NO',
            'FI',
            'PL',
            'CZ',
            'HU',
            'PT',
            'GR',
            'IE',
        ];

        europeanCodes.forEach((code) => {
            const result = CountryCodeSchema.safeParse(code);
            expect(result.success).toBe(true);
        });
    });

    it('should validate Asia-Pacific country codes', () => {
        const asiaPacificCodes = [
            'JP',
            'CN',
            'KR',
            'AU',
            'NZ',
            'SG',
            'HK',
            'TW',
            'TH',
            'IN',
        ];

        asiaPacificCodes.forEach((code) => {
            const result = CountryCodeSchema.safeParse(code);
            expect(result.success).toBe(true);
        });
    });

    it('should reject invalid country codes', () => {
        const invalidCodes = ['XX', 'ZZ', 'INVALID', '99', 'ABC'];

        invalidCodes.forEach((code) => {
            const result = CountryCodeSchema.safeParse(code);
            expect(result.success).toBe(false);
        });
    });

    it('should reject empty string', () => {
        const result = CountryCodeSchema.safeParse('');
        expect(result.success).toBe(false);
    });

    it('should reject lowercase country codes', () => {
        const lowercaseCodes = ['us', 'gb', 'de', 'fr'];

        lowercaseCodes.forEach((code) => {
            const result = CountryCodeSchema.safeParse(code);
            expect(result.success).toBe(false);
        });
    });

    it('should reject numeric values', () => {
        const result = CountryCodeSchema.safeParse(123);
        expect(result.success).toBe(false);
    });

    it('should reject null and undefined', () => {
        expect(CountryCodeSchema.safeParse(null).success).toBe(false);
        expect(CountryCodeSchema.safeParse(undefined).success).toBe(false);
    });
});
