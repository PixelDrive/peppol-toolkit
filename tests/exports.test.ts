import { describe, expect, it } from 'vitest';
import pkgDefault, * as pkg from '../src/index';
import { PeppolToolkit } from '../src/index';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** Values added for EN 16931 documents and BIS 3.0.21 (types are checked by the tests using them) */
const addedExports = [
    'CefEASCodes',
    'CefEASCodeSchema',
    'getCefEASDescription',
    'isValidCefEASCode',
    'en16931PartySchema',
    'en16931BuyerPartySchema',
    'buyerPartySchema',
    'En16931InvoiceTypeCodeSchema',
    'En16931CreditNoteTypeCodeSchema',
    'en16931InvoiceSchema',
    'en16931CreditNoteSchema',
    'EN16931_CUSTOMIZATION_ID',
    'PEPPOL_BIS3_CUSTOMIZATION_ID',
    'PEPPOL_BIS3_PROFILE_ID',
    'PEPPOL_BIS3_BILLING_WITH_RESPONSE_PROFILE_ID',
    'detectUblProfile',
    'exampleEn16931Invoice',
    'exampleEn16931CreditNote',
];

const en16931Methods = [
    'invoiceToEn16931UBL',
    'creditNoteToEn16931UBL',
    'en16931UBLToInvoice',
    'en16931UBLToCreditNote',
];

describe('ESM import works', () => {
    it('should export classes and functions with types', () => {
        const client = new PeppolToolkit();
        expect(client).toBeInstanceOf(PeppolToolkit);
    });

    it('default export contains utilities', () => {
        expect(pkgDefault).toHaveProperty('PeppolToolkit');
        expect(pkgDefault).toHaveProperty('createToolkit');
    });

    it('exports the EN 16931 API', () => {
        for (const name of addedExports) {
            expect(pkg, name).toHaveProperty(name);
        }
        for (const method of en16931Methods) {
            expect(PeppolToolkit.prototype, method).toHaveProperty(method);
        }
        expect(PeppolToolkit.detectUblProfile).toBe(pkg.detectUblProfile);
    });
});

describe('CJS require works', () => {
    it('should allow requiring the built CJS bundle', () => {
        // Require the built CJS artifact. The build step runs before tests via npm script.
        const cjs = require('../dist/index.js');
        expect(cjs).toHaveProperty('PeppolToolkit');
        expect(cjs).toHaveProperty('createToolkit');
        const client = cjs.createToolkit();
        expect(client).toBeInstanceOf(cjs.PeppolToolkit);
    });

    it('should expose the EN 16931 API in the built CJS bundle', () => {
        const cjs = require('../dist/index.js');
        for (const name of addedExports) {
            expect(cjs, name).toHaveProperty(name);
        }
        const client = cjs.createToolkit();
        for (const method of en16931Methods) {
            expect(typeof client[method], method).toBe('function');
        }
        expect(typeof cjs.PeppolToolkit.detectUblProfile).toBe('function');
    });
});
