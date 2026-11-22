import {
    CefEASCode,
    En16931CreditNote,
    En16931Invoice,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
} from '../../../src';
import { belgianBuyer, belgianSeller } from './helpers';

/**
 * An EN 16931 document to generate and submit to a KoSIT validator configured with the
 * EN 16931 (CEN) scenario. Same conventions as `KositCase` (see helpers.ts).
 */
export type En16931KositCase = {
    name: string;
    expectedErrors?: string[];
    /** Optional post-processing of the generated XML */
    mutateXml?: (xml: string) => string;
} & (
    | { kind: 'invoice'; document: En16931Invoice }
    | { kind: 'creditNote'; document: En16931CreditNote }
);

type Party = En16931Invoice['seller'];

/** The example invoice: a seller with a Peppol electronic address, a consumer without one */
function invoice(overrides: Partial<En16931Invoice> = {}): En16931Invoice {
    return { ...exampleEn16931Invoice, ...overrides };
}

function creditNote(
    overrides: Partial<En16931CreditNote> = {}
): En16931CreditNote {
    return { ...exampleEn16931CreditNote, ...overrides };
}

function withEndpoint(party: Party, scheme: CefEASCode, id: string): Party {
    return { ...party, endPoint: { scheme, id } };
}

const seller = exampleEn16931Invoice.seller;
const consumer = exampleEn16931Invoice.buyer;

export const en16931ValidCases: En16931KositCase[] = [
    {
        name: 'invoice - consumer without electronic address',
        kind: 'invoice',
        document: invoice(),
    },
    {
        name: 'credit note - consumer without electronic address',
        kind: 'creditNote',
        document: creditNote(),
    },
    {
        name: 'invoice - no electronic address at all',
        kind: 'invoice',
        document: invoice({ seller: { ...seller, endPoint: undefined } }),
    },
    {
        name: 'invoice - e-mail electronic addresses (EM)',
        kind: 'invoice',
        document: invoice({
            seller: withEndpoint(seller, 'EM', 'billing@example.com'),
            buyer: withEndpoint(consumer, 'EM', 'jane.doe@example.com'),
        }),
    },
    {
        name: 'credit note - e-mail electronic address (EM) for the buyer',
        kind: 'creditNote',
        document: creditNote({
            buyer: withEndpoint(consumer, 'EM', 'jane.doe@example.com'),
        }),
    },
    {
        name: 'invoice - scheme removed from the Peppol EAS list in BIS 3.0.21',
        kind: 'invoice',
        document: invoice({
            buyer: withEndpoint(consumer, '0154', '12345678'),
        }),
    },
    {
        name: 'invoice - with a ProfileID',
        kind: 'invoice',
        document: invoice({ profileID: 'urn:example:billing:1.0' }),
    },
    {
        name: 'invoice - Peppol parties',
        kind: 'invoice',
        document: invoice({ seller: belgianSeller, buyer: belgianBuyer }),
    },
];

export const en16931InvalidCases: En16931KositCase[] = [
    {
        name: 'invoice - electronic address scheme outside the CEF EAS list',
        kind: 'invoice',
        expectedErrors: ['BR-CL-25'],
        document: invoice({
            buyer: withEndpoint(
                consumer,
                'XX' as CefEASCode,
                'jane@example.com'
            ),
        }),
    },
    {
        name: 'invoice - seller electronic address without scheme',
        kind: 'invoice',
        expectedErrors: ['BR-62'],
        document: invoice(),
        mutateXml: (xml) =>
            xml.replace(
                '<cbc:EndpointID schemeID="0208">0732788874</cbc:EndpointID>',
                '<cbc:EndpointID>0732788874</cbc:EndpointID>'
            ),
    },
    {
        name: 'credit note - buyer electronic address without scheme',
        kind: 'creditNote',
        expectedErrors: ['BR-63'],
        document: creditNote({
            buyer: withEndpoint(consumer, 'EM', 'jane.doe@example.com'),
        }),
        mutateXml: (xml) =>
            xml.replace(
                '<cbc:EndpointID schemeID="EM">jane.doe@example.com</cbc:EndpointID>',
                '<cbc:EndpointID>jane.doe@example.com</cbc:EndpointID>'
            ),
    },
    {
        name: 'invoice - tax inclusive amount is not exclusive + VAT',
        kind: 'invoice',
        expectedErrors: ['BR-CO-15'],
        document: invoice({
            legalMonetaryTotal: {
                ...exampleEn16931Invoice.legalMonetaryTotal,
                taxInclusiveAmount: 120,
                payableAmount: 120,
            },
        }),
    },
];
