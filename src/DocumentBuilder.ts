import { Invoice } from './types';
import { XMLBuilder } from 'fast-xml-parser';

export default class DocumentBuilder {
    private __xmlHeader = {
        '?xml': {
            ...this.__attributes({
                version: '1.0',
                encoding: 'UTF-8',
            }),
        },
    };
    private __builder = new XMLBuilder({
        attributeNamePrefix: '$',
        ignoreAttributes: false,
        format: true,
    });

    /***
     * Generates a Peppol invoice from the given invoice data
     * @param invoice The invoice data
     * @returns The Peppol invoice XML document as a string
     */
    public generatePeppolInvoice(invoice: Invoice): string {
        console.log(this.__buildInvoice(invoice));
        return this.__builder.build(this.__buildInvoice(invoice));
    }

    /**
     * Helper function to generate the invoice in Peppol format as an object
     * @param invoice The invoice data
     * @returns The the invoice in Peppol format as an object
     */
    private __buildInvoice(invoice: Invoice) {
        return {
            ...this.__xmlHeader,
            Invoice: {
                ...this.__attributes({
                    'xmlns:cac':
                        'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
                    'xmlns:cbc':
                        'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
                    xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                }),
                'cbc:ID': '1234567890',
            },
        };
    }

    /**
     * Helper function to convert object keys to $prefixed attributes
     * @param attributes Object containing attributes
     * @returns Object with $prefixed attributes
     */
    private __attributes(attributes: Record<string, any>) {
        return Object.fromEntries(
            Object.entries(attributes).map(([key, value]) => [`$${key}`, value])
        );
    }
}
