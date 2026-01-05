import { describe, expect, it } from 'vitest';
import { contactSchema } from '../src/documents/common/Contact';

describe('Contact Schema', () => {
    it('should validate a complete contact', () => {
        const validContact = {
            name: 'John Doe',
            phone: '+1-555-123-4567',
            email: 'john.doe@example.com',
        };

        const result = contactSchema.safeParse(validContact);
        expect(result.success).toBe(true);
    });

    it('should validate an empty contact object', () => {
        const emptyContact = {};

        const result = contactSchema.safeParse(emptyContact);
        expect(result.success).toBe(true);
    });

    it('should validate contact with only name', () => {
        const contactWithName = {
            name: 'Jane Smith',
        };

        const result = contactSchema.safeParse(contactWithName);
        expect(result.success).toBe(true);
    });

    it('should validate contact with only phone', () => {
        const contactWithPhone = {
            phone: '+44-20-7123-4567',
        };

        const result = contactSchema.safeParse(contactWithPhone);
        expect(result.success).toBe(true);
    });

    it('should validate contact with only email', () => {
        const contactWithEmail = {
            email: 'contact@business.com',
        };

        const result = contactSchema.safeParse(contactWithEmail);
        expect(result.success).toBe(true);
    });

    it('should reject empty name string', () => {
        const invalidContact = {
            name: '',
            phone: '555-1234',
        };

        const result = contactSchema.safeParse(invalidContact);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['name']);
    });

    it('should reject empty phone string', () => {
        const invalidContact = {
            name: 'Test User',
            phone: '',
        };

        const result = contactSchema.safeParse(invalidContact);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['phone']);
    });

    it('should reject empty email string', () => {
        const invalidContact = {
            name: 'Test User',
            email: '',
        };

        const result = contactSchema.safeParse(invalidContact);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['email']);
    });

    it('should handle international phone numbers', () => {
        const contactWithIntlPhone = {
            name: 'Global User',
            phone: '+49-30-12345678',
            email: 'global@company.de',
        };

        const result = contactSchema.safeParse(contactWithIntlPhone);
        expect(result.success).toBe(true);
    });

    it('should handle various email formats', () => {
        const contactWithComplexEmail = {
            email: 'user.name+tag@subdomain.example.org',
        };

        const result = contactSchema.safeParse(contactWithComplexEmail);
        expect(result.success).toBe(true);
    });
});
