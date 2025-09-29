import { describe, expect, it } from 'vitest';
import pkgDefault, { PeppolToolkit } from '../src/index';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

describe('ESM import works', () => {
    it('should export classes and functions with types', () => {
        const client = new PeppolToolkit();
        expect(client).toBeInstanceOf(PeppolToolkit);
    });

    it('default export contains utilities', () => {
        expect(pkgDefault).toHaveProperty('PeppolToolkit');
        expect(pkgDefault).toHaveProperty('createToolkit');
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
});
