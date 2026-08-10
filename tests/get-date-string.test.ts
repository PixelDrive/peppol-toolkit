import { describe, expect, it } from 'vitest';
import getDateString from '../src/helpers/getDateString';

describe('getDateString', () => {
    it('should return a string date unchanged', () => {
        expect(getDateString('2026-05-15')).toBe('2026-05-15');
    });

    it('should pad single-digit months and days', () => {
        expect(getDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('should preserve two-digit months and days', () => {
        expect(getDateString(new Date(2026, 10, 15))).toBe('2026-11-15');
    });
});
