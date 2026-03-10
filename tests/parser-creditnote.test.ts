import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicCreditNote } from '../src/data/basic-creditNote';

describe('CreditNote Parser', () => {
    let toolkit: PeppolToolkit;

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should parse a generated credit note back into a CreditNote object', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed).toBeDefined();
        expect(parsed.ID).toBe(basicCreditNote.ID);
    });

    it('should preserve the credit note ID', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.ID).toBe('TEST-003');
    });

    it('should preserve the issue date', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.issueDate).toBe('2024-01-01');
    });

    it('should preserve the credit note type code', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.creditNoteTypeCode).toBe(381);
    });

    it('should preserve the document currency code', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.documentCurrencyCode).toBe('EUR');
    });

    it('should preserve the buyer reference', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.buyerReference).toBe(basicCreditNote.buyerReference);
    });

    it('should include the default customization and profile IDs', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.customizationID).toBe(
            'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0'
        );
        expect(parsed.profileID).toBe(
            'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
        );
    });

    it('should preserve seller information', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.seller.endPoint.id).toBe(
            basicCreditNote.seller.endPoint.id
        );
        expect(parsed.seller.endPoint.scheme).toBe(
            basicCreditNote.seller.endPoint.scheme
        );
        expect(parsed.seller.legalEntity.registrationName).toBe(
            basicCreditNote.seller.legalEntity.registrationName
        );
        expect(parsed.seller.address.country).toBe(
            basicCreditNote.seller.address.country
        );
    });

    it('should preserve buyer information', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.buyer.endPoint.id).toBe(
            basicCreditNote.buyer.endPoint.id
        );
        expect(parsed.buyer.legalEntity.registrationName).toBe(
            basicCreditNote.buyer.legalEntity.registrationName
        );
        expect(parsed.buyer.legalEntity.legalForm).toBe(
            basicCreditNote.buyer.legalEntity.legalForm
        );
    });

    it('should preserve billing reference', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.billingReference?.invoiceDocReference.id).toBe('INV-001');
        expect(parsed.billingReference?.invoiceDocReference.issueDate).toBe(
            '2017-09-15'
        );
    });

    it('should preserve payment means', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.paymentMeans).toBeDefined();
        expect(parsed.paymentMeans![0].code).toBe('30');
        expect(parsed.paymentMeans![0].financialAccount?.id).toBe(
            basicCreditNote.paymentMeans![0].financialAccount!.id
        );
    });

    it('should preserve payment terms note', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.paymentTermsNote).toBe(basicCreditNote.paymentTermsNote);
    });

    it('should preserve tax total', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.taxTotal[0].taxAmount).toBe(21);
        expect(parsed.taxTotal[0].taxAmountCurrency).toBe('EUR');
        expect(parsed.taxTotal[0].subTotals[0].taxCategory.categoryCode).toBe(
            'S'
        );
        expect(parsed.taxTotal[0].subTotals[0].taxCategory.percent).toBe(21);
    });

    it('should preserve legal monetary total', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.legalMonetaryTotal.lineExtensionAmount).toBe(100);
        expect(parsed.legalMonetaryTotal.taxExclusiveAmount).toBe(100);
        expect(parsed.legalMonetaryTotal.taxInclusiveAmount).toBe(121);
        expect(parsed.legalMonetaryTotal.payableAmount).toBe(121);
    });

    it('should preserve credit note lines', () => {
        const xml = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.creditNoteLines).toHaveLength(1);
        expect(parsed.creditNoteLines[0].id).toBe('1');
        expect(parsed.creditNoteLines[0].name).toBe('Petit poney');
        expect(parsed.creditNoteLines[0].invoicedQuantity).toBe(1);
        expect(parsed.creditNoteLines[0].lineExtensionAmount).toBe(100);
        expect(parsed.creditNoteLines[0].price).toBe(100);
        expect(parsed.creditNoteLines[0].currency).toBe('EUR');
        expect(parsed.creditNoteLines[0].unitCode).toBe('H67');
        expect(parsed.creditNoteLines[0].taxCategory.categoryCode).toBe('S');
        expect(parsed.creditNoteLines[0].taxCategory.percent).toBe(21);
    });

    it('should produce identical XML on a round-trip (build → parse → build)', () => {
        const xml1 = toolkit.creditNoteToPeppolUBL(basicCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml1);
        const xml2 = toolkit.creditNoteToPeppolUBL(parsed);
        expect(xml2).toBe(xml1);
    });

    it('should throw an error for non-CreditNote XML', () => {
        expect(() =>
            toolkit.peppolUBLToCreditNote('<Invoice></Invoice>')
        ).toThrow('Not a valid UBL CreditNote document');
    });

    it('should work with a different credit note type code', () => {
        const xml = toolkit.creditNoteToPeppolUBL({
            ...basicCreditNote,
            creditNoteTypeCode: 261,
        });
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.creditNoteTypeCode).toBe(261);
    });
});
