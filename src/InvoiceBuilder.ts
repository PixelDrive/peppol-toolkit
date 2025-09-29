import { Invoice } from './types';
import { XMLBuilder } from 'fast-xml-parser';

export default class InvoiceBuilder {
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

    public generatePeppolInvoice(invoice: Invoice): string {
        console.log(this.__invoiceShell({}));
        return this.__builder.build(this.__invoiceShell({}));
    }

    private __invoiceShell(invoiceData: any) {
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

    private __attributes(attributes: Record<string, any>) {
        return Object.fromEntries(
            Object.entries(attributes).map(([key, value]) => [`$${key}`, value])
        );
    }
}
