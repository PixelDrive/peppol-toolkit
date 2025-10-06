import { describe, expect, it } from 'vitest';
import { addressSchema } from '../src/documents/common/AdressSchema';

describe('Address Schema', () => {
    it('should validate a complete address', () => {
        const validAddress = {
            streetName: '123 Main Street',
            additionalStreetName: 'Suite 100',
            cityName: 'New York',
            postalZone: '10001',
            countrySubentity: 'NY',
            addressLine: '123 Main Street, Suite 100',
            country: 'US',
        };

        const result = addressSchema.safeParse(validAddress);
        expect(result.success).toBe(true);
    });

    it('should validate minimal address with only country', () => {
        const minimalAddress = {
            country: 'GB',
        };

        const result = addressSchema.safeParse(minimalAddress);
        expect(result.success).toBe(true);
    });

    it('should reject address without country', () => {
        const invalidAddress = {
            streetName: '123 Main Street',
            cityName: 'London',
        };

        const result = addressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['country']);
    });

    it('should reject invalid country code', () => {
        const invalidAddress = {
            country: 'INVALID',
            streetName: '123 Main Street',
        };

        const result = addressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
    });

    it('should validate address with partial information', () => {
        const partialAddress = {
            streetName: 'Hauptstraße 1',
            cityName: 'Berlin',
            country: 'DE',
        };

        const result = addressSchema.safeParse(partialAddress);
        expect(result.success).toBe(true);
    });

    it('should handle empty strings in optional fields', () => {
        const addressWithEmptyStrings = {
            streetName: '',
            cityName: 'Paris',
            country: 'FR',
        };

        const result = addressSchema.safeParse(addressWithEmptyStrings);
        expect(result.success).toBe(true);
    });
});