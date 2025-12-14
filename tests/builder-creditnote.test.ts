import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicCreditNote } from '../src/data/basic-creditNote';

describe('Creditnote Builder', () => {
    let toolkit = new PeppolToolkit();

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should generate a non empty string', () => {
        const invoiceXML = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        expect(invoiceXML.data.length).toBeGreaterThan(0);
    });

    it('should work with different credit-note type codes', () => {
        const invoiceXML1 = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteTypeCode: 381,
        });

        const invoiceXML2 = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteTypeCode: 261,
        });

        expect(invoiceXML1.data).toContain(
            '<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>'
        );
        expect(invoiceXML2.data).toContain(
            '<cbc:CreditNoteTypeCode>261</cbc:CreditNoteTypeCode>'
        );
    });

    it('should work with currency codes', () => {
        const invoiceXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            documentCurrencyCode: 'USD',
        });

        expect(invoiceXML.data.length).toBeGreaterThan(0);
        expect(invoiceXML.data).toContain(
            '<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>'
        );
    });

    it('should return default profileId and customizationId', () => {
        const invoiceXML1 = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
        });

        expect(invoiceXML1.data).toContain(
            '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>'
        );
        expect(invoiceXML1.data).toContain(
            '<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
        );
    });
    
    it('should return error if creditNote-type-code in data is not supported', () => {
        const invoiceXML1 = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteTypeCode: 380,
        });

        expect(invoiceXML1.success).toBeFalsy();
        expect(invoiceXML1.message).toContain('Invalid CreditNoteTypeCode');
    });
});
