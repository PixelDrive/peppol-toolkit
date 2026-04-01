import { XMLBuilder } from 'fast-xml-parser';
import { builderOptions } from './builderOptions';
import { CurrencyCode, Invoice, partySchema, CreditNote } from '../documents';
import XMLAttributes from '../helpers/XMLAttributes';
import getDateString from '../helpers/getDateString';
import { z } from 'zod';

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
     * Generates a Peppol credit note from the given credit note data
     * @param creditNote The credit note data
     * @returns The Peppol credit note XML document as a string
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
                ...(invoice.note
                    ? { 'cbc:Note': invoice.note }
                    : {}),
                ...(invoice.taxPointDate
                    ? {
                          'cbc:TaxPointDate': getDateString(
                              invoice.taxPointDate
                          ),
                      }
                    : {}),
                'cbc:DocumentCurrencyCode': invoice.documentCurrencyCode,
                ...(invoice.taxCurrencyCode
                    ? {
                          'cbc:TaxCurrencyCode': invoice.taxCurrencyCode,
                      }
                    : {}),
                ...(invoice.accountingCost
                    ? { 'cbc:AccountingCost': invoice.accountingCost }
                    : {}),
                'cbc:BuyerReference': invoice.buyerReference,
                ...(invoice.invoicePeriod
                    ? {
                          'cac:InvoicePeriod':
                              this.__buildInvoicePeriod(invoice.invoicePeriod),
                      }
                    : {}),
                ...(invoice.orderReference
                    ? {
                          'cac:OrderReference': {
                              'cbc:ID': invoice.orderReference.id,
                              ...(invoice.orderReference.salesOrderId
                                  ? {
                                        'cbc:SalesOrderID':
                                            invoice.orderReference
                                                .salesOrderId,
                                    }
                                  : {}),
                          },
                      }
                    : {}),
                ...(invoice.billingReference &&
                invoice.billingReference.length > 0
                    ? {
                          'cac:BillingReference':
                              invoice.billingReference.map((ref) => ({
                                  'cac:InvoiceDocumentReference': {
                                      'cbc:ID': ref.invoiceDocReference.id,
                                      ...(ref.invoiceDocReference.issueDate
                                          ? {
                                                'cbc:IssueDate':
                                                    getDateString(
                                                        ref.invoiceDocReference
                                                            .issueDate
                                                    ),
                                            }
                                          : {}),
                                  },
                              })),
                      }
                    : {}),
                ...(invoice.despatchDocumentReference
                    ? {
                          'cac:DespatchDocumentReference': {
                              'cbc:ID': invoice.despatchDocumentReference,
                          },
                      }
                    : {}),
                ...(invoice.receiptDocumentReference
                    ? {
                          'cac:ReceiptDocumentReference': {
                              'cbc:ID': invoice.receiptDocumentReference,
                          },
                      }
                    : {}),
                ...(invoice.originatorDocumentReference
                    ? {
                          'cac:OriginatorDocumentReference': {
                              'cbc:ID': invoice.originatorDocumentReference,
                          },
                      }
                    : {}),
                ...(invoice.contractDocumentReference
                    ? {
                          'cac:ContractDocumentReference': {
                              'cbc:ID': invoice.contractDocumentReference,
                          },
                      }
                    : {}),
                ...(invoice.additionalDocumentReference &&
                invoice.additionalDocumentReference.length > 0
                    ? {
                          'cac:AdditionalDocumentReference':
                              invoice.additionalDocumentReference.map(
                                  this.__buildAdditionalDocumentReference
                              ),
                      }
                    : {}),
                ...(invoice.projectReference
                    ? {
                          'cac:ProjectReference': {
                              'cbc:ID': invoice.projectReference,
                          },
                      }
                    : {}),
                'cac:AccountingSupplierParty': this.__buildParty(
                    invoice.seller
                ),
                'cac:AccountingCustomerParty': this.__buildParty(invoice.buyer),
                ...(invoice.delivery
                    ? {
                          'cac:Delivery': this.__buildDelivery(
                              invoice.delivery
                          ),
                      }
                    : {}),
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
                ...(invoice.allowanceCharge &&
                invoice.allowanceCharge.length > 0
                    ? {
                          'cac:AllowanceCharge':
                              invoice.allowanceCharge.map((ac) =>
                                  this.__buildAllowanceCharge(
                                      ac,
                                      invoice.documentCurrencyCode
                                  )
                              ),
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
                ...(creditNote.taxPointDate
                    ? {
                          'cbc:TaxPointDate': getDateString(
                              creditNote.taxPointDate
                          ),
                      }
                    : {}),
                'cbc:CreditNoteTypeCode': creditNote.creditNoteTypeCode ?? 381,
                ...(creditNote.note
                    ? { 'cbc:Note': creditNote.note }
                    : {}),
                'cbc:DocumentCurrencyCode':
                    creditNote.documentCurrencyCode || 'EUR',
                ...(creditNote.taxCurrencyCode
                    ? {
                          'cbc:TaxCurrencyCode': creditNote.taxCurrencyCode,
                      }
                    : {}),
                ...(creditNote.accountingCost
                    ? { 'cbc:AccountingCost': creditNote.accountingCost }
                    : {}),
                'cbc:BuyerReference': creditNote.buyerReference,
                ...(creditNote.invoicePeriod
                    ? {
                          'cac:InvoicePeriod':
                              this.__buildInvoicePeriod(
                                  creditNote.invoicePeriod
                              ),
                      }
                    : {}),
                ...(creditNote.orderReference
                    ? {
                          'cac:OrderReference': {
                              'cbc:ID': creditNote.orderReference.id,
                              ...(creditNote.orderReference.salesOrderId
                                  ? {
                                        'cbc:SalesOrderID':
                                            creditNote.orderReference
                                                .salesOrderId,
                                    }
                                  : {}),
                          },
                      }
                    : {}),
                ...(creditNote.billingReference &&
                creditNote.billingReference.length > 0
                    ? {
                          'cac:BillingReference':
                              creditNote.billingReference.map((ref) => ({
                                  'cac:InvoiceDocumentReference': {
                                      'cbc:ID': ref.invoiceDocReference.id,
                                      ...(ref.invoiceDocReference.issueDate
                                          ? {
                                                'cbc:IssueDate':
                                                    getDateString(
                                                        ref.invoiceDocReference
                                                            .issueDate
                                                    ),
                                            }
                                          : {}),
                                  },
                              })),
                      }
                    : {}),
                ...(creditNote.despatchDocumentReference
                    ? {
                          'cac:DespatchDocumentReference': {
                              'cbc:ID': creditNote.despatchDocumentReference,
                          },
                      }
                    : {}),
                ...(creditNote.receiptDocumentReference
                    ? {
                          'cac:ReceiptDocumentReference': {
                              'cbc:ID': creditNote.receiptDocumentReference,
                          },
                      }
                    : {}),
                ...(creditNote.contractDocumentReference
                    ? {
                          'cac:ContractDocumentReference': {
                              'cbc:ID': creditNote.contractDocumentReference,
                          },
                      }
                    : {}),
                ...(creditNote.additionalDocumentReference &&
                creditNote.additionalDocumentReference.length > 0
                    ? {
                          'cac:AdditionalDocumentReference':
                              creditNote.additionalDocumentReference.map(
                                  this.__buildAdditionalDocumentReference
                              ),
                      }
                    : {}),
                ...(creditNote.originatorDocumentReference
                    ? {
                          'cac:OriginatorDocumentReference': {
                              'cbc:ID':
                                  creditNote.originatorDocumentReference,
                          },
                      }
                    : {}),
                'cac:AccountingSupplierParty': this.__buildParty(
                    creditNote.seller
                ),
                'cac:AccountingCustomerParty': this.__buildParty(
                    creditNote.buyer
                ),
                ...(creditNote.delivery
                    ? {
                          'cac:Delivery': this.__buildDelivery(
                              creditNote.delivery
                          ),
                      }
                    : {}),
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
                ...(creditNote.allowanceCharge &&
                creditNote.allowanceCharge.length > 0
                    ? {
                          'cac:AllowanceCharge':
                              creditNote.allowanceCharge.map((ac) =>
                                  this.__buildAllowanceCharge(
                                      ac,
                                      creditNote.documentCurrencyCode
                                  )
                              ),
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

    private __buildInvoicePeriod(
        period: NonNullable<Invoice['invoicePeriod']>
    ) {
        return {
            ...(period.startDate
                ? { 'cbc:StartDate': getDateString(period.startDate) }
                : {}),
            ...(period.endDate
                ? { 'cbc:EndDate': getDateString(period.endDate) }
                : {}),
            ...(period.descriptionCode
                ? { 'cbc:DescriptionCode': period.descriptionCode }
                : {}),
        };
    }

    private __buildDelivery(delivery: NonNullable<Invoice['delivery']>) {
        return {
            ...(delivery.actualDeliveryDate
                ? {
                      'cbc:ActualDeliveryDate': getDateString(
                          delivery.actualDeliveryDate
                      ),
                  }
                : {}),
            ...(delivery.deliveryLocation
                ? {
                      'cac:DeliveryLocation': {
                          ...(delivery.deliveryLocation.id
                              ? {
                                    'cbc:ID': {
                                        '#text': delivery.deliveryLocation.id,
                                        ...(delivery.deliveryLocation
                                            .locationSchemeID
                                            ? XMLAttributes({
                                                  schemeID:
                                                      delivery.deliveryLocation
                                                          .locationSchemeID,
                                              })
                                            : {}),
                                    },
                                }
                              : {}),
                          ...(delivery.deliveryLocation.address
                              ? {
                                    'cac:Address': {
                                        'cbc:StreetName':
                                            delivery.deliveryLocation.address
                                                .streetName,
                                        'cbc:AdditionalStreetName':
                                            delivery.deliveryLocation.address
                                                .additionalStreetName,
                                        'cbc:CityName':
                                            delivery.deliveryLocation.address
                                                .cityName,
                                        'cbc:PostalZone':
                                            delivery.deliveryLocation.address
                                                .postalZone,
                                        'cac:Country': {
                                            'cbc:IdentificationCode':
                                                delivery.deliveryLocation
                                                    .address.country,
                                        },
                                    },
                                }
                              : {}),
                      },
                  }
                : {}),
            ...(delivery.deliveryPartyName
                ? {
                      'cac:DeliveryParty': {
                          'cac:PartyName': {
                              'cbc:Name': delivery.deliveryPartyName,
                          },
                      },
                  }
                : {}),
        };
    }

    private __buildAllowanceCharge(
        ac: NonNullable<Invoice['allowanceCharge']>[number],
        documentCurrency: CurrencyCode
    ) {
        const currency = ac.currency ?? documentCurrency;
        return {
            'cbc:ChargeIndicator': ac.chargeIndicator,
            ...(ac.reasonCode
                ? {
                      'cbc:AllowanceChargeReasonCode': ac.reasonCode,
                  }
                : {}),
            ...(ac.reason
                ? { 'cbc:AllowanceChargeReason': ac.reason }
                : {}),
            ...(ac.multiplierFactorNumeric !== undefined
                ? {
                      'cbc:MultiplierFactorNumeric':
                          ac.multiplierFactorNumeric,
                  }
                : {}),
            'cbc:Amount': {
                '#text': ac.amount.toFixed(2),
                ...XMLAttributes({ currencyID: currency }),
            },
            ...(ac.baseAmount !== undefined
                ? {
                      'cbc:BaseAmount': {
                          '#text': ac.baseAmount.toFixed(2),
                          ...XMLAttributes({ currencyID: currency }),
                      },
                  }
                : {}),
            'cac:TaxCategory': {
                'cbc:ID': ac.taxCategory.categoryCode,
                ...(ac.taxCategory.percent !== undefined
                    ? {
                          'cbc:Percent': ac.taxCategory.percent.toFixed(2),
                      }
                    : {}),
                'cac:TaxScheme': {
                    'cbc:ID': 'VAT',
                },
            },
        };
    }

    private __buildLineAllowanceCharge(
        ac: NonNullable<
            Invoice['invoiceLines'][number]['allowanceCharge']
        >[number],
        lineCurrency: CurrencyCode
    ) {
        const currency = ac.currency ?? lineCurrency;
        return {
            'cbc:ChargeIndicator': ac.chargeIndicator,
            ...(ac.reasonCode
                ? {
                      'cbc:AllowanceChargeReasonCode': ac.reasonCode,
                  }
                : {}),
            ...(ac.reason
                ? { 'cbc:AllowanceChargeReason': ac.reason }
                : {}),
            ...(ac.multiplierFactorNumeric !== undefined
                ? {
                      'cbc:MultiplierFactorNumeric':
                          ac.multiplierFactorNumeric,
                  }
                : {}),
            'cbc:Amount': {
                '#text': ac.amount.toFixed(2),
                ...XMLAttributes({ currencyID: currency }),
            },
            ...(ac.baseAmount !== undefined
                ? {
                      'cbc:BaseAmount': {
                          '#text': ac.baseAmount.toFixed(2),
                          ...XMLAttributes({ currencyID: currency }),
                      },
                  }
                : {}),
        };
    }

    private __buildAdditionalDocumentReference(
        ref: NonNullable<Invoice['additionalDocumentReference']>[number]
    ) {
        return {
            'cbc:ID': {
                '#text': ref.id,
                ...(ref.schemeID
                    ? XMLAttributes({ schemeID: ref.schemeID })
                    : {}),
            },
            ...(ref.documentTypeCode
                ? { 'cbc:DocumentTypeCode': ref.documentTypeCode }
                : {}),
            ...(ref.documentDescription
                ? { 'cbc:DocumentDescription': ref.documentDescription }
                : {}),
            ...(ref.attachment
                ? {
                      'cac:Attachment': {
                          ...(ref.attachment.embeddedDocumentBinaryObject
                              ? {
                                    'cbc:EmbeddedDocumentBinaryObject': {
                                        '#text':
                                            ref.attachment
                                                .embeddedDocumentBinaryObject,
                                        ...XMLAttributes({
                                            mimeCode:
                                                ref.attachment.mimeCode ?? '',
                                            filename:
                                                ref.attachment.filename ?? '',
                                        }),
                                    },
                                }
                              : {}),
                          ...(ref.attachment.externalReference
                              ? {
                                    'cac:ExternalReference': {
                                        'cbc:URI':
                                            ref.attachment.externalReference,
                                    },
                                }
                              : {}),
                      },
                  }
                : {}),
        };
    }

    private __buildLineItem(
        line: Invoice['invoiceLines'][number],
        quantityTag: string
    ) {
        return {
            'cbc:ID': line.id,
            ...(line.note ? { 'cbc:Note': line.note } : {}),
            [`cbc:${quantityTag}`]: {
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
            ...(line.accountingCost
                ? { 'cbc:AccountingCost': line.accountingCost }
                : {}),
            ...(line.invoicePeriod
                ? {
                      'cac:InvoicePeriod': {
                          ...(line.invoicePeriod.startDate
                              ? {
                                    'cbc:StartDate': getDateString(
                                        line.invoicePeriod.startDate
                                    ),
                                }
                              : {}),
                          ...(line.invoicePeriod.endDate
                              ? {
                                    'cbc:EndDate': getDateString(
                                        line.invoicePeriod.endDate
                                    ),
                                }
                              : {}),
                      },
                  }
                : {}),
            ...(line.orderLineReference
                ? {
                      'cac:OrderLineReference': {
                          'cbc:LineID': line.orderLineReference,
                      },
                  }
                : {}),
            ...(line.documentReference
                ? {
                      'cac:DocumentReference': {
                          'cbc:ID': line.documentReference,
                          'cbc:DocumentTypeCode': '130',
                      },
                  }
                : {}),
            ...(line.allowanceCharge && line.allowanceCharge.length > 0
                ? {
                      'cac:AllowanceCharge': line.allowanceCharge.map(
                          (ac) =>
                              this.__buildLineAllowanceCharge(
                                  ac,
                                  line.currency
                              )
                      ),
                  }
                : {}),
            'cac:Item': {
                ...(line.description
                    ? { 'cbc:Description': line.description }
                    : {}),
                'cbc:Name': line.name,
                ...(line.buyersItemIdentification
                    ? {
                          'cac:BuyersItemIdentification': {
                              'cbc:ID': line.buyersItemIdentification,
                          },
                      }
                    : {}),
                ...(line.sellersItemIdentification
                    ? {
                          'cac:SellersItemIdentification': {
                              'cbc:ID': line.sellersItemIdentification,
                          },
                      }
                    : {}),
                ...(line.standardItemIdentification
                    ? {
                          'cac:StandardItemIdentification': {
                              'cbc:ID': {
                                  '#text':
                                      line.standardItemIdentification.id,
                                  ...XMLAttributes({
                                      schemeID:
                                          line.standardItemIdentification
                                              .schemeID,
                                  }),
                              },
                          },
                      }
                    : {}),
                ...(line.originCountry
                    ? {
                          'cac:OriginCountry': {
                              'cbc:IdentificationCode': line.originCountry,
                          },
                      }
                    : {}),
                ...(line.commodityClassification &&
                line.commodityClassification.length > 0
                    ? {
                          'cac:CommodityClassification':
                              line.commodityClassification.map((cc) => ({
                                  'cbc:ItemClassificationCode': {
                                      '#text': cc.code,
                                      ...XMLAttributes({
                                          listID: cc.listID,
                                          ...(cc.listVersionID
                                              ? {
                                                    listVersionID:
                                                        cc.listVersionID,
                                                }
                                              : {}),
                                      }),
                                  },
                              })),
                      }
                    : {}),
                'cac:ClassifiedTaxCategory': {
                    'cbc:ID': line.taxCategory.categoryCode,
                    'cbc:Percent': line.taxCategory.percent?.toFixed(2),
                    'cac:TaxScheme': {
                        'cbc:ID': 'VAT',
                    },
                },
                ...(line.additionalItemProperties &&
                line.additionalItemProperties.length > 0
                    ? {
                          'cac:AdditionalItemProperty':
                              line.additionalItemProperties.map((prop) => ({
                                  'cbc:Name': prop.name,
                                  'cbc:Value': prop.value,
                              })),
                      }
                    : {}),
            },
            'cac:Price': {
                'cbc:PriceAmount': {
                    '#text': line.price.toFixed(2),
                    ...XMLAttributes({
                        currencyID: line.currency,
                    }),
                },
                ...(line.baseQuantity !== undefined
                    ? {
                          'cbc:BaseQuantity': {
                              '#text': line.baseQuantity.toFixed(2),
                              ...XMLAttributes({
                                  unitCode: line.unitCode,
                              }),
                          },
                      }
                    : {}),
                ...(line.priceAllowanceCharge
                    ? {
                          'cac:AllowanceCharge': {
                              'cbc:ChargeIndicator': false,
                              'cbc:Amount': {
                                  '#text':
                                      line.priceAllowanceCharge.amount.toFixed(
                                          2
                                      ),
                                  ...XMLAttributes({
                                      currencyID:
                                          line.priceAllowanceCharge.currency ??
                                          line.currency,
                                  }),
                              },
                              ...(line.priceAllowanceCharge.baseAmount !==
                              undefined
                                  ? {
                                        'cbc:BaseAmount': {
                                            '#text':
                                                line.priceAllowanceCharge.baseAmount.toFixed(
                                                    2
                                                ),
                                            ...XMLAttributes({
                                                currencyID:
                                                    line.priceAllowanceCharge
                                                        .currency ??
                                                    line.currency,
                                            }),
                                        },
                                    }
                                  : {}),
                          },
                      }
                    : {}),
            },
        };
    }

    private __buildInvoiceLine(line: Invoice['invoiceLines'][number]) {
        return DocumentBuilder.prototype.__buildLineItem(
            line,
            'InvoicedQuantity'
        );
    }

    private _buildCreditNoteLine(line: CreditNote['creditNoteLines'][number]) {
        return DocumentBuilder.prototype.__buildLineItem(
            line,
            'CreditedQuantity'
        );
    }
}
