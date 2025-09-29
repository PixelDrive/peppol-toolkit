import { XMLBuilder } from 'fast-xml-parser';
import { builderOptions } from './builderOptions';
import { Invoice } from '../documents';

export default class DocumentBuilder {
    private __xmlHeader = {
        '?xml': {
            ...this.__attributes({
                version: '1.0',
                encoding: 'UTF-8',
            }),
        },
    };
    private __builder = new XMLBuilder(builderOptions);

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
                'cbc:CustomizationID':
                    'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
                'cbc:ProfileID': 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
                'cbc:ID': 'Snippet1',
                'cbc:IssueDate': '2017-11-13',
                'cbc:DueDate': '2017-12-01',
                'cbc:InvoiceTypeCode': invoice.invoiceTypeCode,
                'cbc:DocumentCurrencyCode': invoice.documentCurrencyCode,
                'cbc:AccountingCost': '4025:123:4343',
                'cbc:BuyerReference': '0150abc',
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
