import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';

describe('Invoices Builder', () => {
    let toolkit = new PeppolToolkit();

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should build invoices', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({});
        console.log(invoiceXML);
        expect(invoiceXML.length).toBeGreaterThan(0);
    });
});
