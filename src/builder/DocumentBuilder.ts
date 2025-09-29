import { XMLBuilder } from 'fast-xml-parser';
import { builderOptions } from './builderOptions';
import { Invoice, partySchema } from '../documents';
import XMLAttributes from '../helpers/XMLAttributes';
import getDateString from '../helpers/getDateString';
import { z } from 'zod';

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
                'cbc:ID': invoice.ID,
                'cbc:IssueDate': getDateString(invoice.issueDate),
                'cbc:DueDate': invoice.dueDate
                    ? getDateString(invoice.dueDate)
                    : undefined,
                'cbc:InvoiceTypeCode': invoice.invoiceTypeCode,
                'cbc:DocumentCurrencyCode': invoice.documentCurrencyCode,
                'cac:AccountingSupplierParty': this.__buildParty(
                    invoice.seller
                ),
                'cac:AccountingCustomerParty': this.__buildParty(invoice.buyer),
            },
        };
    }

    /**
     * Helper function to build a party object
     * @param party The party data
     * @returns The party object
     */
    private __buildParty(party: z.infer<typeof partySchema>) {
        return {
            'cac:Party': {
                'cbc:EndpointID': {
                    '#text': party.endPoint.id,
                    ...XMLAttributes({
                        schemeID: party.endPoint.scheme,
                    }),
                },
                ...(party.identification && party.identification.length > 0
                    ? {
                          'cac:PartyIdentification': party.identification.map(
                              (id) => ({
                                  'cbc:ID': {
                                      '#text': id.id,
                                      ...XMLAttributes({
                                          schemeID: id.scheme,
                                      }),
                                  },
                              })
                          ),
                      }
                    : {}),
                ...(party.name ? { 'cac:PartyName': party.name } : {}),
            },
        };
    }
}
