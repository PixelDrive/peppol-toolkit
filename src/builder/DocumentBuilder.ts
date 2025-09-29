import { XMLBuilder } from 'fast-xml-parser';
import { builderOptions } from './builderOptions';
import { Invoice } from '../documents';
import XMLAttributes from '../helpers/XMLAttributes';
import getDateString from '../helpers/getDateString';

export default class DocumentBuilder {
    private __xmlHeader = {
        '?xml': {
            ...XMLAttributes({
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
                ...XMLAttributes({
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
                'cbc:IssueDate': getDateString(invoice.issueDate),
                'cbc:DueDate': invoice.dueDate
                    ? getDateString(invoice.dueDate)
                    : undefined,
                'cbc:InvoiceTypeCode': invoice.invoiceTypeCode,
                'cbc:DocumentCurrencyCode': invoice.documentCurrencyCode,
            },
        };
    }
}
