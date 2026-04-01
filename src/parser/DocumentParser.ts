import { XMLParser } from 'fast-xml-parser';
import { parserOptions } from './parserOptions';
import { Invoice, invoiceSchema } from '../documents/invoices/Invoice';
import { CreditNote, creditNoteSchema } from '../documents/invoices/CreditNote';
import { z } from 'zod';
import { partySchema } from '../documents/common/Parties';

export class DocumentParser {
    private __parser = new XMLParser(parserOptions);

    /***
     * Parses a Peppol UBL Invoice XML string into an Invoice object
     * @param xml The UBL Invoice XML string
     * @returns The parsed Invoice object
     */
    public parseInvoice(xml: string): Invoice {
        const parsed = this.__parser.parse(xml);
        const inv = parsed['Invoice'];
        if (!inv) throw new Error('Not a valid UBL Invoice document');

        const raw = {
            customizationID: this.__str(inv['cbc:CustomizationID']),
            profileID: this.__str(inv['cbc:ProfileID']),
            ID: this.__str(inv['cbc:ID'])!,
            issueDate: this.__str(inv['cbc:IssueDate'])!,
            dueDate: this.__str(inv['cbc:DueDate']),
            invoiceTypeCode: Number(inv['cbc:InvoiceTypeCode']),
            note: this.__str(inv['cbc:Note']),
            taxPointDate: this.__str(inv['cbc:TaxPointDate']),
            documentCurrencyCode: this.__str(inv['cbc:DocumentCurrencyCode'])!,
            taxCurrencyCode: this.__str(inv['cbc:TaxCurrencyCode']),
            accountingCost: this.__str(inv['cbc:AccountingCost']),
            buyerReference: this.__str(inv['cbc:BuyerReference']),
            invoicePeriod: this.__parseInvoicePeriod(inv['cac:InvoicePeriod']),
            orderReference: this.__parseOrderReference(
                inv['cac:OrderReference']
            ),
            billingReference: this.__parseBillingReferences(
                inv['cac:BillingReference']
            ),
            despatchDocumentReference: this.__parseSimpleDocRef(
                inv['cac:DespatchDocumentReference']
            ),
            receiptDocumentReference: this.__parseSimpleDocRef(
                inv['cac:ReceiptDocumentReference']
            ),
            originatorDocumentReference: this.__parseSimpleDocRef(
                inv['cac:OriginatorDocumentReference']
            ),
            contractDocumentReference: this.__parseSimpleDocRef(
                inv['cac:ContractDocumentReference']
            ),
            additionalDocumentReference:
                this.__parseAdditionalDocumentReferences(
                    inv['cac:AdditionalDocumentReference']
                ),
            projectReference: this.__parseSimpleDocRef(
                inv['cac:ProjectReference']
            ),
            seller: this.__parseParty(
                inv['cac:AccountingSupplierParty']?.['cac:Party']
            ),
            buyer: this.__parseParty(
                inv['cac:AccountingCustomerParty']?.['cac:Party']
            ),
            delivery: this.__parseDelivery(inv['cac:Delivery']),
            paymentMeans: this.__parsePaymentMeans(inv['cac:PaymentMeans']),
            paymentTermsNote: inv['cac:PaymentTerms']
                ? this.__str(inv['cac:PaymentTerms']['cbc:Note'])
                : undefined,
            allowanceCharge: this.__parseAllowanceCharges(
                inv['cac:AllowanceCharge']
            ),
            taxTotal: this.__parseTaxTotal(inv['cac:TaxTotal'] ?? []),
            legalMonetaryTotal: this.__parseMonetaryTotal(
                inv['cac:LegalMonetaryTotal']
            ),
            invoiceLines: (inv['cac:InvoiceLine'] ?? []).map((line: unknown) =>
                this.__parseLineItem(line, 'InvoicedQuantity')
            ),
        };

        return invoiceSchema.parse(raw);
    }

    /***
     * Parses a Peppol UBL CreditNote XML string into a CreditNote object
     * @param xml The UBL CreditNote XML string
     * @returns The parsed CreditNote object
     */
    public parseCreditNote(xml: string): CreditNote {
        const parsed = this.__parser.parse(xml);
        const cn = parsed['CreditNote'];
        if (!cn) throw new Error('Not a valid UBL CreditNote document');

        const raw = {
            customizationID: this.__str(cn['cbc:CustomizationID']),
            profileID: this.__str(cn['cbc:ProfileID']),
            ID: this.__str(cn['cbc:ID'])!,
            issueDate: this.__str(cn['cbc:IssueDate'])!,
            creditNoteTypeCode: Number(cn['cbc:CreditNoteTypeCode']),
            note: this.__str(cn['cbc:Note']),
            taxPointDate: this.__str(cn['cbc:TaxPointDate']),
            documentCurrencyCode: this.__str(cn['cbc:DocumentCurrencyCode'])!,
            taxCurrencyCode: this.__str(cn['cbc:TaxCurrencyCode']),
            accountingCost: this.__str(cn['cbc:AccountingCost']),
            buyerReference: this.__str(cn['cbc:BuyerReference']),
            invoicePeriod: this.__parseInvoicePeriod(cn['cac:InvoicePeriod']),
            orderReference: this.__parseOrderReference(
                cn['cac:OrderReference']
            ),
            billingReference: this.__parseBillingReferences(
                cn['cac:BillingReference']
            ),
            despatchDocumentReference: this.__parseSimpleDocRef(
                cn['cac:DespatchDocumentReference']
            ),
            receiptDocumentReference: this.__parseSimpleDocRef(
                cn['cac:ReceiptDocumentReference']
            ),
            originatorDocumentReference: this.__parseSimpleDocRef(
                cn['cac:OriginatorDocumentReference']
            ),
            contractDocumentReference: this.__parseSimpleDocRef(
                cn['cac:ContractDocumentReference']
            ),
            additionalDocumentReference:
                this.__parseAdditionalDocumentReferences(
                    cn['cac:AdditionalDocumentReference']
                ),
            seller: this.__parseParty(
                cn['cac:AccountingSupplierParty']?.['cac:Party']
            ),
            buyer: this.__parseParty(
                cn['cac:AccountingCustomerParty']?.['cac:Party']
            ),
            delivery: this.__parseDelivery(cn['cac:Delivery']),
            paymentMeans: this.__parsePaymentMeans(cn['cac:PaymentMeans']),
            paymentTermsNote: cn['cac:PaymentTerms']
                ? this.__str(cn['cac:PaymentTerms']['cbc:Note'])
                : undefined,
            allowanceCharge: this.__parseAllowanceCharges(
                cn['cac:AllowanceCharge']
            ),
            taxTotal: this.__parseTaxTotal(cn['cac:TaxTotal'] ?? []),
            legalMonetaryTotal: this.__parseMonetaryTotal(
                cn['cac:LegalMonetaryTotal']
            ),
            creditNoteLines: (cn['cac:CreditNoteLine'] ?? []).map(
                (line: unknown) =>
                    this.__parseLineItem(line, 'CreditedQuantity')
            ),
        };

        return creditNoteSchema.parse(raw);
    }

    private __parseParty(party: Record<string, unknown>): z.infer<typeof partySchema> {
        if (!party) throw new Error('Missing party in UBL document');

        const endpointEl = party['cbc:EndpointID'];
        const identifications = (
            (party['cac:PartyIdentification'] as unknown[] | undefined) ?? []
        ).map((pi) => {
            const idEl = (pi as Record<string, unknown>)['cbc:ID'];
            return {
                id: this.__text(idEl)!,
                scheme: this.__attr(idEl, 'schemeID'),
            } as { id: string; scheme?: z.infer<typeof partySchema>['endPoint']['scheme'] };
        });

        const postal =
            (party['cac:PostalAddress'] as Record<string, unknown>) ?? {};
        const legalEntity =
            (party['cac:PartyLegalEntity'] as Record<string, unknown>) ?? {};
        const taxScheme = party['cac:PartyTaxScheme'] as
            | Record<string, unknown>
            | undefined;
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
            endPoint: {
                scheme: this.__attr(endpointEl, 'schemeID') as z.infer<
                    typeof partySchema
                >['endPoint']['scheme'],
                id: this.__text(endpointEl)!,
            },
            identification:
                identifications.length > 0 ? identifications : undefined,
            name: partyNameEl
                ? this.__str(partyNameEl['cbc:Name'])
                : undefined,
            address: {
                streetName: this.__str(postal['cbc:StreetName']),
                additionalStreetName: this.__str(
                    postal['cbc:AdditionalStreetName']
                ),
                cityName: this.__str(postal['cbc:CityName']),
                postalZone: this.__str(postal['cbc:PostalZone']),
                countrySubentity: this.__str(postal['cbc:CountrySubentity']),
                addressLine: this.__str(postal['cbc:AddressLine']),
                country: this.__str(
                    country?.['cbc:IdentificationCode']
                ) as z.infer<typeof partySchema>['address']['country'],
            },
            taxSchemeCompanyID: taxScheme
                ? this.__str(taxScheme['cbc:CompanyID'])
                : undefined,
            legalEntity: {
                registrationName: this.__str(
                    legalEntity['cbc:RegistrationName']
                )!,
                companyId: this.__str(legalEntity['cbc:CompanyID']),
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
                id: this.__text(idEl)!,
                schemeID: this.__attr(idEl, 'schemeID'),
                documentTypeCode: this.__str(r['cbc:DocumentTypeCode']),
                documentDescription: this.__str(r['cbc:DocumentDescription']),
                attachment: attachment
                    ? {
                          embeddedDocumentBinaryObject:
                              this.__text(binaryObj),
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
            actualDeliveryDate: this.__str(
                delivery['cbc:ActualDeliveryDate']
            ),
            deliveryLocation: location
                ? {
                      id: this.__text(location['cbc:ID']),
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
                                    locationAddress[
                                        'cbc:AdditionalStreetName'
                                    ]
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
                                country: this.__str(
                                    locationCountry?.[
                                        'cbc:IdentificationCode'
                                    ]
                                ) as z.infer<
                                    typeof partySchema
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
                chargeIndicator: ac['cbc:ChargeIndicator'] === 'true' || ac['cbc:ChargeIndicator'] === true,
                reasonCode: this.__str(
                    ac['cbc:AllowanceChargeReasonCode']
                ),
                reason: this.__str(ac['cbc:AllowanceChargeReason']),
                multiplierFactorNumeric:
                    ac['cbc:MultiplierFactorNumeric'] !== undefined
                        ? Number(ac['cbc:MultiplierFactorNumeric'])
                        : undefined,
                amount: Number(this.__text(amtEl)),
                currency: this.__attr(
                    amtEl,
                    'currencyID'
                ) as Invoice['allowanceCharge'] extends (infer U)[]
                    ? U extends { currency?: infer C }
                        ? C
                        : never
                    : never,
                baseAmount:
                    baseAmtEl !== undefined
                        ? Number(this.__text(baseAmtEl))
                        : undefined,
                taxCategory: {
                    categoryCode: this.__str(
                        taxCat['cbc:ID']
                    ) as Invoice['taxTotal'][number]['subTotals'][number]['taxCategory']['categoryCode'],
                    percent:
                        taxCat['cbc:Percent'] !== undefined
                            ? Number(taxCat['cbc:Percent'])
                            : undefined,
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
            };
        });
    }

    private __parseTaxTotal(totals: unknown[]): Invoice['taxTotal'] {
        return totals.map((t) => {
            const total = t as Record<string, unknown>;
            const taxAmountEl = total['cbc:TaxAmount'];
            return {
                taxAmount: Number(this.__text(taxAmountEl)),
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
                    const cat = (sub['cac:TaxCategory'] ??
                        {}) as Record<string, unknown>;
                    return {
                        taxableAmount: Number(this.__text(taxableAmtEl)),
                        taxableAmountCurrency: this.__attr(
                            taxableAmtEl,
                            'currencyID'
                        ) as Invoice['taxTotal'][number]['subTotals'][number]['taxableAmountCurrency'],
                        taxAmount: Number(this.__text(taxAmtEl)),
                        taxAmountCurrency: this.__attr(
                            taxAmtEl,
                            'currencyID'
                        ) as Invoice['taxTotal'][number]['subTotals'][number]['taxAmountCurrency'],
                        taxCategory: {
                            categoryCode: this.__str(
                                cat['cbc:ID']
                            ) as Invoice['taxTotal'][number]['subTotals'][number]['taxCategory']['categoryCode'],
                            percent:
                                cat['cbc:Percent'] !== undefined
                                    ? Number(cat['cbc:Percent'])
                                    : undefined,
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
        const get = (name: string): number | undefined => {
            const el = total[`cbc:${name}`];
            return el !== undefined ? Number(this.__text(el)) : undefined;
        };

        const getCurrency = (
            name: string
        ): Invoice['legalMonetaryTotal']['currency'] | undefined => {
            const el = total[`cbc:${name}`];
            return el !== undefined
                ? (this.__attr(el, 'currencyID') as Invoice['legalMonetaryTotal']['currency'])
                : undefined;
        };

        const lineExtEl = total['cbc:LineExtensionAmount'];
        const taxExclEl = total['cbc:TaxExclusiveAmount'];
        const taxInclEl = total['cbc:TaxInclusiveAmount'];
        const payableEl = total['cbc:PayableAmount'];

        const currency = (this.__attr(lineExtEl, 'currencyID') ??
            this.__attr(taxExclEl, 'currencyID') ??
            this.__attr(taxInclEl, 'currencyID') ??
            this.__attr(payableEl, 'currencyID') ??
            '') as Invoice['legalMonetaryTotal']['currency'];

        return {
            currency,
            lineExtensionAmount: Number(this.__text(lineExtEl) ?? 0),
            lineExtensionAmountCurrency: getCurrency('LineExtensionAmount'),
            taxExclusiveAmount: get('TaxExclusiveAmount')!,
            taxExclusiveAmountCurrency: getCurrency('TaxExclusiveAmount'),
            taxInclusiveAmount: get('TaxInclusiveAmount')!,
            taxInclusiveAmountCurrency: getCurrency('TaxInclusiveAmount'),
            payableAmount: get('PayableAmount')!,
            payableAmountCurrency: getCurrency('PayableAmount'),
            allowanceTotalAmount: get('AllowanceTotalAmount'),
            allowanceTotalAmountCurrency: getCurrency('AllowanceTotalAmount'),
            chargeTotalAmount: get('ChargeTotalAmount'),
            chargeTotalAmountCurrency: getCurrency('ChargeTotalAmount'),
            prepaidAmount: get('PrepaidAmount'),
            prepaidAmountCurrency: getCurrency('PrepaidAmount'),
            payableRoundingAmount: get('PayableRoundingAmount'),
            payableRoundingAmountCurrency: getCurrency(
                'PayableRoundingAmount'
            ),
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
        const priceSection = (l['cac:Price'] ?? {}) as Record<
            string,
            unknown
        >;
        const priceEl = priceSection['cbc:PriceAmount'];
        const baseQtyEl = priceSection['cbc:BaseQuantity'];
        const priceAC = priceSection['cac:AllowanceCharge'] as
            | Record<string, unknown>
            | undefined;
        const taxCat = (item['cac:ClassifiedTaxCategory'] ??
            {}) as Record<string, unknown>;
        const stdIdEl = (item['cac:StandardItemIdentification'] as Record<string, unknown> | undefined)?.['cbc:ID'];
        const commodityClassifications = (item['cac:CommodityClassification'] as unknown[] | undefined) ?? [];
        const additionalProperties = (item['cac:AdditionalItemProperty'] as unknown[] | undefined) ?? [];

        // Parse line allowance charges
        const lineACs = l['cac:AllowanceCharge'] as unknown[] | undefined;

        return {
            id: this.__str(l['cbc:ID'])!,
            note: this.__str(l['cbc:Note']),
            invoicedQuantity: Number(this.__text(qtyEl)),
            unitCode: this.__attr(
                qtyEl,
                'unitCode'
            ) as Invoice['invoiceLines'][number]['unitCode'],
            lineExtensionAmount: Number(this.__text(amtEl)),
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
                      (
                          l['cac:OrderLineReference'] as Record<
                              string,
                              unknown
                          >
                      )['cbc:LineID']
                  )
                : undefined,
            documentReference: l['cac:DocumentReference']
                ? this.__str(
                      (
                          l['cac:DocumentReference'] as Record<
                              string,
                              unknown
                          >
                      )['cbc:ID']
                  )
                : undefined,
            allowanceCharge:
                lineACs && lineACs.length > 0
                    ? lineACs.map((ac) => {
                          const a = ac as Record<string, unknown>;
                          const acAmtEl = a['cbc:Amount'];
                          const acBaseEl = a['cbc:BaseAmount'];
                          return {
                              chargeIndicator:
                                  a['cbc:ChargeIndicator'] === 'true' || a['cbc:ChargeIndicator'] === true,
                              reasonCode: this.__str(
                                  a['cbc:AllowanceChargeReasonCode']
                              ),
                              reason: this.__str(
                                  a['cbc:AllowanceChargeReason']
                              ),
                              multiplierFactorNumeric:
                                  a['cbc:MultiplierFactorNumeric'] !== undefined
                                      ? Number(
                                            a['cbc:MultiplierFactorNumeric']
                                        )
                                      : undefined,
                              amount: Number(this.__text(acAmtEl)),
                              currency: this.__attr(acAmtEl, 'currencyID'),
                              baseAmount:
                                  acBaseEl !== undefined
                                      ? Number(this.__text(acBaseEl))
                                      : undefined,
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
                      id: this.__text(stdIdEl)!,
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
                              code: this.__text(codeEl)!,
                              listID: this.__attr(codeEl, 'listID')!,
                              listVersionID: this.__attr(
                                  codeEl,
                                  'listVersionID'
                              ),
                          };
                      })
                    : undefined,
            price: Number(this.__text(priceEl)),
            taxCategory: {
                categoryCode: this.__str(
                    taxCat['cbc:ID']
                ) as Invoice['invoiceLines'][number]['taxCategory']['categoryCode'],
                percent:
                    taxCat['cbc:Percent'] !== undefined
                        ? Number(taxCat['cbc:Percent'])
                        : undefined,
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
            baseQuantity:
                baseQtyEl !== undefined
                    ? Number(this.__text(baseQtyEl))
                    : undefined,
            priceAllowanceCharge: priceAC
                ? {
                      amount: Number(this.__text(priceAC['cbc:Amount'])),
                      currency: this.__attr(
                          priceAC['cbc:Amount'],
                          'currencyID'
                      ) as Invoice['invoiceLines'][number]['currency'],
                      baseAmount:
                          priceAC['cbc:BaseAmount'] !== undefined
                              ? Number(
                                    this.__text(priceAC['cbc:BaseAmount'])
                                )
                              : undefined,
                  }
                : undefined,
        };
    }

    /**
     * Returns the text content of a parsed XML element.
     * Handles both plain values and objects with a '#text' property.
     */
    private __text(value: unknown): string | undefined {
        if (value === undefined || value === null) return undefined;
        if (
            typeof value === 'object' &&
            '#text' in (value as Record<string, unknown>)
        ) {
            return String((value as Record<string, unknown>)['#text']);
        }
        return String(value);
    }

    /**
     * Returns the string value of an element, returning undefined for
     * missing or empty values.
     */
    private __str(value: unknown): string | undefined {
        const text = this.__text(value);
        if (text === undefined || text === '') return undefined;
        return text;
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
