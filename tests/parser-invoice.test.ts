import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';
import { fullInvoice } from './fixtures/full-documents';
import { expectZodPath } from './helpers/expectZodPath';

describe('Invoice Parser', () => {
    let toolkit: PeppolToolkit;

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should parse a generated invoice back into an Invoice object', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed).toBeDefined();
        expect(parsed.ID).toBe(basicInvoice.ID);
    });

    it('should preserve the invoice ID', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.ID).toBe('TEST-003');
    });

    it('should preserve the issue date', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.issueDate).toBe('2024-01-01');
    });

    it('should preserve the due date', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.dueDate).toBe('2024-01-31');
    });

    it('should preserve the invoice type code', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.invoiceTypeCode).toBe(380);
    });

    it('should preserve the document currency code', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.documentCurrencyCode).toBe('EUR');
    });

    it('should preserve the buyer reference', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.buyerReference).toBe(basicInvoice.buyerReference);
    });

    it('should include the default customization and profile IDs', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.customizationID).toBe(
            'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0'
        );
        expect(parsed.profileID).toBe(
            'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
        );
    });

    it('should preserve seller information', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.seller.endPoint.id).toBe(basicInvoice.seller.endPoint.id);
        expect(parsed.seller.endPoint.scheme).toBe(
            basicInvoice.seller.endPoint.scheme
        );
        expect(parsed.seller.legalEntity.registrationName).toBe(
            basicInvoice.seller.legalEntity.registrationName
        );
        expect(parsed.seller.address.country).toBe(
            basicInvoice.seller.address.country
        );
    });

    it('should preserve buyer information', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.buyer.endPoint.id).toBe(basicInvoice.buyer.endPoint.id);
        expect(parsed.buyer.legalEntity.registrationName).toBe(
            basicInvoice.buyer.legalEntity.registrationName
        );
        expect(parsed.buyer.legalEntity.legalForm).toBe(
            basicInvoice.buyer.legalEntity.legalForm
        );
    });

    it('should preserve payment means', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.paymentMeans).toBeDefined();
        expect(parsed.paymentMeans![0].code).toBe('30');
        expect(parsed.paymentMeans![0].financialAccount?.id).toBe(
            basicInvoice.paymentMeans![0].financialAccount!.id
        );
    });

    it('should preserve payment terms note', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.paymentTermsNote).toBe(basicInvoice.paymentTermsNote);
    });

    it('should preserve tax total', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.taxTotal[0].taxAmount).toBe(21);
        expect(parsed.taxTotal[0].taxAmountCurrency).toBe('EUR');
        expect(parsed.taxTotal[0].subTotals[0].taxCategory.categoryCode).toBe(
            'S'
        );
        expect(parsed.taxTotal[0].subTotals[0].taxCategory.percent).toBe(21);
    });

    it('should preserve legal monetary total', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.legalMonetaryTotal.lineExtensionAmount).toBe(100);
        expect(parsed.legalMonetaryTotal.taxExclusiveAmount).toBe(100);
        expect(parsed.legalMonetaryTotal.taxInclusiveAmount).toBe(121);
        expect(parsed.legalMonetaryTotal.payableAmount).toBe(121);
    });

    it('should preserve invoice lines', () => {
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.invoiceLines).toHaveLength(1);
        expect(parsed.invoiceLines[0].id).toBe('1');
        expect(parsed.invoiceLines[0].name).toBe('Petit poney');
        expect(parsed.invoiceLines[0].invoicedQuantity).toBe(1);
        expect(parsed.invoiceLines[0].lineExtensionAmount).toBe(100);
        expect(parsed.invoiceLines[0].price).toBe(100);
        expect(parsed.invoiceLines[0].currency).toBe('EUR');
        expect(parsed.invoiceLines[0].unitCode).toBe('H67');
        expect(parsed.invoiceLines[0].taxCategory.categoryCode).toBe('S');
        expect(parsed.invoiceLines[0].taxCategory.percent).toBe(21);
    });

    it('should produce identical XML on a round-trip (build → parse → build)', () => {
        const xml1 = toolkit.invoiceToPeppolUBL(basicInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml1);
        const xml2 = toolkit.invoiceToPeppolUBL(parsed);
        expect(xml2).toBe(xml1);
    });

    it('should throw an error for non-Invoice XML', () => {
        expect(() =>
            toolkit.peppolUBLToInvoice('<CreditNote></CreditNote>')
        ).toThrow('Not a valid UBL Invoice document');
    });

    it('should work with a different invoice type code', () => {
        const xml = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceTypeCode: 383,
        });
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.invoiceTypeCode).toBe(383);
    });

    it('should work without an optional due date', () => {
        const invoice = { ...basicInvoice };
        delete (invoice as Partial<typeof basicInvoice>).dueDate;
        const xml = toolkit.invoiceToPeppolUBL(invoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.dueDate).toBeUndefined();
    });

    it('should still parse received documents whose amounts have more than two decimals', () => {
        // Amount precision is only enforced when building documents, never when parsing them
        const xml = toolkit
            .invoiceToPeppolUBL(basicInvoice)
            .split('<cbc:TaxAmount currencyID="EUR">21.00</cbc:TaxAmount>')
            .join('<cbc:TaxAmount currencyID="EUR">21.005</cbc:TaxAmount>');
        expect(xml).toContain('21.005');
        const parsed = toolkit.peppolUBLToInvoice(xml);
        expect(parsed.taxTotal[0].taxAmount).toBe(21.005);
        expect(parsed.taxTotal[0].subTotals[0].taxAmount).toBe(21.005);
    });

    it('should read back every supported element', () => {
        const xml = toolkit.invoiceToPeppolUBL(fullInvoice);
        const parsed = toolkit.peppolUBLToInvoice(xml);

        // Building the parsed invoice again gives the same document
        expect(toolkit.invoiceToPeppolUBL(parsed)).toBe(xml);
        expect(parsed.invoiceLines[0].priceAllowanceCharge).toEqual(
            fullInvoice.invoiceLines[0].priceAllowanceCharge
        );
        expect(toolkit.en16931UBLToInvoice(xml)).toEqual(parsed);
    });

    describe('empty, missing, invalid numeric, and repeated XML elements (#31)', () => {
        it('should consistently reject empty elements with or without attributes', () => {
            const baseXml = toolkit.invoiceToPeppolUBL(basicInvoice);

            const emptyEndpoint = baseXml.replace(
                '<cbc:EndpointID schemeID="9925">0732788874</cbc:EndpointID>',
                '<cbc:EndpointID schemeID="9925"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyEndpoint),
                ['seller', 'endPoint', 'id']
            );

            const emptyPartyIdWithAttr = baseXml.replace(
                '<cbc:ID>BE0732788874</cbc:ID>',
                '<cbc:ID schemeID="0088"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyPartyIdWithAttr),
                ['seller', 'identification', 0, 'id']
            );

            const emptyPartyId = baseXml.replace(
                '<cbc:ID>BE0732788874</cbc:ID>',
                '<cbc:ID/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyPartyId),
                ['seller', 'identification', 0, 'id']
            );

            const emptyCompanyIdWithAttr = baseXml.replace(
                '<cbc:CompanyID>0732788874</cbc:CompanyID>',
                '<cbc:CompanyID schemeID="0208"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyCompanyIdWithAttr),
                ['seller', 'legalEntity', 'companyId', 'id']
            );

            const emptyCompanyId = baseXml.replace(
                '<cbc:CompanyID>0732788874</cbc:CompanyID>',
                '<cbc:CompanyID/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyCompanyId),
                ['seller', 'legalEntity', 'companyId', 'id']
            );

            const fullXml = toolkit.invoiceToPeppolUBL(fullInvoice);

            const emptyBinaryWithAttr = fullXml.replace(
                '<cbc:EmbeddedDocumentBinaryObject mimeCode="application/pdf" filename="timesheet.pdf">aGVsbG8gd29ybGQ=</cbc:EmbeddedDocumentBinaryObject>',
                '<cbc:EmbeddedDocumentBinaryObject mimeCode="application/pdf" filename="timesheet.pdf"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyBinaryWithAttr),
                [
                    'additionalDocumentReference',
                    0,
                    'attachment',
                    'embeddedDocumentBinaryObject',
                ]
            );

            const emptyBinary = fullXml.replace(
                '<cbc:EmbeddedDocumentBinaryObject mimeCode="application/pdf" filename="timesheet.pdf">aGVsbG8gd29ybGQ=</cbc:EmbeddedDocumentBinaryObject>',
                '<cbc:EmbeddedDocumentBinaryObject/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyBinary),
                [
                    'additionalDocumentReference',
                    0,
                    'attachment',
                    'embeddedDocumentBinaryObject',
                ]
            );

            const emptyDeliveryLocationId = fullXml.replace(
                '<cbc:ID schemeID="0088">5790000435975</cbc:ID>',
                '<cbc:ID schemeID="0088"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyDeliveryLocationId),
                ['delivery', 'deliveryLocation', 'id']
            );
        });

        it('should reject empty cbc:Note consistently whether alone, attributed, or repeated', () => {
            const noteXml = toolkit.invoiceToPeppolUBL({
                ...basicInvoice,
                note: [{ content: 'Note', languageID: 'en' }],
            });

            const emptyAlone = noteXml.replace(
                '<cbc:Note languageID="en">Note</cbc:Note>',
                '<cbc:Note/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyAlone),
                ['note', 0, 'content']
            );

            const emptyWithLang = noteXml.replace(
                '<cbc:Note languageID="en">Note</cbc:Note>',
                '<cbc:Note languageID="en"/>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyWithLang),
                ['note', 0, 'content']
            );

            const emptyWithSibling = noteXml.replace(
                '<cbc:Note languageID="en">Note</cbc:Note>',
                '<cbc:Note/><cbc:Note>Valid note</cbc:Note>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(emptyWithSibling),
                ['note', 0, 'content']
            );
        });

        it('should reject duplicate non-repeatable elements (required, optional, and aggregate)', () => {
            const fullXml = toolkit.invoiceToPeppolUBL(fullInvoice);

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:ID>INV-2026-042</cbc:ID>',
                        '<cbc:ID>INV-2026-042</cbc:ID><cbc:ID>INV-2026-043</cbc:ID>'
                    )
                )
            ).toThrow('Duplicate element "cbc:ID" in "Invoice"');

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:BuyerReference>PO-4521</cbc:BuyerReference>',
                        '<cbc:BuyerReference>PO-1</cbc:BuyerReference><cbc:BuyerReference>PO-2</cbc:BuyerReference>'
                    )
                )
            ).toThrow('Duplicate element "cbc:BuyerReference" in "Invoice"');

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:DueDate>2026-03-31</cbc:DueDate>',
                        '<cbc:DueDate>2026-03-31</cbc:DueDate><cbc:DueDate>2026-04-30</cbc:DueDate>'
                    )
                )
            ).toThrow('Duplicate element "cbc:DueDate" in "Invoice"');

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:Percent>21</cbc:Percent>',
                        '<cbc:Percent>21</cbc:Percent><cbc:Percent>6</cbc:Percent>'
                    )
                )
            ).toThrow('Duplicate element "cbc:Percent" in "cac:TaxCategory"');

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:PrepaidAmount currencyID="EUR">100.00</cbc:PrepaidAmount>',
                        '<cbc:PrepaidAmount currencyID="EUR">50.00</cbc:PrepaidAmount><cbc:PrepaidAmount currencyID="EUR">50.00</cbc:PrepaidAmount>'
                    )
                )
            ).toThrow(
                'Duplicate element "cbc:PrepaidAmount" in "cac:LegalMonetaryTotal"'
            );

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:MultiplierFactorNumeric>10</cbc:MultiplierFactorNumeric>',
                        '<cbc:MultiplierFactorNumeric>10</cbc:MultiplierFactorNumeric><cbc:MultiplierFactorNumeric>5</cbc:MultiplierFactorNumeric>'
                    )
                )
            ).toThrow(
                'Duplicate element "cbc:MultiplierFactorNumeric" in "cac:AllowanceCharge"'
            );

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cac:AddressLine>',
                        '<cac:AddressLine><cbc:Line>Building A</cbc:Line></cac:AddressLine><cac:AddressLine>'
                    )
                )
            ).toThrow(
                'Duplicate element "cac:AddressLine" in "cac:PostalAddress"'
            );

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cac:Contact>',
                        '<cac:Contact><cbc:Name>Other</cbc:Name></cac:Contact><cac:Contact>'
                    )
                )
            ).toThrow('Duplicate element "cac:Contact" in "cac:Party"');

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cbc:Note>Payment within 30 days</cbc:Note>',
                        '<cbc:Note>Term 1</cbc:Note><cbc:Note>Term 2</cbc:Note>'
                    )
                )
            ).toThrow('Duplicate element "cbc:Note" in "cac:PaymentTerms"');

            expect(() =>
                toolkit.peppolUBLToInvoice(
                    fullXml.replace(
                        '<cac:AllowanceCharge>\n        <cbc:ChargeIndicator>false</cbc:ChargeIndicator>\n        <cbc:Amount currencyID="EUR">10.5882</cbc:Amount>',
                        '<cac:AllowanceCharge><cbc:ChargeIndicator>false</cbc:ChargeIndicator><cbc:Amount currencyID="EUR">1.00</cbc:Amount></cac:AllowanceCharge><cac:AllowanceCharge>\n        <cbc:ChargeIndicator>false</cbc:ChargeIndicator>\n        <cbc:Amount currencyID="EUR">10.5882</cbc:Amount>'
                    )
                )
            ).toThrow('Duplicate element "cac:AllowanceCharge" in "cac:Price"');
        });

        it('should reject missing LineExtensionAmount in LegalMonetaryTotal instead of defaulting to 0', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(basicInvoice)
                .replace(
                    /<cbc:LineExtensionAmount currencyID="EUR">100\.00<\/cbc:LineExtensionAmount>\s*<cbc:TaxExclusiveAmount/,
                    '<cbc:TaxExclusiveAmount'
                );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(xml),
                ['legalMonetaryTotal', 'lineExtensionAmount']
            );
        });

        it('should parse empty or whitespace-only optional numeric elements as undefined instead of 0', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(fullInvoice)
                .replace(
                    /<cbc:Percent>21<\/cbc:Percent>/g,
                    '<cbc:Percent><![CDATA[ ]]></cbc:Percent>'
                )
                .replace(
                    '<cbc:MultiplierFactorNumeric>10</cbc:MultiplierFactorNumeric>',
                    '<cbc:MultiplierFactorNumeric/>'
                )
                .replace(
                    '<cbc:MultiplierFactorNumeric>5</cbc:MultiplierFactorNumeric>',
                    '<cbc:MultiplierFactorNumeric><![CDATA[   ]]></cbc:MultiplierFactorNumeric>'
                );
            const parsed = toolkit.peppolUBLToInvoice(xml);

            expect(
                parsed.taxTotal[0].subTotals[0].taxCategory.percent
            ).toBeUndefined();
            expect(parsed.taxTotal[0].subTotals[1].taxCategory.percent).toBe(0);
            expect(parsed.invoiceLines[0].taxCategory.percent).toBeUndefined();
            expect(
                parsed.allowanceCharge?.[0].taxCategory.percent
            ).toBeUndefined();
            expect(
                parsed.allowanceCharge?.[0].multiplierFactorNumeric
            ).toBeUndefined();
            expect(
                parsed.invoiceLines[0].allowanceCharge?.[0]
                    .multiplierFactorNumeric
            ).toBeUndefined();
        });

        it.each(['0x10', '0b11', '0o10', '1e3', 'Infinity'])(
            'should reject non-decimal numeric syntax "%s"',
            (badNumber) => {
                const baseXml = toolkit.invoiceToPeppolUBL(basicInvoice);

                const badPercent = baseXml.replace(
                    '<cbc:Percent>21</cbc:Percent>',
                    `<cbc:Percent>${badNumber}</cbc:Percent>`
                );
                expectZodPath(
                    () => toolkit.peppolUBLToInvoice(badPercent),
                    ['taxTotal', 0, 'subTotals', 0, 'taxCategory', 'percent']
                );

                const badAmount = baseXml.replace(
                    '<cbc:PayableAmount currencyID="EUR">121.00</cbc:PayableAmount>',
                    `<cbc:PayableAmount currencyID="EUR">${badNumber}</cbc:PayableAmount>`
                );
                expectZodPath(
                    () => toolkit.peppolUBLToInvoice(badAmount),
                    ['legalMonetaryTotal', 'payableAmount']
                );
            }
        );

        it('should parse numeric elements that carry XML attributes', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(basicInvoice)
                .replace(
                    '<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>',
                    '<cbc:InvoiceTypeCode listID="UNCL1001">380</cbc:InvoiceTypeCode>'
                );
            expect(toolkit.peppolUBLToInvoice(xml).invoiceTypeCode).toBe(380);
        });

        it('should reject missing or invalid currencyID on allowanceCharge with full Zod error paths', () => {
            const xml = toolkit.invoiceToPeppolUBL(fullInvoice);

            const missingLineCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.00</cbc:Amount>\n      <cbc:BaseAmount currencyID="EUR">200.00</cbc:BaseAmount>',
                '<cbc:Amount>10.00</cbc:Amount>\n      <cbc:BaseAmount currencyID="EUR">200.00</cbc:BaseAmount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(missingLineCurrency),
                ['invoiceLines', 0, 'allowanceCharge', 0, 'currency']
            );

            const invalidLineCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.00</cbc:Amount>\n      <cbc:BaseAmount currencyID="EUR">200.00</cbc:BaseAmount>',
                '<cbc:Amount currencyID="INVALID">10.00</cbc:Amount>\n      <cbc:BaseAmount currencyID="EUR">200.00</cbc:BaseAmount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(invalidLineCurrency),
                ['invoiceLines', 0, 'allowanceCharge', 0, 'currency']
            );

            const missingDocCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">20.00</cbc:Amount>',
                '<cbc:Amount>20.00</cbc:Amount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(missingDocCurrency),
                ['allowanceCharge', 0, 'currency']
            );

            const missingPriceAcCurrency = xml.replace(
                '<cbc:Amount currencyID="EUR">10.5882</cbc:Amount>',
                '<cbc:Amount>10.5882</cbc:Amount>'
            );
            expectZodPath(
                () => toolkit.peppolUBLToInvoice(missingPriceAcCurrency),
                ['invoiceLines', 0, 'priceAllowanceCharge', 'currency']
            );
        });

        it('should allow cac:PayeeParty with both a payee identifier and a SEPA creditor identifier (UBL-SR-20)', () => {
            const xml = toolkit
                .invoiceToPeppolUBL(fullInvoice)
                .replace(
                    '<cac:PartyIdentification>\n      <cbc:ID schemeID="SEPA">BE12ZZZ0000000001</cbc:ID>\n    </cac:PartyIdentification>',
                    '<cac:PartyIdentification>\n      <cbc:ID schemeID="0088">5790000435968</cbc:ID>\n    </cac:PartyIdentification>\n    <cac:PartyIdentification>\n      <cbc:ID schemeID="SEPA">BE12ZZZ0000000001</cbc:ID>\n    </cac:PartyIdentification>'
                );
            const parsed = toolkit.peppolUBLToInvoice(xml);

            expect(parsed.payeeParty?.identification).toEqual({
                id: '5790000435968',
                schemeID: '0088',
            });
        });

        it('should serialize small multiplierFactorNumeric in fixed-point notation and round-trip cleanly', () => {
            const xml = toolkit.invoiceToPeppolUBL({
                ...fullInvoice,
                allowanceCharge: [
                    {
                        ...fullInvoice.allowanceCharge![0],
                        multiplierFactorNumeric: 1e-7,
                    },
                ],
                invoiceLines: [
                    {
                        ...fullInvoice.invoiceLines[0],
                        allowanceCharge: [
                            {
                                ...fullInvoice.invoiceLines[0]
                                    .allowanceCharge![0],
                                multiplierFactorNumeric: 1e-7,
                            },
                        ],
                    },
                    ...fullInvoice.invoiceLines.slice(1),
                ],
            });

            expect(xml).not.toContain('1e-7');
            expect(
                xml.match(
                    /<cbc:MultiplierFactorNumeric>0\.0000001<\/cbc:MultiplierFactorNumeric>/g
                )
            ).toHaveLength(2);

            const parsed = toolkit.peppolUBLToInvoice(xml);
            expect(parsed.allowanceCharge?.[0].multiplierFactorNumeric).toBe(
                1e-7
            );
            expect(
                parsed.invoiceLines[0].allowanceCharge?.[0]
                    .multiplierFactorNumeric
            ).toBe(1e-7);
        });
    });
});
