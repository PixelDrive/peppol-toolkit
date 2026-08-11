import { beforeEach, describe, expect, it } from 'vitest';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';
import { comprehensiveInvoice } from './fixtures/comprehensive-invoice';

describe('Invoices Builder', () => {
    let toolkit = new PeppolToolkit();

    beforeEach(() => {
        toolkit = new PeppolToolkit();
    });

    it('should generate a non empty string', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(basicInvoice);
        expect(invoiceXML.length).toBeGreaterThan(0);
    });

    it('should return <Invoice> as indicator', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(basicInvoice);
        expect(invoiceXML).toContain('<Invoice');
        expect(invoiceXML).toContain(
            'xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"'
        );
    });

    it('should work with different invoice type codes', () => {
        const invoiceXML1 = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceTypeCode: 71,
        });

        const invoiceXML2 = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            invoiceTypeCode: 383,
        });

        expect(invoiceXML1).toContain(
            '<cbc:InvoiceTypeCode>71</cbc:InvoiceTypeCode>'
        );
        expect(invoiceXML2).toContain(
            '<cbc:InvoiceTypeCode>383</cbc:InvoiceTypeCode>'
        );
    });

    it('should work with currency codes', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            documentCurrencyCode: 'USD',
        });

        expect(invoiceXML.length).toBeGreaterThan(0);
        expect(invoiceXML).toContain(
            '<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>'
        );
    });

    it('should generate the same XML for issue dates supplied as strings or Date objects', () => {
        const invoiceWithStringDate = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            issueDate: '2026-05-15',
        });
        const invoiceWithDateObject = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            issueDate: new Date(2026, 4, 15),
        });

        expect(invoiceWithDateObject).toContain(
            '<cbc:IssueDate>2026-05-15</cbc:IssueDate>'
        );
        expect(invoiceWithDateObject).toBe(invoiceWithStringDate);
    });

    it('should return default profileId and customizationId', () => {
        const invoiceXML1 = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
        });

        expect(invoiceXML1).toContain(
            '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>'
        );
        expect(invoiceXML1).toContain(
            '<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
        );
    });

    it('should always include payable amount even when it is zero', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            legalMonetaryTotal: {
                ...basicInvoice.legalMonetaryTotal,
                payableAmount: 0,
            },
        });

        expect(invoiceXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
    });

    it('should omit other zero monetary amounts when generateOnZero is false', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            legalMonetaryTotal: {
                ...basicInvoice.legalMonetaryTotal,
                payableAmount: 0,
                prepaidAmount: 0,
                allowanceTotalAmount: 0,
                chargeTotalAmount: 0,
                payableRoundingAmount: 0,
            },
        });

        expect(invoiceXML).toContain(
            '<cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>'
        );
        expect(invoiceXML).not.toContain('<cbc:PrepaidAmount');
        expect(invoiceXML).not.toContain('<cbc:AllowanceTotalAmount');
        expect(invoiceXML).not.toContain('<cbc:ChargeTotalAmount');
        expect(invoiceXML).not.toContain('<cbc:PayableRoundingAmount');
    });

    it('should not nest cac:Party inside specialized party nodes', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL({
            ...basicInvoice,
            payeeParty: {
                name: 'Payee Name',
            },
            taxRepresentativeParty: {
                name: 'Tax Rep',
                address: {
                    streetName: 'Tax Street',
                    cityName: 'Tax City',
                    postalZone: '1000',
                    country: 'BE',
                },
                taxScheme: {
                    companyId: 'BE0123456789',
                    schemeID: 'VAT',
                },
            },
        });

        expect(invoiceXML).toMatch(/<cac:PayeeParty>\s*<cac:PartyName>/);
        expect(invoiceXML).not.toMatch(/<cac:PayeeParty>\s*<cac:Party>/);
        expect(invoiceXML).toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:PartyName>/
        );
        expect(invoiceXML).not.toMatch(
            /<cac:TaxRepresentativeParty>\s*<cac:Party>/
        );
    });

    it('should generate Peppol document and business references', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(comprehensiveInvoice);

        expect(invoiceXML).toContain(
            '<cbc:Note languageID="en">Handle with care</cbc:Note>'
        );
        expect(invoiceXML).toContain(
            '<cac:InvoicePeriod>\n    <cbc:StartDate>2026-05-01</cbc:StartDate>\n    <cbc:EndDate>2026-05-31</cbc:EndDate>\n    <cbc:DescriptionCode>35</cbc:DescriptionCode>\n  </cac:InvoicePeriod>'
        );
        expect(invoiceXML).toContain(
            '<cac:OrderReference>\n    <cbc:ID>PO-123</cbc:ID>\n    <cbc:SalesOrderID>SO-456</cbc:SalesOrderID>\n  </cac:OrderReference>'
        );
        expect(invoiceXML).toContain(
            '<cac:BillingReference>\n    <cac:InvoiceDocumentReference>\n      <cbc:ID>PREVIOUS-001</cbc:ID>\n      <cbc:IssueDate>2026-05-01</cbc:IssueDate>'
        );
        expect(invoiceXML).toContain(
            '<cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain" filename="timesheet.txt">SGVsbG8=</cbc:EmbeddedDocumentBinaryObject>'
        );
        expect(invoiceXML).toContain(
            '<cac:ExternalReference>\n        <cbc:URI>https://example.com/terms</cbc:URI>\n      </cac:ExternalReference>'
        );
        expect(invoiceXML).toContain(
            '<cac:ProjectReference>\n    <cbc:ID>PROJECT-001</cbc:ID>\n  </cac:ProjectReference>'
        );
    });

    it('should generate Peppol party, delivery, and payment groups', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(comprehensiveInvoice);

        expect(invoiceXML).toContain(
            '<cbc:EndpointID schemeID="0088">7300010000001</cbc:EndpointID>'
        );
        expect(invoiceXML).toMatch(
            /<cac:AddressLine>\s*<cbc:Line>Third floor<\/cbc:Line>\s*<\/cac:AddressLine>/
        );
        expect(invoiceXML).toContain(
            '<cbc:ID schemeID="0088">7300010000002</cbc:ID>'
        );
        expect(invoiceXML).toContain(
            '<cbc:ActualDeliveryDate>2026-05-31</cbc:ActualDeliveryDate>'
        );
        expect(invoiceXML).toContain(
            '<cbc:PaymentMeansCode name="Credit transfer">30</cbc:PaymentMeansCode>'
        );
        expect(invoiceXML).toMatch(
            /<cac:CardAccount>\s*<cbc:PrimaryAccountNumberID>1234<\/cbc:PrimaryAccountNumberID>\s*<cbc:NetworkID>VISA<\/cbc:NetworkID>\s*<cbc:HolderName>Alice Buyer<\/cbc:HolderName>\s*<\/cac:CardAccount>/
        );
        expect(invoiceXML).toMatch(
            /<cac:PaymentMandate>\s*<cbc:ID>MANDATE-001<\/cbc:ID>\s*<cac:PayerFinancialAccount>\s*<cbc:ID>DK5000400440116243<\/cbc:ID>/
        );
    });

    it('should generate allowances, dual-currency tax totals, and document totals', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(comprehensiveInvoice);

        expect(invoiceXML).toContain(
            '<cbc:TaxCurrencyCode>USD</cbc:TaxCurrencyCode>'
        );
        expect(invoiceXML.match(/<cac:TaxTotal>/g)).toHaveLength(2);
        expect(invoiceXML).toContain(
            '<cbc:TaxAmount currencyID="USD">23.00</cbc:TaxAmount>'
        );
        expect(invoiceXML).toContain(
            '<cbc:AllowanceChargeReasonCode>95</cbc:AllowanceChargeReasonCode>'
        );
        expect(invoiceXML).toContain(
            '<cbc:MultiplierFactorNumeric>5</cbc:MultiplierFactorNumeric>'
        );
        expect(invoiceXML).toContain(
            '<cbc:AllowanceTotalAmount currencyID="EUR">5.00</cbc:AllowanceTotalAmount>'
        );
        expect(invoiceXML).toContain(
            '<cbc:ChargeTotalAmount currencyID="EUR">15.00</cbc:ChargeTotalAmount>'
        );
        expect(invoiceXML).toContain(
            '<cbc:PayableRoundingAmount currencyID="EUR">0.01</cbc:PayableRoundingAmount>'
        );
    });

    it('should generate the supported Peppol invoice line details', () => {
        const invoiceXML = toolkit.invoiceToPeppolUBL(comprehensiveInvoice);

        expect(invoiceXML).toContain(
            '<cbc:Note languageID="en">Line note</cbc:Note>'
        );
        expect(invoiceXML).toContain(
            '<cac:DocumentReference>\n      <cbc:ID>OBJECT-001</cbc:ID>\n      <cbc:DocumentTypeCode>130</cbc:DocumentTypeCode>'
        );
        expect(invoiceXML).toContain(
            '<cac:BuyersItemIdentification>\n        <cbc:ID>BUYER-ITEM-001</cbc:ID>'
        );
        expect(invoiceXML).toContain(
            '<cbc:ID schemeID="0160">05412340000013</cbc:ID>'
        );
        expect(invoiceXML).toContain(
            '<cbc:ItemClassificationCode listID="SRV" listVersionID="1.0">72000000</cbc:ItemClassificationCode>'
        );
        expect(invoiceXML).toContain(
            '<cbc:BaseQuantity unitCode="C62">1.00</cbc:BaseQuantity>'
        );
        expect(invoiceXML).toContain(
            '<cbc:BaseAmount currencyID="EUR">105.00</cbc:BaseAmount>'
        );
    });
});
