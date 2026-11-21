import { CreditNote, Invoice } from '../../../src';

export type InvoiceLine = Invoice['invoiceLines'][number];
export type Party = Invoice['seller'];

/**
 * A document to generate and submit to KoSIT.
 *
 * - `expectedErrors` empty (or omitted): the document must be accepted.
 * - `expectedErrors` non-empty: the document must be rejected and every
 *   listed rule (e.g. `BR-CO-15`) must appear in the report errors.
 *   A prefix matches dotted sub-codes (`cvc-complex-type` matches
 *   `cvc-complex-type.2.4.a`).
 */
export type KositCase = {
    name: string;
    expectedErrors?: string[];
    /** Optional post-processing of the generated XML (e.g. to break the XSD) */
    mutateXml?: (xml: string) => string;
} & (
    | { kind: 'invoice'; document: Invoice }
    | { kind: 'creditNote'; document: CreditNote }
);

export const belgianSeller: Party = {
    endPoint: { scheme: '9925', id: 'BE0732788874' },
    name: 'Pixeldrive',
    legalEntity: {
        registrationName: 'Loir, Simon',
        companyId: { id: '0732788874', schemeID: '0208' },
    },
    address: {
        streetName: 'Rue de la Station 1',
        cityName: 'Namur',
        postalZone: '5000',
        country: 'BE',
    },
    taxSchemes: [{ companyId: 'BE0732788874', schemeID: 'VAT' }],
    contact: {
        name: 'Simon Loir',
        email: 'billing@example.com',
    },
};

export const belgianBuyer: Party = {
    endPoint: { scheme: '0208', id: '0403170701' },
    name: 'Acme Belgium',
    legalEntity: {
        registrationName: 'Acme Belgium SA',
        companyId: { id: '0403170701', schemeID: '0208' },
    },
    address: {
        streetName: 'Avenue Louise 100',
        cityName: 'Bruxelles',
        postalZone: '1050',
        country: 'BE',
    },
    taxSchemes: [{ companyId: 'BE0403170701', schemeID: 'VAT' }],
};

export const dutchBuyer: Party = {
    endPoint: { scheme: '9944', id: 'NL123456789B01' },
    name: 'Acme Nederland',
    legalEntity: {
        registrationName: 'Acme Nederland B.V.',
    },
    address: {
        streetName: 'Damrak 1',
        cityName: 'Amsterdam',
        postalZone: '1012 LG',
        country: 'NL',
    },
    taxSchemes: [{ companyId: 'NL123456789B01', schemeID: 'VAT' }],
};

export function line(
    id: string,
    quantity: number,
    price: number,
    categoryCode: InvoiceLine['taxCategory']['categoryCode'],
    percent: number,
    overrides: Partial<InvoiceLine> = {}
): InvoiceLine {
    return {
        id,
        name: `Item ${id}`,
        invoicedQuantity: quantity,
        price,
        lineExtensionAmount: Math.round(quantity * price * 100) / 100,
        currency: 'EUR',
        unitCode: 'C62',
        taxCategory: { categoryCode, percent },
        ...overrides,
    };
}

/** Fields shared by invoices and credit notes: 100 EUR at 21% VAT. */
function commonFields() {
    return {
        documentCurrencyCode: 'EUR',
        buyerReference: 'PO-4521',
        seller: belgianSeller,
        buyer: belgianBuyer,
        paymentMeans: [
            {
                code: '30',
                paymentId: '+++090/9337/55493+++',
                financialAccount: {
                    id: 'BE71096123456769',
                    name: 'Pixeldrive',
                },
            },
        ],
        paymentTermsNote: 'Payment within 30 days',
        taxTotal: [
            {
                taxAmount: 21,
                taxAmountCurrency: 'EUR',
                subTotals: [
                    {
                        taxableAmount: 100,
                        taxAmount: 21,
                        taxCategory: { categoryCode: 'S', percent: 21 },
                    },
                ],
            },
        ],
        legalMonetaryTotal: {
            currency: 'EUR',
            lineExtensionAmount: 100,
            taxExclusiveAmount: 100,
            taxInclusiveAmount: 121,
            payableAmount: 121,
        },
    } satisfies Partial<Invoice> & Partial<CreditNote>;
}

/**
 * A complete, valid invoice: one line of 100 EUR at 21% VAT.
 * Cases override only the parts they exercise.
 */
export function invoice(overrides: Partial<Invoice> = {}): Invoice {
    return {
        ...commonFields(),
        ID: 'INV-2024-001',
        issueDate: '2024-03-01',
        dueDate: '2024-03-31',
        invoiceTypeCode: 380,
        invoiceLines: [line('1', 1, 100, 'S', 21)],
        ...overrides,
    };
}

/**
 * A complete, valid credit note crediting invoice INV-2024-001.
 */
export function creditNote(overrides: Partial<CreditNote> = {}): CreditNote {
    return {
        ...commonFields(),
        ID: 'CN-2024-001',
        issueDate: '2024-03-15',
        creditNoteTypeCode: 381,
        billingReference: [
            {
                invoiceDocReference: {
                    id: 'INV-2024-001',
                    issueDate: '2024-03-01',
                },
            },
        ],
        creditNoteLines: [line('1', 1, 100, 'S', 21)],
        ...overrides,
    };
}
