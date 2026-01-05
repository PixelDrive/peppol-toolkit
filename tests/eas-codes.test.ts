import { describe, expect, it } from 'vitest';
import {
    EASCodeSchema,
    getEASDescription,
    isValidEASCode,
    EASCodes,
} from '../src/documents/common/EASCodes';

describe('EAS Codes', () => {
    describe('EASCodeSchema', () => {
        it('should validate common EAS codes', () => {
            const validCodes = ['0060', '0088', '0199', '9920', '9930', '9944'];

            validCodes.forEach((code) => {
                const result = EASCodeSchema.safeParse(code);
                expect(result.success).toBe(true);
            });
        });

        it('should validate all defined EAS codes', () => {
            Object.keys(EASCodes).forEach((code) => {
                const result = EASCodeSchema.safeParse(code);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid EAS codes', () => {
            const invalidCodes = ['9999', '0000', '1234', 'INVALID', 'ABC'];

            invalidCodes.forEach((code) => {
                const result = EASCodeSchema.safeParse(code);
                expect(result.success).toBe(false);
            });
        });

        it('should reject empty string', () => {
            const result = EASCodeSchema.safeParse('');
            expect(result.success).toBe(false);
        });

        it('should reject numeric values', () => {
            const result = EASCodeSchema.safeParse(60);
            expect(result.success).toBe(false);
        });
    });

    describe('isValidEASCode function', () => {
        it('should return true for valid EAS codes', () => {
            expect(isValidEASCode('0060')).toBe(true); // DUNS
            expect(isValidEASCode('0088')).toBe(true); // EAN Location Code
            expect(isValidEASCode('0199')).toBe(true); // Legal Entity Identifier
            expect(isValidEASCode('9920')).toBe(true); // Spain VAT
            expect(isValidEASCode('9930')).toBe(true); // Germany VAT
        });

        it('should return false for invalid EAS codes', () => {
            expect(isValidEASCode('9999')).toBe(false);
            expect(isValidEASCode('0000')).toBe(false);
            expect(isValidEASCode('INVALID')).toBe(false);
            expect(isValidEASCode('')).toBe(false);
        });

        it('should validate all keys from EASCodes object', () => {
            Object.keys(EASCodes).forEach((code) => {
                expect(isValidEASCode(code)).toBe(true);
            });
        });
    });

    describe('getEASDescription function', () => {
        it('should return correct descriptions for common codes', () => {
            expect(getEASDescription('0060')).toBe(
                'Data Universal Numbering System (D-U-N-S Number)'
            );
            expect(getEASDescription('0088')).toBe('EAN Location Code');
            expect(getEASDescription('0199')).toBe(
                'Legal Entity Identifier (LEI)'
            );
            expect(getEASDescription('9920')).toBe(
                'Agencia Española de Administración Tributaria'
            );
            expect(getEASDescription('9930')).toBe('Germany VAT number');
        });

        it('should return descriptions for VAT number codes', () => {
            const vatCodes = ['9925', '9930', '9932', '9944', '9957'];
            const expectedDescriptions = [
                'Belgium VAT number',
                'Germany VAT number',
                'United Kingdom VAT number',
                'Netherlands VAT number',
                'French VAT number',
            ];

            vatCodes.forEach((code, index) => {
                expect(getEASDescription(code as keyof typeof EASCodes)).toBe(
                    expectedDescriptions[index]
                );
            });
        });

        it('should return descriptions for business register codes', () => {
            expect(getEASDescription('0009')).toBe('SIRET-CODE');
            expect(getEASDescription('0151')).toBe(
                'Australian Business Number (ABN) Scheme'
            );
            expect(getEASDescription('0183')).toBe(
                "Numéro d'identification suisse des enterprises (IDE), Swiss Unique Business Identification Number (UIDB)"
            );
        });

        it('should return descriptions for all defined codes', () => {
            Object.entries(EASCodes).forEach(([code, description]) => {
                expect(getEASDescription(code as keyof typeof EASCodes)).toBe(
                    description
                );
            });
        });
    });

    describe('EASCodes object', () => {
        it('should contain expected number of codes', () => {
            const codeCount = Object.keys(EASCodes).length;
            expect(codeCount).toBeGreaterThan(90); // Should have many codes
        });

        it('should have consistent code format', () => {
            Object.keys(EASCodes).forEach((code) => {
                expect(code).toMatch(/^\d{4}$/); // All codes should be 4 digits
                expect(code.length).toBe(4);
            });
        });

        it('should have non-empty descriptions', () => {
            Object.values(EASCodes).forEach((description) => {
                expect(description).toBeTruthy();
                expect(typeof description).toBe('string');
                expect(description.length).toBeGreaterThan(0);
            });
        });

        it('should include important business identifier schemes', () => {
            expect(EASCodes).toHaveProperty('0060'); // DUNS
            expect(EASCodes).toHaveProperty('0088'); // EAN
            expect(EASCodes).toHaveProperty('0199'); // LEI
            expect(EASCodes).toHaveProperty('9918'); // SWIFT
        });

        it('should include European VAT numbers', () => {
            const europeanVatCodes = ['9925', '9930', '9932', '9944', '9957'];
            europeanVatCodes.forEach((code) => {
                expect(EASCodes).toHaveProperty(code);
                expect(EASCodes[code as keyof typeof EASCodes]).toContain(
                    'VAT number'
                );
            });
        });
    });
});
