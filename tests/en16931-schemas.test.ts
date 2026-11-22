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
});
