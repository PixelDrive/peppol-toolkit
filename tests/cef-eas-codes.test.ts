import { describe, expect, it } from 'vitest';
import {
    CefEASCodes,
    CefEASCodeSchema,
    EASCodes,
    getCefEASDescription,
    isValidCefEASCode,
} from '../src';

describe('CEF EAS codes', () => {
    it('contain the e-mail scheme and the other UNECE 3155 schemes', () => {
        for (const code of ['EM', 'AN', 'AQ', 'AS', 'AU']) {
            expect(isValidCefEASCode(code)).toBe(true);
        }
        expect(getCefEASDescription('EM')).toBe('Electronic mail');
    });

    it('contain every Peppol EAS code', () => {
        for (const code of Object.keys(EASCodes)) {
            expect(isValidCefEASCode(code), code).toBe(true);
        }
    });

    it('follow BR-CL-25 of the EN 16931 validation artefacts v1.3.17', () => {
        expect(Object.keys(CefEASCodes)).toHaveLength(103);
        expect(isValidCefEASCode('9960')).toBe(true); // added in version 17.0
        expect(isValidCefEASCode('0219')).toBe(false); // removed in version 17.0
        expect(isValidCefEASCode('XA')).toBe(false); // not accepted by BR-CL-25 yet
        expect(isValidCefEASCode('9955')).toBe(false); // deprecated
    });

    it('reject unknown codes', () => {
        for (const code of ['', 'XX', '9999', 'em', 'constructor']) {
            expect(isValidCefEASCode(code), code).toBe(false);
            expect(CefEASCodeSchema.safeParse(code).success, code).toBe(false);
        }
    });

    it('have a schema accepting every code', () => {
        for (const code of Object.keys(CefEASCodes)) {
            expect(CefEASCodeSchema.safeParse(code).success, code).toBe(true);
        }
    });
});
