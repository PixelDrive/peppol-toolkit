import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicCreditNote } from '../src/data/basic-creditNote';
import { fullCreditNote } from './fixtures/full-documents';
import { expectZodPath } from './helpers/expectZodPath';

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
        expect(parsed.billingReference?.[0].invoiceDocReference.id).toBe(
            'INV-001'
        );
        expect(parsed.billingReference?.[0].invoiceDocReference.issueDate).toBe(
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
            creditNoteTypeCode: 396,
        });
        const parsed = toolkit.peppolUBLToCreditNote(xml);
        expect(parsed.creditNoteTypeCode).toBe(396);
    });

    it('should reject the self-billed credit note type code (not allowed by BIS Billing)', () => {
        const xml = toolkit
            .creditNoteToPeppolUBL(basicCreditNote)
            .replace(
                '<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>',
                '<cbc:CreditNoteTypeCode>261</cbc:CreditNoteTypeCode>'
            );
        expect(() => toolkit.peppolUBLToCreditNote(xml)).toThrow(
            'Invalid CreditNoteTypeCode'
        );
    });

    it('should read back every supported element', () => {
        const xml = toolkit.creditNoteToPeppolUBL(fullCreditNote);
        const parsed = toolkit.peppolUBLToCreditNote(xml);

        // Building the parsed credit note again gives the same document
        expect(toolkit.creditNoteToPeppolUBL(parsed)).toBe(xml);
        expect(parsed.creditNoteLines[0].priceAllowanceCharge).toEqual(
            fullCreditNote.creditNoteLines[0].priceAllowanceCharge
        );
        expect(toolkit.en16931UBLToCreditNote(xml)).toEqual(parsed);
    });

    describe('empty, missing, invalid numeric, and repeated XML elements (#31)', () => {
        it('should reject empty elements with attributes instead of parsing "[object Object]"', () => {
            const emptyEndpoint = toolkit
                .creditNoteToPeppolUBL(basicCreditNote)
                .replace(
                    '<cbc:EndpointID schemeID="9925">0732788874</cbc:EndpointID>',
                    '<cbc:EndpointID schemeID="9925"/>'
                );
            expectZodPath(
                () => toolkit.peppolUBLToCreditNote(emptyEndpoint),
                ['seller', 'endPoint', 'id']
            );
        });

        it('should reject missing LineExtensionAmount in LegalMonetaryTotal', () => {
            const xml = toolkit
                .creditNoteToPeppolUBL(basicCreditNote)
                .replace(
                    /<cbc:LineExtensionAmount currencyID="EUR">100\.00<\/cbc:LineExtensionAmount>\s*<cbc:TaxExclusiveAmount/,
                    '<cbc:TaxExclusiveAmount'
                );
            expectZodPath(
                () => toolkit.peppolUBLToCreditNote(xml),
                ['legalMonetaryTotal', 'lineExtensionAmount']
            );
        });

        it('should parse empty or whitespace-only optional numeric elements as undefined instead of 0', () => {
            const xml = toolkit
                .creditNoteToPeppolUBL(basicCreditNote)
                .replace(
                    /<cbc:Percent>21<\/cbc:Percent>/g,
                    '<cbc:Percent><![CDATA[ ]]></cbc:Percent>'
                );
            const parsed = toolkit.peppolUBLToCreditNote(xml);

            expect(
                parsed.taxTotal[0].subTotals[0].taxCategory.percent
            ).toBeUndefined();
            expect(
                parsed.creditNoteLines[0].taxCategory.percent
            ).toBeUndefined();
        });

        it('should reject non-decimal numeric syntax', () => {
            const xml = toolkit
                .creditNoteToPeppolUBL(basicCreditNote)
                .replace(
                    '<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>',
                    '<cbc:CreditNoteTypeCode>0x17d</cbc:CreditNoteTypeCode>'
                );
            expectZodPath(
                () => toolkit.peppolUBLToCreditNote(xml),
                ['creditNoteTypeCode']
            );
        });

        it('should reject missing or invalid line allowanceCharge currencyID with full Zod error paths', () => {
            const xml = toolkit.creditNoteToPeppolUBL({
                ...basicCreditNote,
                creditNoteLines: [
                    {
                        ...basicCreditNote.creditNoteLines[0],
                        allowanceCharge: [
                            { chargeIndicator: false, amount: 10 },
                        ],
                    },
                ],
            });

            const withoutCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.00</cbc:Amount>',
                '<cbc:Amount>10.00</cbc:Amount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToCreditNote(withoutCurrency),
                ['creditNoteLines', 0, 'allowanceCharge', 0, 'currency']
            );

            const invalidCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.00</cbc:Amount>',
                '<cbc:Amount currencyID="INVALID">10.00</cbc:Amount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToCreditNote(invalidCurrency),
                ['creditNoteLines', 0, 'allowanceCharge', 0, 'currency']
            );
        });

        it('should reject duplicate non-repeatable elements such as cac:AddressLine and cbc:BuyerReference', () => {
            const xml = toolkit.creditNoteToPeppolUBL(fullCreditNote);

            expect(() =>
                toolkit.peppolUBLToCreditNote(
                    xml.replace(
                        '<cac:AddressLine>',
                        '<cac:AddressLine><cbc:Line>Building A</cbc:Line></cac:AddressLine><cac:AddressLine>'
                    )
                )
            ).toThrow(
                'Duplicate element "cac:AddressLine" in "cac:PostalAddress"'
            );

            expect(() =>
                toolkit.peppolUBLToCreditNote(
                    xml.replace(
                        '<cbc:BuyerReference>PO-4521</cbc:BuyerReference>',
                        '<cbc:BuyerReference>PO-1</cbc:BuyerReference><cbc:BuyerReference>PO-2</cbc:BuyerReference>'
                    )
                )
            ).toThrow('Duplicate element "cbc:BuyerReference" in "CreditNote"');
        });
    });
});
