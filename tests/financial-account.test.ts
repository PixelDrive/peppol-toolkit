import { describe, expect, it } from 'vitest';
import { financialAccountSchema } from '../src/documents/common/FinancialAccount';

describe('Financial Account Schema', () => {
    it('should validate a complete financial account', () => {
        const validAccount = {
            id: 'DE89370400440532013000',
            name: 'Business Account',
            financialInstitutionBranch: 'COBADEFFXXX',
        };

        const result = financialAccountSchema.safeParse(validAccount);
        expect(result.success).toBe(true);
    });

    it('should validate minimal account with only id', () => {
        const minimalAccount = {
            id: 'GB82WEST12345698765432',
        };

        const result = financialAccountSchema.safeParse(minimalAccount);
        expect(result.success).toBe(true);
    });

    it('should validate account with name but no branch', () => {
        const accountWithName = {
            id: 'FR1420041010050500013M02606',
            name: 'Main Business Account',
        };

        const result = financialAccountSchema.safeParse(accountWithName);
        expect(result.success).toBe(true);
    });

    it('should validate account with branch but no name', () => {
        const accountWithBranch = {
            id: 'IT60X0542811101000000123456',
            financialInstitutionBranch: 'BPMIITMMXXX',
        };

        const result = financialAccountSchema.safeParse(accountWithBranch);
        expect(result.success).toBe(true);
    });

    it('should reject account without id', () => {
        const invalidAccount = {
            name: 'Business Account',
            financialInstitutionBranch: 'COBADEFFXXX',
        };

        const result = financialAccountSchema.safeParse(invalidAccount);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['id']);
    });

    it('should accept empty id string', () => {
        const accountWithEmptyId = {
            id: '',
            name: 'Business Account',
        };

        const result = financialAccountSchema.safeParse(accountWithEmptyId);
        expect(result.success).toBe(true);
    });

    it('should handle various IBAN formats', () => {
        const ibanFormats = [
            'DE89370400440532013000', // Germany
            'GB82WEST12345698765432', // UK
            'FR1420041010050500013M02606', // France
            'ES9121000418450200051332', // Spain
            'IT60X0542811101000000123456', // Italy
            'NL91ABNA0417164300', // Netherlands
        ];

        ibanFormats.forEach(iban => {
            const account = { id: iban };
            const result = financialAccountSchema.safeParse(account);
            expect(result.success).toBe(true);
        });
    });

    it('should handle non-IBAN account identifiers', () => {
        const nonIbanAccounts = [
            { id: '123456789012' }, // Basic account number
            { id: 'US-ACCOUNT-12345' }, // US-style account
            { id: '0123-456-789' }, // Account with dashes
        ];

        nonIbanAccounts.forEach(account => {
            const result = financialAccountSchema.safeParse(account);
            expect(result.success).toBe(true);
        });
    });

    it('should handle various BIC codes', () => {
        const bicCodes = [
            'COBADEFFXXX', // German BIC
            'BPMIITMMXXX', // Italian BIC
            'BNPAFRPPXXX', // French BIC
            'ABNANL2AXXX', // Dutch BIC
            'CHASUS33XXX', // US BIC
        ];

        bicCodes.forEach(bic => {
            const account = {
                id: 'DE89370400440532013000',
                financialInstitutionBranch: bic,
            };
            const result = financialAccountSchema.safeParse(account);
            expect(result.success).toBe(true);
        });
    });

    it('should handle long account names', () => {
        const accountWithLongName = {
            id: 'DE89370400440532013000',
            name: 'Very Long Business Account Name for International Corporation Ltd.',
        };

        const result = financialAccountSchema.safeParse(accountWithLongName);
        expect(result.success).toBe(true);
    });

    it('should handle special characters in account name', () => {
        const accountWithSpecialChars = {
            id: 'FR1420041010050500013M02606',
            name: 'Compagnie Française & Co. - Compte Principal',
        };

        const result = financialAccountSchema.safeParse(accountWithSpecialChars);
        expect(result.success).toBe(true);
    });

    it('should handle empty optional fields', () => {
        const accountWithEmptyOptionals = {
            id: 'GB82WEST12345698765432',
            name: '',
            financialInstitutionBranch: '',
        };

        const result = financialAccountSchema.safeParse(accountWithEmptyOptionals);
        expect(result.success).toBe(true);
    });
});