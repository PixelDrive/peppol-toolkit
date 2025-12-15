import { XMLBuilder } from 'fast-xml-parser';
import { builderOptions } from './builderOptions';
import { CurrencyCode, Invoice, partySchema } from '../documents';
import XMLAttributes from '../helpers/XMLAttributes';
import getDateString from '../helpers/getDateString';
import { z } from 'zod';
import { CreditNote } from '../documents/invoices/CreditNote';

const DEFAULT_CUSTOMIZATION_ID =
    'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';
const DEFAULT_PROFILE_ID = 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';

export class DocumentBuilder {
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
    public generatePeppolInvoice(invoice: Invoice) {
        return this.__builder.build(this.__buildInvoice(invoice));
    }

    /***
     * Generates a Peppol invoice from the given invoice data
     * @param invoice The invoice data
     * @returns The Peppol invoice XML document as a string
     */
    public generatePeppolCreditNote(creditNote: CreditNote) {
        return this.__builder.build(this.__buildCreditNote(creditNote));
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
                    'xmlns:cec':
                        'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
                    xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                }),
                'cbc:UBLVersionID': '2.1',
                'cbc:CustomizationID':
                    invoice.customizationID ?? DEFAULT_CUSTOMIZATION_ID,
                'cbc:ProfileID': invoice.profileID ?? DEFAULT_PROFILE_ID,
                'cbc:ID': invoice.ID,
                'cbc:IssueDate': getDateString(invoice.issueDate),
                'cbc:DueDate': invoice.dueDate
                    ? getDateString(invoice.dueDate)
                    : undefined,
                'cbc:InvoiceTypeCode': invoice.invoiceTypeCode,
                'cbc:DocumentCurrencyCode': invoice.documentCurrencyCode,
                'cbc:BuyerReference': invoice.buyerReference,
                'cac:AccountingSupplierParty': this.__buildParty(
                    invoice.seller
                ),
                'cac:AccountingCustomerParty': this.__buildParty(invoice.buyer),
                'cac:PaymentMeans': this.__buildPaymentMeans(
                    invoice.paymentMeans
                ),
                ...(invoice.paymentTermsNote
                    ? {
                          'cac:PaymentTerms': {
                              'cbc:Note': invoice.paymentTermsNote,
                          },
                      }
                    : {}),
                'cac:TaxTotal': this.__buildTaxTotal(invoice.taxTotal),
                'cac:LegalMonetaryTotal': this.__buildMonetaryTotal(
                    invoice.legalMonetaryTotal
                ),
                'cac:InvoiceLine': invoice.invoiceLines.map(
                    this.__buildInvoiceLine
                ),
            },
        };
    }

    /**
     * Helper function to generate the creditNote in Peppol format as an object
     * @param creditNote The credit-note data
     * @returns The creditNote in Peppol format as an object
     */
    private __buildCreditNote(creditNote: CreditNote) {
        return {
            ...this.__xmlHeader,
            CreditNote: {
                ...XMLAttributes({
                    'xmlns:cac':
                        'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
                    'xmlns:cbc':
                        'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
                    'xmlns:cec':
                        'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
                    xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
                }),
                'cbc:UBLVersionID': '2.1',
                'cbc:CustomizationID':
                    creditNote.customizationID ?? DEFAULT_CUSTOMIZATION_ID,
                'cbc:ProfileID': creditNote.profileID ?? DEFAULT_PROFILE_ID,
                'cbc:ID': creditNote.ID || 'AUTOGENERATE',
                'cbc:IssueDate': getDateString(creditNote.issueDate),
                'cbc:CreditNoteTypeCode': creditNote.creditNoteTypeCode ?? 381,
                'cbc:DocumentCurrencyCode':
                    creditNote.documentCurrencyCode || 'EUR',
                'cbc:BuyerReference': creditNote.buyerReference,
                'cac:BillingReference':
                    creditNote.billingReference &&
                    creditNote.billingReference?.invoiceDocReference
                        ? {
                              'cac:InvoiceDocumentReference': {
                                  'cbc:ID':
                                      creditNote.billingReference
                                          .invoiceDocReference.id,
                                  'cbc:IssueDate':
                                      creditNote.billingReference
                                          .invoiceDocReference.issueDate ?? 0,
                              },
                          }
                        : {},
                'cac:AccountingSupplierParty': this.__buildParty(
                    creditNote.seller
                ),
                'cac:AccountingCustomerParty': this.__buildParty(
                    creditNote.buyer
                ),
                'cac:PaymentMeans': this.__buildPaymentMeans(
                    creditNote.paymentMeans
                ),
                ...(creditNote.paymentTermsNote
                    ? {
                          'cac:PaymentTerms': {
                              'cbc:Note': creditNote.paymentTermsNote,
                          },
                      }
                    : {}),
                'cac:TaxTotal': this.__buildTaxTotal(creditNote.taxTotal),
                'cac:LegalMonetaryTotal': this.__buildMonetaryTotal(
                    creditNote.legalMonetaryTotal
                ),
                'cac:CreditNoteLine': creditNote.creditNoteLines.map(
                    this._buildCreditNoteLine
                ),
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
                ...(party.name
                    ? { 'cac:PartyName': { 'cbc:Name': party.name } }
                    : {}),
                'cac:PostalAddress': {
                    'cbc:StreetName': party.address.streetName,
                    'cbc:AdditionalStreetName':
                        party.address.additionalStreetName,
                    'cbc:CityName': party.address.cityName,
                    'cbc:PostalZone': party.address.postalZone,
                    'cac:Country': {
                        'cbc:IdentificationCode': party.address.country,
                    },
                },

                'cac:PartyTaxScheme': {
                    'cbc:CompanyID': party.taxSchemeCompanyID,
                    'cac:TaxScheme': {
                        'cbc:ID': 'VAT',
                    },
                },
                'cac:PartyLegalEntity': {
                    'cbc:RegistrationName': party.legalEntity.registrationName,
                    ...(party.legalEntity.companyId
                        ? {
                              'cbc:CompanyID': party.legalEntity.companyId,
                          }
                        : {}),
                    ...(party.legalEntity.legalForm
                        ? {
                              'cbc:CompanyLegalForm':
                                  party.legalEntity.legalForm,
                          }
                        : {}),
                },
                ...(party.contact
                    ? {
                          'cac:Contact': {
                              'cbc:Name': party.contact.name,
                              'cbc:Telephone': party.contact.phone,
                              'cbc:ElectronicMail': party.contact.email,
                          },
                      }
                    : {}),
            },
        };
    }

    /**
     * Builds the payment means for the invoice, mapping the provided data into a specific structure.
     * @param means - The payment means data from the invoice, including details about codes, payment IDs, and optional financial account information.
     * @return An array of payment means objects with the structured data or undefined if no payment means are provided.
     */
    private __buildPaymentMeans(means: Invoice['paymentMeans']) {
        return means?.map((m) => {
            const financialAccount = m.financialAccount;
            return {
                'cbc:PaymentMeansCode': m.code,
                'cbc:PaymentID': m.paymentId,
                ...(financialAccount
                    ? {
                          'cac:PayeeFinancialAccount': {
                              'cbc:ID': financialAccount.id,
                              'cbc:Name': financialAccount.name,
                              'cac:FinancialInstitutionBranch':
                                  financialAccount.financialInstitutionBranch
                                      ? {
                                            'cbc:ID':
                                                financialAccount.financialInstitutionBranch,
                                        }
                                      : undefined,
                          },
                      }
                    : {}),
            };
        });
    }

    /**
     * Builds the tax total information in the required format for an invoice.
     * @param total - An array representing the tax total details, including tax amounts, sub totals, currencies, and tax categories.
     * @return Returns an array of objects formatted as tax total components, including tax amounts, sub totals, and associated category details in compliance with specified XML attributes and structure.
     */
    private __buildTaxTotal(total: Invoice['taxTotal']) {
        return total.map((t) => {
            return {
                'cbc:TaxAmount': {
                    '#text': t.taxAmount.toFixed(2),
                    ...XMLAttributes({
                        currencyID: t.taxAmountCurrency,
                    }),
                },
                'cac:TaxSubtotal': t.subTotals.map((st) => ({
                    'cbc:TaxableAmount': {
                        '#text': st.taxableAmount.toFixed(2),
                        ...XMLAttributes({
                            currencyID:
                                st.taxableAmountCurrency ?? t.taxAmountCurrency,
                        }),
                    },
                    'cbc:TaxAmount': {
                        '#text': st.taxAmount.toFixed(2),
                        ...XMLAttributes({
                            currencyID:
                                st.taxAmountCurrency ?? t.taxAmountCurrency,
                        }),
                    },
                    'cac:TaxCategory': {
                        'cbc:ID': st.taxCategory.categoryCode,
                        'cbc:Percent': st.taxCategory.percent?.toFixed(2),
                        'cbc:TaxExemptionReason':
                            st.taxCategory.exemptionReason,
                        'cbc:TaxExemptionReasonCode':
                            st.taxCategory.exemptionReasonCode,
                        'cac:TaxScheme': {
                            'cbc:ID': 'VAT',
                        },
                    },
                })),
            };
        });
    }

    private __buildMonetaryTotal(total: Invoice['legalMonetaryTotal']) {
        const currency = total.currency;
        return {
            // Mandatory fields
            ...this.__buildAmount(
                'LineExtensionAmount',
                total.lineExtensionAmount,
                total.lineExtensionAmountCurrency ?? currency
            ),
            ...this.__buildAmount(
                'TaxExclusiveAmount',
                total.taxExclusiveAmount,
                total.taxExclusiveAmountCurrency ?? currency
            ),
            ...this.__buildAmount(
                'TaxInclusiveAmount',
                total.taxInclusiveAmount,
                total.taxInclusiveAmountCurrency ?? currency
            ),
            ...this.__buildAmount(
                'PayableAmount',
                total.payableAmount,
                total.payableAmountCurrency ?? currency
            ),

            // Optional fields
            ...this.__buildAmount(
                'AllowanceTotalAmount',
                total.allowanceTotalAmount,
                total.allowanceTotalAmountCurrency ?? currency
            ),
            ...this.__buildAmount(
                'ChargeTotalAmount',
                total.chargeTotalAmount,
                total.chargeTotalAmountCurrency ?? currency
            ),
            ...this.__buildAmount(
                'PrepaidAmount',
                total.prepaidAmount,
                total.prepaidAmountCurrency ?? currency
            ),
            ...this.__buildAmount(
                'PayableRoundingAmount',
                total.payableRoundingAmount,
                total.payableRoundingAmountCurrency ?? currency
            ),
        };
    }

    private __buildAmount(
        name: string,
        amount: number | undefined,
        currency: CurrencyCode
    ) {
        if (!amount) return {};
        return {
            [`cbc:${name}`]: {
                '#text': amount.toFixed(2),
                ...XMLAttributes({
                    currencyID: currency,
                }),
            },
        };
    }

    private __buildInvoiceLine(line: Invoice['invoiceLines'][number]) {
        return {
            'cbc:ID': line.id,
            ...(line.note ? { 'cbc:Note': line.note } : {}),
            'cbc:InvoicedQuantity': {
                '#text': line.invoicedQuantity.toFixed(2),
                ...XMLAttributes({
                    unitCode: line.unitCode,
                }),
            },
            'cbc:LineExtensionAmount': {
                '#text': line.lineExtensionAmount.toFixed(2),
                ...XMLAttributes({
                    currencyID: line.currency,
                }),
            },
            'cac:Item': {
                'cbc:Name': line.name,
                'cbc:Description': line.description,
                'cac:ClassifiedTaxCategory': {
                    'cbc:ID': line.taxCategory.categoryCode,
                    'cbc:Percent': line.taxCategory.percent?.toFixed(2),
                    'cac:TaxScheme': {
                        'cbc:ID': 'VAT',
                    },
                },
            },
            'cac:Price': {
                'cbc:PriceAmount': {
                    '#text': line.price.toFixed(2),
                    ...XMLAttributes({
                        currencyID: line.currency,
                    }),
                },
            },
        };
    }

    private _buildCreditNoteLine(line: CreditNote['creditNoteLines'][number]) {
        return {
            'cbc:ID': line.id,
            ...(line.note ? { 'cbc:Note': line.note } : {}),
            'cbc:CreditedQuantity': {
                '#text': line.invoicedQuantity.toFixed(2),
                ...XMLAttributes({
                    unitCode: line.unitCode,
                }),
            },
            'cbc:LineExtensionAmount': {
                '#text': line.lineExtensionAmount.toFixed(2),
                ...XMLAttributes({
                    currencyID: line.currency,
                }),
            },
            'cac:Item': {
                'cbc:Name': line.name,
                'cbc:Description': line.description,
                'cac:ClassifiedTaxCategory': {
                    'cbc:ID': line.taxCategory.categoryCode,
                    'cbc:Percent': line.taxCategory.percent?.toFixed(2),
                    'cac:TaxScheme': {
                        'cbc:ID': 'VAT',
                    },
                },
            },
            'cac:Price': {
                'cbc:PriceAmount': {
                    '#text': line.price.toFixed(2),
                    ...XMLAttributes({
                        currencyID: line.currency,
                    }),
                },
            },
        };
    }
}
