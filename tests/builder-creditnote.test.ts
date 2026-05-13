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
        expect(invoiceXML.length).toBeGreaterThan(0);
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

        expect(invoiceXML1).toContain(
            '<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>'
        );
        expect(invoiceXML2).toContain(
            '<cbc:CreditNoteTypeCode>261</cbc:CreditNoteTypeCode>'
        );
    });

    it('should return <CreditNote> as indicator', () => {
        const invoiceXML = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        expect(invoiceXML).toContain('<CreditNote');
        expect(invoiceXML).toContain(
            'xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"'
        );
    });

    it('should work with currency codes', () => {
        const invoiceXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            documentCurrencyCode: 'USD',
        });

        expect(invoiceXML.length).toBeGreaterThan(0);
        expect(invoiceXML).toContain(
            '<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>'
        );
    });

    it('should return default profileId and customizationId', () => {
        const invoiceXML1 = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
        });

        expect(invoiceXML1).toContain(
            '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>'
        );
        expect(invoiceXML1).toContain(
            '<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
        );
    });

    it('should always include payable amount even when it is zero', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            legalMonetaryTotal: {
                ...basicCreditNote.legalMonetaryTotal,
                payableAmount: 0,
            },
        });

        expect(creditNoteXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
    });

    it('should omit other zero monetary amounts when generateOnZero is false', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            legalMonetaryTotal: {
                ...basicCreditNote.legalMonetaryTotal,
                payableAmount: 0,
                prepaidAmount: 0,
                allowanceTotalAmount: 0,
                chargeTotalAmount: 0,
                payableRoundingAmount: 0,
            },
        });

        expect(creditNoteXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
        expect(creditNoteXML).not.toContain('<cbc:PrepaidAmount');
        expect(creditNoteXML).not.toContain('<cbc:AllowanceTotalAmount');
        expect(creditNoteXML).not.toContain('<cbc:ChargeTotalAmount');
        expect(creditNoteXML).not.toContain('<cbc:PayableRoundingAmount');
    });

    it('should not nest cac:Party inside specialized party nodes', () => {
        const creditNoteXML = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            payeeParty: {
                name: 'Payee Name',
            },
            taxRepresentativeParty: {
                name: 'Tax Rep',
                address: {
                    streetName: 'Tax Street',
                    cityName: 'Tax City',
                    postalZone: '1000',
                    country: 'BE',
                },
                taxScheme: {
                    companyId: 'BE0123456789',
                    schemeID: 'VAT',
                },
            },
        });

        expect(creditNoteXML).toMatch(/<cac:PayeeParty>\s*<cac:PartyName>/);
        expect(creditNoteXML).not.toMatch(/<cac:PayeeParty>\s*<cac:Party>/);
        expect(creditNoteXML).toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:PartyName>/
        );
        expect(creditNoteXML).not.toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:Party>/
        );
    });
});
