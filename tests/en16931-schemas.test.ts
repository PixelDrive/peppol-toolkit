import { describe, expect, it } from 'vitest';
import {
    CreditNote,
    creditNoteSchema,
    En16931CreditNote,
    en16931CreditNoteSchema,
    En16931Invoice,
    en16931InvoiceSchema,
    en16931PartySchema,
    exampleCreditNote,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
    exampleInvoice,
    Invoice,
    invoiceSchema,
    partySchema,
    PeppolToolkit,
} from '../src';

const consumer = exampleEn16931Invoice.buyer;
const company = exampleEn16931Invoice.seller;

describe('EN 16931 party schema', () => {
    it('accepts a party without electronic address', () => {
        expect(en16931PartySchema.safeParse(consumer).success).toBe(true);
    });

    it('accepts an e-mail electronic address (EM)', () => {
        const result = en16931PartySchema.safeParse({
            ...company,
            endPoint: { scheme: 'EM', id: 'billing@example.com' },
        });
        expect(result.success).toBe(true);
    });

    it('accepts a scheme of the CEF EAS list missing from the Peppol list', () => {
        const result = en16931PartySchema.safeParse({
            ...company,
            endPoint: { scheme: '9960', id: '12345678' },
        });
        expect(result.success).toBe(true);
    });

    it('rejects a scheme outside the CEF EAS list (BR-CL-25)', () => {
        const result = en16931PartySchema.safeParse({
            ...company,
            endPoint: { scheme: 'XX', id: 'billing@example.com' },
        });
        expect(result.success).toBe(false);
    });

    it('rejects an electronic address without scheme (BR-62, BR-63)', () => {
        const result = en16931PartySchema.safeParse({
            ...company,
            endPoint: { id: 'billing@example.com' },
        });
        expect(result.success).toBe(false);
    });

    it('rejects an electronic address without identifier', () => {
        const result = en16931PartySchema.safeParse({
            ...company,
            endPoint: { scheme: 'EM', id: '' },
        });
        expect(result.success).toBe(false);
    });
});

describe('Peppol party schema', () => {
    it('still requires an electronic address', () => {
        const result = partySchema.safeParse(consumer);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['endPoint']);
    });

    it('still rejects schemes outside the Peppol EAS list', () => {
        const result = partySchema.safeParse({
            ...company,
            endPoint: { scheme: 'EM', id: 'billing@example.com' },
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['endPoint', 'scheme']);
    });

    it('accepts a Peppol party', () => {
        expect(partySchema.safeParse(exampleInvoice.seller).success).toBe(true);
    });
});

describe('EN 16931 document schemas', () => {
    it('accept the example EN 16931 documents', () => {
        expect(
            en16931InvoiceSchema.safeParse(exampleEn16931Invoice).success
        ).toBe(true);
        expect(
            en16931CreditNoteSchema.safeParse(exampleEn16931CreditNote).success
        ).toBe(true);
    });

    it('accept Peppol documents, which are EN 16931 documents', () => {
        // Compile-time check: the Peppol types are assignable to the EN 16931 ones
        const invoice: En16931Invoice = exampleInvoice satisfies Invoice;
        const creditNote: En16931CreditNote =
            exampleCreditNote satisfies CreditNote;

        expect(en16931InvoiceSchema.safeParse(invoice).success).toBe(true);
        expect(en16931CreditNoteSchema.safeParse(creditNote).success).toBe(
            true
        );
    });

    it('are not accepted by the Peppol schemas when the buyer has no electronic address', () => {
        const invoice = invoiceSchema.safeParse(exampleEn16931Invoice);
        expect(invoice.success).toBe(false);
        expect(invoice.error?.issues[0].path).toEqual(['buyer', 'endPoint']);

        const creditNote = creditNoteSchema.safeParse(exampleEn16931CreditNote);
        expect(creditNote.success).toBe(false);
        expect(creditNote.error?.issues[0].path).toEqual(['buyer', 'endPoint']);
    });

    it('round-trips core document type codes outside the Peppol billing lists', () => {
        const toolkit = new PeppolToolkit();
        const invoice = {
            ...exampleInvoice,
            invoiceTypeCode: 385,
        } satisfies En16931Invoice;
        const creditNote = {
            ...exampleCreditNote,
            creditNoteTypeCode: 261,
        } satisfies En16931CreditNote;

        expect(
            toolkit.en16931UBLToInvoice(toolkit.invoiceToEn16931UBL(invoice))
                .invoiceTypeCode
        ).toBe(385);
        expect(
            toolkit.en16931UBLToCreditNote(
                toolkit.creditNoteToEn16931UBL(creditNote)
            ).creditNoteTypeCode
        ).toBe(261);
        expect(invoiceSchema.safeParse(invoice).success).toBe(false);
        expect(creditNoteSchema.safeParse(creditNote).success).toBe(false);
    });

    it.each(['0249', '0250', '0251'] as const)(
        'round-trips the CEN ICD party identifier scheme %s',
        (scheme) => {
            const toolkit = new PeppolToolkit();
            const identification = [{ id: 'REVIEW1234', scheme }];
            const invoice = {
                ...exampleInvoice,
                buyer: { ...exampleInvoice.buyer, identification },
            } satisfies En16931Invoice;
            const parsed = toolkit.en16931UBLToInvoice(
                toolkit.invoiceToEn16931UBL(invoice)
            );

            expect(parsed.buyer.identification).toEqual(identification);
            expect(invoiceSchema.safeParse(invoice).success).toBe(false);
        }
    );

    it('allows a seller creditor identifier and rejects SEPA as a buyer identifier', () => {
        const identification = [{ id: 'BE12ZZZ0000000001', scheme: 'SEPA' }];
        expect(
            en16931InvoiceSchema.safeParse({
                ...exampleEn16931Invoice,
                seller: { ...company, identification },
            }).success
        ).toBe(true);
        expect(
            en16931InvoiceSchema.safeParse({
                ...exampleEn16931Invoice,
                buyer: { ...consumer, identification },
            }).success
        ).toBe(false);
    });

    it('rejects SEPA as a buyer identifier in Peppol documents too', () => {
        const identification = [{ id: 'BE12ZZZ0000000001', scheme: 'SEPA' }];
        const sellerWithSepa = {
            ...exampleInvoice,
            seller: { ...exampleInvoice.seller, identification },
        };
        const buyerWithSepa = {
            ...exampleInvoice,
            buyer: { ...exampleInvoice.buyer, identification },
        };

        expect(invoiceSchema.safeParse(sellerWithSepa).success).toBe(true);
        expect(invoiceSchema.safeParse(buyerWithSepa).success).toBe(false);
        expect(
            creditNoteSchema.safeParse({
                ...exampleCreditNote,
                buyer: { ...exampleCreditNote.buyer, identification },
            }).success
        ).toBe(false);
        // A Peppol document stays an EN 16931 document (BR-CL-10)
        expect(en16931InvoiceSchema.safeParse(sellerWithSepa).success).toBe(
            true
        );
        expect(en16931InvoiceSchema.safeParse(buyerWithSepa).success).toBe(
            false
        );
    });

    it('accept negative quantities, line amounts and VAT amounts, which the parsers read', () => {
        const toolkit = new PeppolToolkit();
        // The builders do not generate negative values: negate those of a generated document
        const negate = (xml: string) =>
            xml.replace(
                /(<cbc:(?:InvoicedQuantity|CreditedQuantity|LineExtensionAmount|TaxAmount|TaxableAmount|TaxExclusiveAmount|TaxInclusiveAmount|PayableAmount)\b[^>]*>)(?=\d)/g,
                '$1-'
            );
        const line = exampleInvoice.invoiceLines[0];
        expect(
            invoiceSchema.safeParse({
                ...exampleInvoice,
                invoiceLines: [
                    {
                        ...line,
                        invoicedQuantity: -1,
                        lineExtensionAmount: -100,
                    },
                ],
            }).success
        ).toBe(true);

        const peppol = toolkit.peppolUBLToInvoice(
            negate(toolkit.invoiceToPeppolUBL(exampleInvoice))
        );
        const en16931 = toolkit.en16931UBLToInvoice(
            negate(toolkit.invoiceToEn16931UBL(exampleEn16931Invoice))
        );
        const creditNote = toolkit.peppolUBLToCreditNote(
            negate(toolkit.creditNoteToPeppolUBL(exampleCreditNote))
        );
        for (const document of [peppol, en16931]) {
            expect(document.invoiceLines[0]).toMatchObject({
                invoicedQuantity: -1,
                lineExtensionAmount: -100,
                price: 100,
            });
            expect(document.taxTotal[0]).toMatchObject({
                taxAmount: -21,
                subTotals: [{ taxableAmount: -100, taxAmount: -21 }],
            });
            expect(document.legalMonetaryTotal.payableAmount).toBe(-121);
        }
        expect(creditNote.creditNoteLines[0].invoicedQuantity).toBe(-1);
    });
});
