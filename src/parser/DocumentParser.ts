import {
    getUblChild,
    getUblChildren,
    readUblDocument,
    readUblFields,
} from './readUblDocument';
import {
    CefEASCode,
    CreditNote,
    creditNoteSchema,
    CurrencyCode,
    En16931CreditNote,
    en16931CreditNoteSchema,
    En16931Invoice,
    en16931InvoiceSchema,
    en16931PartySchema,
    Invoice,
    invoiceSchema,
} from '../documents';
import { partyIdentificationSchema } from '../documents/en16931/Parties';
import { z } from 'zod';

export class DocumentParser {
    private static readonly __DECIMAL_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/;

    private __hasWarnedLegacyAddressLine = false;

    /***
     * Parses a Peppol UBL Invoice XML string into an Invoice object
     * @param xml The UBL Invoice XML string
     * @returns The parsed Invoice object
     * @throws ZodError when the document is not a valid Peppol invoice, e.g. when a party has no electronic address
     */
    public parseInvoice(xml: string): Invoice {
        return invoiceSchema.parse(this.__readInvoice(xml));
    }

    /***
     * Parses an EN 16931 UBL Invoice XML string into an En16931Invoice object. Accepts any invoice
     * following the EN 16931 model, Peppol BIS invoices included; the seller and the buyer may have
     * no electronic address.
     * @param xml The UBL Invoice XML string
     * @returns The parsed En16931Invoice object
     */
    public parseEn16931Invoice(xml: string): En16931Invoice {
        return en16931InvoiceSchema.parse(this.__readInvoice(xml));
    }

    /***
     * Parses a Peppol UBL CreditNote XML string into a CreditNote object
     * @param xml The UBL CreditNote XML string
     * @returns The parsed CreditNote object
     * @throws ZodError when the document is not a valid Peppol credit note, e.g. when a party has no electronic address
     */
    public parseCreditNote(xml: string): CreditNote {
        return creditNoteSchema.parse(this.__readCreditNote(xml));
    }

    /***
     * Parses an EN 16931 UBL CreditNote XML string into an En16931CreditNote object. Accepts any
     * credit note following the EN 16931 model, Peppol BIS credit notes included; the seller and the
     * buyer may have no electronic address.
     * @param xml The UBL CreditNote XML string
     * @returns The parsed En16931CreditNote object
     */
    public parseEn16931CreditNote(xml: string): En16931CreditNote {
        return en16931CreditNoteSchema.parse(this.__readCreditNote(xml));
    }

    /**
     * Reads the content of a UBL Invoice, before validation against a schema
     * @param xml The UBL Invoice XML string
     */
    private __readInvoice(xml: string) {
        const document = readUblDocument(xml);
        if (document?.kind !== 'Invoice') {
            throw new Error('Not a valid UBL Invoice document');
        }
        const inv = readUblFields(document.root);

        return {
            ...this.__readCommonFields(inv),
            dueDate: this.__str(inv['cbc:DueDate']),
            invoiceTypeCode: this.__num(inv['cbc:InvoiceTypeCode'])!,
            projectReference: this.__parseSimpleDocRef(
                getUblChild(inv, 'cac:ProjectReference')
            ),
            invoiceLines: (getUblChildren(inv, 'cac:InvoiceLine') ?? []).map(
                (line) => this.__parseLineItem(line, 'InvoicedQuantity')
            ),
        };
    }

    /**
     * Reads the content of a UBL CreditNote, before validation against a schema
     * @param xml The UBL CreditNote XML string
     */
    private __readCreditNote(xml: string) {
        const document = readUblDocument(xml);
        if (document?.kind !== 'CreditNote') {
            throw new Error('Not a valid UBL CreditNote document');
        }
        const cn = readUblFields(document.root);

        return {
            ...this.__readCommonFields(cn),
            creditNoteTypeCode: this.__num(cn['cbc:CreditNoteTypeCode'])!,
            creditNoteLines: (
                getUblChildren(cn, 'cac:CreditNoteLine') ?? []
            ).map((line) => this.__parseLineItem(line, 'CreditedQuantity')),
        };
    }

    private __readCommonFields(fields: Record<string, unknown>) {
        return {
            customizationID: this.__str(fields['cbc:CustomizationID']),
            profileID: this.__str(fields['cbc:ProfileID']),
            ID: this.__str(fields['cbc:ID'])!,
            issueDate: this.__str(fields['cbc:IssueDate'])!,
            note: this.__parseNotes(fields['cbc:Note']),
            taxPointDate: this.__str(fields['cbc:TaxPointDate']),
            documentCurrencyCode: this.__str(
                fields['cbc:DocumentCurrencyCode']
            )!,
            taxCurrencyCode: this.__str(fields['cbc:TaxCurrencyCode']),
            accountingCost: this.__str(fields['cbc:AccountingCost']),
            buyerReference: this.__str(fields['cbc:BuyerReference']),
            invoicePeriod: this.__parseInvoicePeriod(
                getUblChild(fields, 'cac:InvoicePeriod')
            ),
            orderReference: this.__parseOrderReference(
                getUblChild(fields, 'cac:OrderReference')
            ),
            billingReference: this.__parseBillingReferences(
                getUblChildren(fields, 'cac:BillingReference')
            ),
            despatchDocumentReference: this.__parseSimpleDocRef(
                getUblChild(fields, 'cac:DespatchDocumentReference')
            ),
            receiptDocumentReference: this.__parseSimpleDocRef(
                getUblChild(fields, 'cac:ReceiptDocumentReference')
            ),
            originatorDocumentReference: this.__parseSimpleDocRef(
                getUblChild(fields, 'cac:OriginatorDocumentReference')
            ),
            contractDocumentReference: this.__parseSimpleDocRef(
                getUblChild(fields, 'cac:ContractDocumentReference')
            ),
            additionalDocumentReference:
                this.__parseAdditionalDocumentReferences(
                    getUblChildren(fields, 'cac:AdditionalDocumentReference')
                ),
            seller: this.__parseParty(
                getUblChild(
                    getUblChild(fields, 'cac:AccountingSupplierParty'),
                    'cac:Party'
                )
            ),
            buyer: this.__parseParty(
                getUblChild(
                    getUblChild(fields, 'cac:AccountingCustomerParty'),
                    'cac:Party'
                )
            ),
            payeeParty: this.__parsePayeeParty(
                getUblChild(fields, 'cac:PayeeParty')
            ),
            taxRepresentativeParty: this.__parseTaxRepresentativeParty(
                getUblChild(fields, 'cac:TaxRepresentativeParty')
            ),
            delivery: this.__parseDelivery(getUblChild(fields, 'cac:Delivery')),
            paymentMeans: this.__parsePaymentMeans(
                getUblChildren(fields, 'cac:PaymentMeans')
            ),
            paymentTermsNote: this.__str(
                getUblChild(fields, 'cac:PaymentTerms')?.['cbc:Note']
            ),
            allowanceCharge: this.__parseAllowanceCharges(
                getUblChildren(fields, 'cac:AllowanceCharge')
            ),
            taxTotal: this.__parseTaxTotal(
                getUblChildren(fields, 'cac:TaxTotal') ?? []
            ),
            legalMonetaryTotal: this.__parseMonetaryTotal(
                getUblChild(fields, 'cac:LegalMonetaryTotal') ?? {}
            ),
        };
    }

    private __parseParty(
        party: Record<string, unknown> | undefined
    ): z.infer<typeof en16931PartySchema> {
        if (!party) throw new Error('Missing party in UBL document');

        const endpointEl = party['cbc:EndpointID'];
        const identifications = (
            (party['cac:PartyIdentification'] as unknown[] | undefined) ?? []
        ).map((pi) => {
            const idEl = (pi as Record<string, unknown>)['cbc:ID'];
            return {
                id: this.__str(idEl)!,
                scheme: this.__attr(idEl, 'schemeID') as z.infer<
                    typeof partyIdentificationSchema
                >['scheme'],
            };
        });

        const postal =
            (party['cac:PostalAddress'] as Record<string, unknown>) ?? {};
        const legalEntity =
            (party['cac:PartyLegalEntity'] as Record<string, unknown>) ?? {};
        const contact = party['cac:Contact'] as
            | Record<string, unknown>
            | undefined;
        const partyNameEl = party['cac:PartyName'] as
            | Record<string, unknown>
            | undefined;
        const country = postal['cac:Country'] as
            | Record<string, unknown>
            | undefined;

        return {
            // The electronic address is optional in EN 16931; the Peppol schemas require it
            endPoint:
                endpointEl !== undefined
                    ? {
                          scheme: this.__attr(
                              endpointEl,
                              'schemeID'
                          ) as CefEASCode,
                          id: this.__str(endpointEl)!,
                      }
                    : undefined,
            identification:
                identifications.length > 0 ? identifications : undefined,
            name: partyNameEl ? this.__str(partyNameEl['cbc:Name']) : undefined,
            address: {
                streetName: this.__str(postal['cbc:StreetName']),
                additionalStreetName: this.__str(
                    postal['cbc:AdditionalStreetName']
                ),
                cityName: this.__str(postal['cbc:CityName']),
                postalZone: this.__str(postal['cbc:PostalZone']),
                countrySubentity: this.__str(postal['cbc:CountrySubentity']),
                addressLine: this.__parseAddressLine(postal),
                country: this.__str(
                    country?.['cbc:IdentificationCode']
                ) as z.infer<typeof en16931PartySchema>['address']['country'],
            },
            taxSchemes: (() => {
                const pts = party['cac:PartyTaxScheme'];
                if (!pts) return undefined;
                const ptsArray = Array.isArray(pts) ? pts : [pts];
                return ptsArray.map((ptsItem) => {
                    const ts = ptsItem as Record<string, unknown>;
                    const taxSchemeEl = ts['cac:TaxScheme'] as
                        | Record<string, unknown>
                        | undefined;
                    return {
                        companyId: this.__str(ts['cbc:CompanyID'])!,
                        schemeID: this.__str(taxSchemeEl?.['cbc:ID']),
                    };
                });
            })(),
            legalEntity: {
                registrationName: this.__str(
                    legalEntity['cbc:RegistrationName']
                )!,
                companyId:
                    legalEntity['cbc:CompanyID'] !== undefined
                        ? {
                              id: this.__str(legalEntity['cbc:CompanyID'])!,
                              schemeID: this.__attr(
                                  legalEntity['cbc:CompanyID'],
                                  'schemeID'
                              ),
                          }
                        : undefined,
                legalForm: this.__str(legalEntity['cbc:CompanyLegalForm']),
            },
            contact: contact
                ? {
                      name: this.__str(contact['cbc:Name']),
                      phone: this.__str(contact['cbc:Telephone']),
                      email: this.__str(contact['cbc:ElectronicMail']),
                  }
                : undefined,
        };
    }

    private __parsePayeeParty(
        party: Record<string, unknown> | undefined
    ): Invoice['payeeParty'] {
        if (!party) return undefined;

        const identEl = getUblChildren(
            party,
            'cac:PartyIdentification'
        )?.[0] as Record<string, unknown> | undefined;
        const idEl = identEl?.['cbc:ID'];
        const partyNameEl = party['cac:PartyName'] as
            | Record<string, unknown>
            | undefined;
        const legalEntity = party['cac:PartyLegalEntity'] as
            | Record<string, unknown>
            | undefined;
        const legalEntityIdEl = legalEntity?.['cbc:CompanyID'];

        return {
            identification: identEl
                ? {
                      id: this.__str(idEl)!,
                      schemeID: this.__attr(idEl, 'schemeID'),
                  }
                : undefined,
            name: this.__str(partyNameEl?.['cbc:Name'])!,
            legalEntity: legalEntity
                ? {
                      companyId:
                          legalEntityIdEl !== undefined
                              ? {
                                    id: this.__str(legalEntityIdEl)!,
                                    schemeID: this.__attr(
                                        legalEntityIdEl,
                                        'schemeID'
                                    ),
                                }
                              : undefined,
                  }
                : undefined,
        };
    }

    private __parseTaxRepresentativeParty(
        party: Record<string, unknown> | undefined
    ): Invoice['taxRepresentativeParty'] {
        if (!party) return undefined;

        const partyNameEl = party['cac:PartyName'] as
            | Record<string, unknown>
            | undefined;
        const postal =
            (party['cac:PostalAddress'] as Record<string, unknown>) ?? {};
        const country = postal['cac:Country'] as
            | Record<string, unknown>
            | undefined;
        const taxSchemeEl = party['cac:PartyTaxScheme'] as
            | Record<string, unknown>
            | undefined;
        const taxSchemeCodeEl = taxSchemeEl?.['cac:TaxScheme'] as
            | Record<string, unknown>
            | undefined;

        return {
            name: this.__str(partyNameEl?.['cbc:Name'])!,
            address: {
                streetName: this.__str(postal['cbc:StreetName']),
                additionalStreetName: this.__str(
                    postal['cbc:AdditionalStreetName']
                ),
                cityName: this.__str(postal['cbc:CityName']),
                postalZone: this.__str(postal['cbc:PostalZone']),
                countrySubentity: this.__str(postal['cbc:CountrySubentity']),
                addressLine: this.__parseAddressLine(postal),
                country: this.__str(
                    country?.['cbc:IdentificationCode']
                ) as z.infer<typeof en16931PartySchema>['address']['country'],
            },
            taxScheme: {
                companyId: this.__str(taxSchemeEl?.['cbc:CompanyID'])!,
                schemeID: this.__str(taxSchemeCodeEl?.['cbc:ID']),
            },
        };
    }

    private __parseAddressLine(
        address: Record<string, unknown>
    ): string | undefined {
        // Prefer the current cac:AddressLine/cbc:Line structure.
        const addressLine = address['cac:AddressLine'];
        if (addressLine && typeof addressLine === 'object') {
            return this.__str(
                (addressLine as Record<string, unknown>)['cbc:Line']
            );
        }

        const legacyAddressLine = this.__str(address['cbc:AddressLine']);
        if (legacyAddressLine && !this.__hasWarnedLegacyAddressLine) {
            this.__hasWarnedLegacyAddressLine = true;
            console.warn(
                '[peppol-toolkit] Legacy address format "cbc:AddressLine" is deprecated and will be removed in a future release. Use "cac:AddressLine/cbc:Line" instead.'
            );
        }
        return legacyAddressLine;
    }

    private __parseInvoicePeriod(
        period: Record<string, unknown> | undefined
    ): Invoice['invoicePeriod'] {
        if (!period) return undefined;
        return {
            startDate: this.__str(period['cbc:StartDate']),
            endDate: this.__str(period['cbc:EndDate']),
            descriptionCode: this.__str(
                period['cbc:DescriptionCode']
            ) as Invoice['invoicePeriod'] extends infer P
                ? P extends { descriptionCode?: infer D }
                    ? D
                    : never
                : never,
        };
    }

    private __parseOrderReference(
        ref: Record<string, unknown> | undefined
    ): Invoice['orderReference'] {
        if (!ref) return undefined;
        return {
            id: this.__str(ref['cbc:ID'])!,
            salesOrderId: this.__str(ref['cbc:SalesOrderID']),
        };
    }

    private __parseBillingReferences(
        refs: unknown[] | undefined
    ): Invoice['billingReference'] {
        if (!refs || refs.length === 0) return undefined;
        return refs.map((ref) => {
            const r = ref as Record<string, unknown>;
            const docRef = r['cac:InvoiceDocumentReference'] as Record<
                string,
                unknown
            >;
            return {
                invoiceDocReference: {
                    id: this.__str(docRef?.['cbc:ID'])!,
                    issueDate: this.__str(docRef?.['cbc:IssueDate']),
                },
            };
        });
    }

    private __parseSimpleDocRef(
        ref: Record<string, unknown> | undefined
    ): string | undefined {
        if (!ref) return undefined;
        return this.__str(ref['cbc:ID']);
    }

    private __parseAdditionalDocumentReferences(
        refs: unknown[] | undefined
    ): Invoice['additionalDocumentReference'] {
        if (!refs || refs.length === 0) return undefined;
        return refs.map((ref) => {
            const r = ref as Record<string, unknown>;
            const idEl = r['cbc:ID'];
            const attachment = r['cac:Attachment'] as
                | Record<string, unknown>
                | undefined;
            const binaryObj = attachment?.['cbc:EmbeddedDocumentBinaryObject'];
            const extRef = attachment?.['cac:ExternalReference'] as
                | Record<string, unknown>
                | undefined;
            return {
                id: this.__str(idEl)!,
                schemeID: this.__attr(idEl, 'schemeID'),
                documentTypeCode: this.__str(r['cbc:DocumentTypeCode']),
                documentDescription: this.__str(r['cbc:DocumentDescription']),
                attachment: attachment
                    ? {
                          embeddedDocumentBinaryObject:
                              binaryObj !== undefined
                                  ? (this.__str(binaryObj) ?? '')
                                  : undefined,
                          mimeCode: this.__attr(binaryObj, 'mimeCode'),
                          filename: this.__attr(binaryObj, 'filename'),
                          externalReference: extRef
                              ? this.__str(extRef['cbc:URI'])
                              : undefined,
                      }
                    : undefined,
            };
        });
    }

    private __parseDelivery(
        delivery: Record<string, unknown> | undefined
    ): Invoice['delivery'] {
        if (!delivery) return undefined;
        const location = delivery['cac:DeliveryLocation'] as
            | Record<string, unknown>
            | undefined;
        const locationAddress = location?.['cac:Address'] as
            | Record<string, unknown>
            | undefined;
        const locationCountry = locationAddress?.['cac:Country'] as
            | Record<string, unknown>
            | undefined;
        const deliveryParty = delivery['cac:DeliveryParty'] as
            | Record<string, unknown>
            | undefined;
        const partyName = deliveryParty?.['cac:PartyName'] as
            | Record<string, unknown>
            | undefined;

        return {
            actualDeliveryDate: this.__str(delivery['cbc:ActualDeliveryDate']),
            deliveryLocation: location
                ? {
                      id:
                          location['cbc:ID'] !== undefined
                              ? (this.__str(location['cbc:ID']) ?? '')
                              : undefined,
                      locationSchemeID: this.__attr(
                          location['cbc:ID'],
                          'schemeID'
                      ),
                      address: locationAddress
                          ? {
                                streetName: this.__str(
                                    locationAddress['cbc:StreetName']
                                ),
                                additionalStreetName: this.__str(
                                    locationAddress['cbc:AdditionalStreetName']
                                ),
                                cityName: this.__str(
                                    locationAddress['cbc:CityName']
                                ),
                                postalZone: this.__str(
                                    locationAddress['cbc:PostalZone']
                                ),
                                countrySubentity: this.__str(
                                    locationAddress['cbc:CountrySubentity']
                                ),
                                addressLine:
                                    this.__parseAddressLine(locationAddress),
                                country: this.__str(
                                    locationCountry?.['cbc:IdentificationCode']
                                ) as z.infer<
                                    typeof en16931PartySchema
                                >['address']['country'],
                            }
                          : undefined,
                  }
                : undefined,
            deliveryPartyName: partyName
                ? this.__str(partyName['cbc:Name'])
                : undefined,
        };
    }

    private __parseAllowanceCharges(
        charges: unknown[] | undefined
    ): Invoice['allowanceCharge'] {
        if (!charges || charges.length === 0) return undefined;
        return charges.map((c) => {
            const ac = c as Record<string, unknown>;
            const amtEl = ac['cbc:Amount'];
            const baseAmtEl = ac['cbc:BaseAmount'];
            const taxCat = (ac['cac:TaxCategory'] ?? {}) as Record<
                string,
                unknown
            >;
            return {
                chargeIndicator: this.__bool(ac['cbc:ChargeIndicator']),
                reasonCode: this.__str(ac['cbc:AllowanceChargeReasonCode']),
                reason: this.__str(ac['cbc:AllowanceChargeReason']),
                multiplierFactorNumeric: this.__num(
                    ac['cbc:MultiplierFactorNumeric']
                ),
                amount: this.__num(amtEl)!,
                currency: (this.__attr(amtEl, 'currencyID') ??
                    '') as CurrencyCode,
                baseAmount: this.__num(baseAmtEl),
                taxCategory: {
                    categoryCode: this.__str(
                        taxCat['cbc:ID']
                    ) as Invoice['taxTotal'][number]['subTotals'][number]['taxCategory']['categoryCode'],
                    percent: this.__num(taxCat['cbc:Percent']),
                },
            };
        });
    }

    private __parsePaymentMeans(
        means: unknown[] | undefined
    ): Invoice['paymentMeans'] {
        if (!means || means.length === 0) return undefined;
        return means.map((m) => {
            const pm = m as Record<string, unknown>;
            const fa = pm['cac:PayeeFinancialAccount'] as
                | Record<string, unknown>
                | undefined;
            const fib = fa?.['cac:FinancialInstitutionBranch'] as
                | Record<string, unknown>
                | undefined;
            const ca = pm['cac:CardAccount'] as
                | Record<string, unknown>
                | undefined;
            const pmand = pm['cac:PaymentMandate'] as
                | Record<string, unknown>
                | undefined;
            const pfa = pmand?.['cac:PayerFinancialAccount'] as
                | Record<string, unknown>
                | undefined;
            return {
                code: this.__str(
                    pm['cbc:PaymentMeansCode']
                ) as Invoice['paymentMeans'] extends (infer U)[] | undefined
                    ? U extends { code: infer C }
                        ? C
                        : never
                    : never,
                name: this.__attr(pm['cbc:PaymentMeansCode'], 'name'),
                paymentDueDate: this.__str(pm['cbc:PaymentDueDate']),
                paymentId: this.__str(pm['cbc:PaymentID']),
                financialAccount: fa
                    ? {
                          id: this.__str(fa['cbc:ID'])!,
                          name: this.__str(fa['cbc:Name']),
                          financialInstitutionBranch: this.__str(
                              fib?.['cbc:ID']
                          ),
                      }
                    : undefined,
                cardAccount: ca
                    ? {
                          primaryAccountNumberId: this.__str(
                              ca['cbc:PrimaryAccountNumberID']
                          )!,
                          networkId: this.__str(ca['cbc:NetworkID'])!,
                          holderName: this.__str(ca['cbc:HolderName']),
                      }
                    : undefined,
                paymentMandate: pmand
                    ? {
                          id: this.__str(pmand['cbc:ID']),
                          payerFinancialAccountId: this.__str(pfa?.['cbc:ID']),
                      }
                    : undefined,
            };
        });
    }

    private __parseTaxTotal(totals: unknown[]): Invoice['taxTotal'] {
        return totals.map((t) => {
            const total = t as Record<string, unknown>;
            const taxAmountEl = total['cbc:TaxAmount'];
            return {
                taxAmount: this.__num(taxAmountEl)!,
                taxAmountCurrency: this.__attr(
                    taxAmountEl,
                    'currencyID'
                ) as Invoice['taxTotal'][number]['taxAmountCurrency'],
                subTotals: (
                    (total['cac:TaxSubtotal'] as unknown[] | undefined) ?? []
                ).map((st) => {
                    const sub = st as Record<string, unknown>;
                    const taxableAmtEl = sub['cbc:TaxableAmount'];
                    const taxAmtEl = sub['cbc:TaxAmount'];
                    const cat = (sub['cac:TaxCategory'] ?? {}) as Record<
                        string,
                        unknown
                    >;
                    return {
                        taxableAmount: this.__num(taxableAmtEl)!,
                        taxableAmountCurrency: this.__attr(
                            taxableAmtEl,
                            'currencyID'
                        ) as Invoice['taxTotal'][number]['subTotals'][number]['taxableAmountCurrency'],
                        taxAmount: this.__num(taxAmtEl)!,
                        taxAmountCurrency: this.__attr(
                            taxAmtEl,
                            'currencyID'
                        ) as Invoice['taxTotal'][number]['subTotals'][number]['taxAmountCurrency'],
                        taxCategory: {
                            categoryCode: this.__str(
                                cat['cbc:ID']
                            ) as Invoice['taxTotal'][number]['subTotals'][number]['taxCategory']['categoryCode'],
                            percent: this.__num(cat['cbc:Percent']),
                            exemptionReason: this.__str(
                                cat['cbc:TaxExemptionReason']
                            ),
                            exemptionReasonCode: this.__str(
                                cat['cbc:TaxExemptionReasonCode']
                            ),
                        },
                    };
                }),
            };
        });
    }

    private __parseMonetaryTotal(
        total: Record<string, unknown>
    ): Invoice['legalMonetaryTotal'] {
        const lineExtEl = total['cbc:LineExtensionAmount'];
        const taxExclEl = total['cbc:TaxExclusiveAmount'];
        const taxInclEl = total['cbc:TaxInclusiveAmount'];
        const payableEl = total['cbc:PayableAmount'];
        const allowanceEl = total['cbc:AllowanceTotalAmount'];
        const chargeEl = total['cbc:ChargeTotalAmount'];
        const prepaidEl = total['cbc:PrepaidAmount'];
        const roundingEl = total['cbc:PayableRoundingAmount'];

        const attrCurrency = (el: unknown): CurrencyCode | undefined =>
            this.__attr(el, 'currencyID') as CurrencyCode | undefined;

        const lineExtensionAmountCurrency = attrCurrency(lineExtEl);
        const taxExclusiveAmountCurrency = attrCurrency(taxExclEl);
        const taxInclusiveAmountCurrency = attrCurrency(taxInclEl);
        const payableAmountCurrency = attrCurrency(payableEl);

        const currency = (lineExtensionAmountCurrency ??
            taxExclusiveAmountCurrency ??
            taxInclusiveAmountCurrency ??
            payableAmountCurrency ??
            '') as CurrencyCode;

        return {
            currency,
            lineExtensionAmount: this.__num(lineExtEl)!,
            lineExtensionAmountCurrency,
            taxExclusiveAmount: this.__num(taxExclEl)!,
            taxExclusiveAmountCurrency,
            taxInclusiveAmount: this.__num(taxInclEl)!,
            taxInclusiveAmountCurrency,
            payableAmount: this.__num(payableEl)!,
            payableAmountCurrency,
            allowanceTotalAmount: this.__num(allowanceEl),
            allowanceTotalAmountCurrency: attrCurrency(allowanceEl),
            chargeTotalAmount: this.__num(chargeEl),
            chargeTotalAmountCurrency: attrCurrency(chargeEl),
            prepaidAmount: this.__num(prepaidEl),
            prepaidAmountCurrency: attrCurrency(prepaidEl),
            payableRoundingAmount: this.__num(roundingEl),
            payableRoundingAmountCurrency: attrCurrency(roundingEl),
        };
    }

    private __parseLineItem(
        line: unknown,
        quantityTag: string
    ): Invoice['invoiceLines'][number] {
        const l = line as Record<string, unknown>;
        const qtyEl = l[`cbc:${quantityTag}`];
        const amtEl = l['cbc:LineExtensionAmount'];
        const item = (l['cac:Item'] ?? {}) as Record<string, unknown>;
        const priceSection = (l['cac:Price'] ?? {}) as Record<string, unknown>;
        const priceEl = priceSection['cbc:PriceAmount'];
        const baseQtyEl = priceSection['cbc:BaseQuantity'];
        // cac:AllowanceCharge is always read as an array (parserOptions); the price has at most one
        const priceAC = getUblChildren(
            priceSection,
            'cac:AllowanceCharge'
        )?.[0] as Record<string, unknown> | undefined;
        const taxCat = (item['cac:ClassifiedTaxCategory'] ?? {}) as Record<
            string,
            unknown
        >;
        const stdIdEl = (
            item['cac:StandardItemIdentification'] as
                | Record<string, unknown>
                | undefined
        )?.['cbc:ID'];
        const commodityClassifications =
            (item['cac:CommodityClassification'] as unknown[] | undefined) ??
            [];
        const additionalProperties =
            (item['cac:AdditionalItemProperty'] as unknown[] | undefined) ?? [];

        // Parse line allowance charges
        const lineACs = l['cac:AllowanceCharge'] as unknown[] | undefined;

        return {
            id: this.__str(l['cbc:ID'])!,
            note: this.__parseNotes(l['cbc:Note']),
            invoicedQuantity: this.__num(qtyEl)!,
            unitCode: this.__attr(
                qtyEl,
                'unitCode'
            ) as Invoice['invoiceLines'][number]['unitCode'],
            lineExtensionAmount: this.__num(amtEl)!,
            currency: this.__attr(
                amtEl,
                'currencyID'
            ) as Invoice['invoiceLines'][number]['currency'],
            accountingCost: this.__str(l['cbc:AccountingCost']),
            invoicePeriod: l['cac:InvoicePeriod']
                ? {
                      startDate: this.__str(
                          (l['cac:InvoicePeriod'] as Record<string, unknown>)[
                              'cbc:StartDate'
                          ]
                      ),
                      endDate: this.__str(
                          (l['cac:InvoicePeriod'] as Record<string, unknown>)[
                              'cbc:EndDate'
                          ]
                      ),
                  }
                : undefined,
            orderLineReference: l['cac:OrderLineReference']
                ? this.__str(
                      (l['cac:OrderLineReference'] as Record<string, unknown>)[
                          'cbc:LineID'
                      ]
                  )
                : undefined,
            documentReference: l['cac:DocumentReference']
                ? {
                      id: this.__str(
                          (
                              l['cac:DocumentReference'] as Record<
                                  string,
                                  unknown
                              >
                          )['cbc:ID']
                      )!,
                      documentTypeCode: this.__str(
                          (
                              l['cac:DocumentReference'] as Record<
                                  string,
                                  unknown
                              >
                          )['cbc:DocumentTypeCode']
                      ),
                  }
                : undefined,
            allowanceCharge:
                lineACs && lineACs.length > 0
                    ? lineACs.map((ac) => {
                          const a = ac as Record<string, unknown>;
                          const acAmtEl = a['cbc:Amount'];
                          const acBaseEl = a['cbc:BaseAmount'];
                          return {
                              chargeIndicator: this.__bool(
                                  a['cbc:ChargeIndicator']
                              ),
                              reasonCode: this.__str(
                                  a['cbc:AllowanceChargeReasonCode']
                              ),
                              reason: this.__str(
                                  a['cbc:AllowanceChargeReason']
                              ),
                              multiplierFactorNumeric: this.__num(
                                  a['cbc:MultiplierFactorNumeric']
                              ),
                              amount: this.__num(acAmtEl)!,
                              currency: (this.__attr(acAmtEl, 'currencyID') ??
                                  '') as CurrencyCode,
                              baseAmount: this.__num(acBaseEl),
                          };
                      })
                    : undefined,
            name: this.__str(item['cbc:Name'])!,
            description: this.__str(item['cbc:Description']),
            buyersItemIdentification: this.__str(
                (
                    item['cac:BuyersItemIdentification'] as
                        | Record<string, unknown>
                        | undefined
                )?.['cbc:ID']
            ),
            sellersItemIdentification: this.__str(
                (
                    item['cac:SellersItemIdentification'] as
                        | Record<string, unknown>
                        | undefined
                )?.['cbc:ID']
            ),
            standardItemIdentification: stdIdEl
                ? {
                      id: this.__str(stdIdEl)!,
                      schemeID: this.__attr(stdIdEl, 'schemeID')!,
                  }
                : undefined,
            originCountry: this.__str(
                (
                    item['cac:OriginCountry'] as
                        | Record<string, unknown>
                        | undefined
                )?.['cbc:IdentificationCode']
            ) as Invoice['invoiceLines'][number]['originCountry'],
            commodityClassification:
                commodityClassifications.length > 0
                    ? commodityClassifications.map((cc) => {
                          const c = cc as Record<string, unknown>;
                          const codeEl = c['cbc:ItemClassificationCode'];
                          return {
                              code: this.__str(codeEl)!,
                              listID: this.__attr(codeEl, 'listID')!,
                              listVersionID: this.__attr(
                                  codeEl,
                                  'listVersionID'
                              ),
                          };
                      })
                    : undefined,
            price: this.__num(priceEl)!,
            taxCategory: {
                categoryCode: this.__str(
                    taxCat['cbc:ID']
                ) as Invoice['invoiceLines'][number]['taxCategory']['categoryCode'],
                percent: this.__num(taxCat['cbc:Percent']),
            },
            additionalItemProperties:
                additionalProperties.length > 0
                    ? additionalProperties.map((prop) => {
                          const p = prop as Record<string, unknown>;
                          return {
                              name: this.__str(p['cbc:Name'])!,
                              value: this.__str(p['cbc:Value'])!,
                          };
                      })
                    : undefined,
            baseQuantity: this.__num(baseQtyEl),
            priceAllowanceCharge: priceAC
                ? {
                      amount: this.__num(priceAC['cbc:Amount'])!,
                      currency: (this.__attr(
                          priceAC['cbc:Amount'],
                          'currencyID'
                      ) ?? '') as CurrencyCode,
                      baseAmount: this.__num(priceAC['cbc:BaseAmount']),
                  }
                : undefined,
        };
    }

    /**
     * Returns the text content of a parsed XML element.
     * Handles both plain values and objects with a '#text' property.
     * Returns undefined for objects without text content (e.g. empty elements
     * with attributes).
     */
    private __text(value: unknown): string | undefined {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'object') {
            const text = (value as Record<string, unknown>)['#text'];
            return text !== undefined && text !== null
                ? String(text)
                : undefined;
        }
        return String(value);
    }

    private __parseNotes(
        notes: unknown
    ): { content: string; languageID?: string }[] | undefined {
        if (notes === undefined) return undefined;
        const notesArray = Array.isArray(notes) ? notes : [notes];
        return notesArray.map((note) => ({
            content: this.__str(note)!,
            languageID: this.__attr(note, 'languageID'),
        }));
    }

    /**
     * Returns the string value of an element, returning undefined for
     * missing, empty, or whitespace-only values.
     */
    private __str(value: unknown): string | undefined {
        const text = this.__text(value);
        if (text === undefined || text.trim() === '') return undefined;
        return text;
    }

    /**
     * Returns the numeric value of an element as an xsd:decimal, returning
     * undefined for missing/empty/whitespace-only values and NaN for invalid
     * numeric syntax (such as hex, binary, or scientific notation).
     */
    private __num(value: unknown): number | undefined {
        const text = this.__str(value)?.trim();
        if (text === undefined || text === '') return undefined;
        if (!DocumentParser.__DECIMAL_PATTERN.test(text)) return Number.NaN;
        return Number(text);
    }

    /**
     * Returns the value of an XML attribute from a parsed element.
     */
    private __attr(value: unknown, attrName: string): string | undefined {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'object') {
            const attr = (value as Record<string, unknown>)[`$${attrName}`];
            return attr !== undefined ? String(attr) : undefined;
        }
        return undefined;
    }

    /**
     * Parses a boolean value from XML (handles both string "true"/"false" and native booleans).
     */
    private __bool(value: unknown): boolean {
        return value === 'true' || value === true;
    }
}
