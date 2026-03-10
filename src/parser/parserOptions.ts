import { X2jOptions } from 'fast-xml-parser';

export const parserOptions = {
    attributeNamePrefix: '$',
    ignoreAttributes: false,
    parseTagValue: false,
    isArray: (tagName: string) => {
        return [
            'cac:PaymentMeans',
            'cac:InvoiceLine',
            'cac:CreditNoteLine',
            'cac:TaxTotal',
            'cac:TaxSubtotal',
            'cac:PartyIdentification',
        ].includes(tagName);
    },
} satisfies X2jOptions;
