import { beforeEach, describe, expect, it } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import {
    CreditNote,
    DocumentBuilder,
    EN16931_CUSTOMIZATION_ID,
    exampleCreditNote,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
    exampleInvoice,
    Invoice,
    PeppolToolkit,
} from '../src';
import { emailSeller } from './fixtures/en16931-documents';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    parseTagValue: false,
});

/** The cac:Party elements of the seller and the buyer of a generated document */
function parties(xml: string) {
    const parsed = parser.parse(xml);
    const root = parsed['Invoice'] ?? parsed['CreditNote'];
    return {
        root,
        seller: root['cac:AccountingSupplierParty']['cac:Party'],
        buyer: root['cac:AccountingCustomerParty']['cac:Party'],
    };
}

describe('EN 16931 builder', () => {
    let toolkit: PeppolToolkit;

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    describe.each([
        {
            kind: 'invoice',
            build: () => toolkit.invoiceToEn16931UBL(exampleEn16931Invoice),
            buildWith: (overrides: object) =>
                toolkit.invoiceToEn16931UBL({
                    ...exampleEn16931Invoice,
                    ...overrides,
                }),
        },
        {
            kind: 'credit note',
            build: () =>
                toolkit.creditNoteToEn16931UBL(exampleEn16931CreditNote),
            buildWith: (overrides: object) =>
                toolkit.creditNoteToEn16931UBL({
                    ...exampleEn16931CreditNote,
                    ...overrides,
                }),
        },
    ])('$kind', ({ build, buildWith }) => {
        it('has no cbc:EndpointID for a buyer without electronic address', () => {
            const { seller, buyer } = parties(build());

            expect(buyer['cbc:EndpointID']).toBeUndefined();
            expect(buyer['cac:PartyLegalEntity']['cbc:RegistrationName']).toBe(
                'Jane Doe'
            );
            expect(seller['cbc:EndpointID']).toEqual({
                '#text': '0732788874',
                $schemeID: '0208',
            });
        });

        it('uses the EN 16931 CustomizationID and no ProfileID by default', () => {
            const { root } = parties(build());

            expect(root['cbc:CustomizationID']).toBe(EN16931_CUSTOMIZATION_ID);
            expect(root).not.toHaveProperty('cbc:ProfileID');
        });

        it('writes the ProfileID when one is given', () => {
            const { root } = parties(
                buildWith({ profileID: 'urn:example:profile:1.0' })
            );

            expect(root['cbc:ProfileID']).toBe('urn:example:profile:1.0');
        });

        it('ignores the customizationID of the document', () => {
            const { root } = parties(
                buildWith({
                    customizationID:
                        'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
                })
            );

            expect(root['cbc:CustomizationID']).toBe(EN16931_CUSTOMIZATION_ID);
        });

        it('writes an e-mail electronic address (EM)', () => {
            const { seller } = parties(buildWith({ seller: emailSeller }));

            expect(seller['cbc:EndpointID']).toEqual({
                '#text': 'billing@example.com',
                $schemeID: 'EM',
            });
        });

        it('writes the document without any electronic address', () => {
            const { seller, buyer } = parties(
                buildWith({
                    seller: { ...emailSeller, endPoint: undefined },
                })
            );

            expect(seller['cbc:EndpointID']).toBeUndefined();
            expect(buyer['cbc:EndpointID']).toBeUndefined();
        });
    });

    it('checks the amounts like the Peppol builder', () => {
        expect(() =>
            toolkit.invoiceToEn16931UBL({
                ...exampleEn16931Invoice,
                legalMonetaryTotal: {
                    ...exampleEn16931Invoice.legalMonetaryTotal,
                    payableAmount: 121.005,
                },
            })
        ).toThrow(
            'Invalid amount for "legalMonetaryTotal.payableAmount": 121.005 has more than 2 decimal places.'
        );
    });

    it('writes the example documents', async () => {
        await expect(
            toolkit.invoiceToEn16931UBL(exampleEn16931Invoice)
        ).toMatchFileSnapshot('./__snapshots__/en16931-example-invoice.xml');
        await expect(
            toolkit.creditNoteToEn16931UBL(exampleEn16931CreditNote)
        ).toMatchFileSnapshot('./__snapshots__/en16931-example-creditnote.xml');
    });
});

describe('Peppol builder', () => {
    const builder = new DocumentBuilder();
    // Untyped input, e.g. from JavaScript: the Peppol types require the electronic address
    const withoutBuyerEndpoint = {
        ...exampleInvoice,
        buyer: { ...exampleInvoice.buyer, endPoint: undefined },
    } as unknown as Invoice;

    it('still requires the buyer electronic address', () => {
        expect(() =>
            builder.generatePeppolInvoice(withoutBuyerEndpoint)
        ).toThrow(
            new TypeError(
                'Missing buyer.endPoint: Peppol BIS requires the buyer electronic address (BT-49, PEPPOL-EN16931-R010). ' +
                    'Documents that do not travel over Peppol can be built as EN 16931 documents with invoiceToEn16931UBL.'
            )
        );
    });

    it('still requires the seller electronic address', () => {
        const creditNote = {
            ...exampleCreditNote,
            seller: { ...exampleCreditNote.seller, endPoint: undefined },
        } as unknown as CreditNote;

        expect(() => builder.generatePeppolCreditNote(creditNote)).toThrow(
            'Missing seller.endPoint: Peppol BIS requires the seller electronic address (BT-34, PEPPOL-EN16931-R020). ' +
                'Documents that do not travel over Peppol can be built as EN 16931 documents with creditNoteToEn16931UBL.'
        );
    });
});

describe('Negative quantities and amounts', () => {
    const builder = new DocumentBuilder();
    const line = exampleInvoice.invoiceLines[0];
    const [tax] = exampleInvoice.taxTotal;
    const [subTotal] = tax.subTotals;

    // Valid in EN 16931 and Peppol BIS, and read by the parsers, but never generated
    it.each<[string, number, Partial<Invoice>]>([
        [
            'invoiceLines[0].invoicedQuantity',
            -1,
            { invoiceLines: [{ ...line, invoicedQuantity: -1 }] },
        ],
        [
            'invoiceLines[0].lineExtensionAmount',
            -100,
            { invoiceLines: [{ ...line, lineExtensionAmount: -100 }] },
        ],
        [
            'taxTotal[0].taxAmount',
            -21,
            { taxTotal: [{ ...tax, taxAmount: -21 }] },
        ],
        [
            'taxTotal[0].subTotals[0].taxableAmount',
            -100,
            {
                taxTotal: [
                    {
                        ...tax,
                        subTotals: [{ ...subTotal, taxableAmount: -100 }],
                    },
                ],
            },
        ],
        [
            'taxTotal[0].subTotals[0].taxAmount',
            -21,
            {
                taxTotal: [
                    { ...tax, subTotals: [{ ...subTotal, taxAmount: -21 }] },
                ],
            },
        ],
    ])('are rejected by the builder: %s', (path, value, overrides) => {
        expect(() =>
            builder.generatePeppolInvoice({ ...exampleInvoice, ...overrides })
        ).toThrow(
            new RangeError(
                `Invalid value for "${path}": ${value} is negative. The builder does not generate ` +
                    'negative quantities, line amounts or VAT amounts: issue a credit note instead.'
            )
        );
    });

    it('are rejected by every builder', () => {
        const negativeLine = { ...line, invoicedQuantity: -1 };
        expect(() =>
            builder.generateEn16931Invoice({
                ...exampleEn16931Invoice,
                invoiceLines: [negativeLine],
            })
        ).toThrow('"invoiceLines[0].invoicedQuantity"');
        expect(() =>
            builder.generatePeppolCreditNote({
                ...exampleCreditNote,
                creditNoteLines: [negativeLine],
            })
        ).toThrow('"creditNoteLines[0].invoicedQuantity"');
        expect(() =>
            builder.generateEn16931CreditNote({
                ...exampleEn16931CreditNote,
                creditNoteLines: [negativeLine],
            })
        ).toThrow('"creditNoteLines[0].invoicedQuantity"');
    });
});
