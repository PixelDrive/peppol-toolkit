import { Invoice } from '../../src';
import { basicInvoice } from '../../src/data/basic-invoice';

/**
 * Exercises the optional Peppol BIS Billing 3.0 business groups supported by
 * the toolkit. Keep the amounts internally consistent so this remains useful
 * for validator tests as well as builder/parser round-trips.
 */
export const comprehensiveInvoice = {
    ...basicInvoice,
    ID: 'SPEC-2026-001',
    issueDate: '2026-06-01',
    dueDate: '2026-06-30',
    note: [{ content: 'Handle with care', languageID: 'en' }],
    taxPointDate: '2026-05-31',
    taxCurrencyCode: 'USD',
    accountingCost: '4217:2323:2323',
    buyerReference: 'BUYER-REF-42',
    invoicePeriod: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        descriptionCode: '35',
    },
    orderReference: {
        id: 'PO-123',
        salesOrderId: 'SO-456',
    },
    billingReference: [
        {
            invoiceDocReference: {
                id: 'PREVIOUS-001',
                issueDate: '2026-05-01',
            },
        },
    ],
    despatchDocumentReference: 'DESPATCH-001',
    receiptDocumentReference: 'RECEIPT-001',
    originatorDocumentReference: 'TENDER-001',
    contractDocumentReference: 'CONTRACT-001',
    additionalDocumentReference: [
        {
            id: 'TIMESHEET-001',
            schemeID: 'DOC',
            documentDescription: 'May timesheet',
            attachment: {
                embeddedDocumentBinaryObject: 'SGVsbG8=',
                mimeCode: 'text/plain',
                filename: 'timesheet.txt',
            },
        },
        {
            id: 'TERMS-001',
            attachment: {
                externalReference: 'https://example.com/terms',
            },
        },
    ],
    projectReference: 'PROJECT-001',
    seller: {
        ...basicInvoice.seller,
        endPoint: { scheme: '0088', id: '7300010000001' },
        identification: [{ scheme: '0088', id: '7300010000001' }],
        address: {
            streetName: 'Main Street 1',
            additionalStreetName: 'Building A',
            cityName: 'Brussels',
            postalZone: '1000',
            countrySubentity: 'Brussels-Capital',
            addressLine: 'Third floor',
            country: 'BE',
        },
        legalEntity: {
            registrationName: 'Supplier Official Name',
            companyId: { id: '0732788874', schemeID: '0208' },
            legalForm: 'SRL',
        },
        contact: {
            name: 'Alice Supplier',
            phone: '+32 2 555 0100',
            email: 'alice@example.com',
        },
    },
    buyer: {
        ...basicInvoice.buyer,
        endPoint: { scheme: '0184', id: 'DK12345678' },
        address: {
            streetName: 'Buyer Street 8',
            cityName: 'Copenhagen',
            postalZone: '1050',
            country: 'DK',
        },
        legalEntity: {
            registrationName: 'Buyer Official Name',
            companyId: { id: 'DK12345678', schemeID: '0184' },
        },
    },
    payeeParty: {
        identification: { id: 'PAYEE-001', schemeID: '0088' },
        name: 'Separate Payee',
        legalEntity: {
            companyId: { id: 'PAYEE-COMPANY', schemeID: '0088' },
        },
    },
    taxRepresentativeParty: {
        name: 'Tax Representative',
        address: {
            streetName: 'Tax Street 2',
            cityName: 'Brussels',
            postalZone: '1000',
            country: 'BE',
        },
        taxScheme: {
            companyId: 'BE0123456789',
            schemeID: 'VAT',
        },
    },
    delivery: {
        actualDeliveryDate: '2026-05-31',
        deliveryLocation: {
            id: '7300010000002',
            locationSchemeID: '0088',
            address: {
                streetName: 'Delivery Street 2',
                cityName: 'Antwerp',
                postalZone: '2000',
                country: 'BE',
            },
        },
        deliveryPartyName: 'Delivery Warehouse',
    },
    paymentMeans: [
        {
            code: '30',
            name: 'Credit transfer',
            paymentId: 'RF18539007547034',
            financialAccount: {
                id: 'BE68539007547034',
                name: 'Supplier account',
                financialInstitutionBranch: 'KREDBEBB',
            },
        },
        {
            code: '48',
            cardAccount: {
                primaryAccountNumberId: '1234',
                networkId: 'VISA',
                holderName: 'Alice Buyer',
            },
        },
        {
            code: '59',
            paymentMandate: {
                id: 'MANDATE-001',
                payerFinancialAccountId: 'DK5000400440116243',
            },
        },
    ],
    paymentTermsNote: 'Payment within 30 days',
    allowanceCharge: [
        {
            chargeIndicator: false,
            reasonCode: '95',
            reason: 'Promotional discount',
            multiplierFactorNumeric: 5,
            amount: 5,
            baseAmount: 100,
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
        {
            chargeIndicator: true,
            reasonCode: 'FC',
            reason: 'Freight service',
            amount: 15,
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
    taxTotal: [
        {
            taxAmountCurrency: 'EUR',
            taxAmount: 21,
            subTotals: [
                {
                    taxableAmount: 100,
                    taxAmount: 21,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
            ],
        },
        {
            taxAmountCurrency: 'USD',
            taxAmount: 23,
            subTotals: [],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 90,
        taxExclusiveAmount: 100,
        taxInclusiveAmount: 121,
        allowanceTotalAmount: 5,
        chargeTotalAmount: 15,
        prepaidAmount: 20,
        payableRoundingAmount: 0.01,
        payableAmount: 101.01,
    },
    invoiceLines: [
        {
            id: '1',
            note: [{ content: 'Line note', languageID: 'en' }],
            invoicedQuantity: 1,
            lineExtensionAmount: 90,
            accountingCost: 'LINE-COST-001',
            invoicePeriod: {
                startDate: '2026-05-01',
                endDate: '2026-05-31',
            },
            orderLineReference: 'PO-LINE-1',
            documentReference: {
                id: 'OBJECT-001',
                documentTypeCode: '130',
            },
            allowanceCharge: [
                {
                    chargeIndicator: false,
                    reasonCode: '95',
                    reason: 'Line discount',
                    multiplierFactorNumeric: 10,
                    amount: 10,
                    baseAmount: 100,
                },
            ],
            name: 'Consulting service',
            description: 'Professional services delivered in May',
            buyersItemIdentification: 'BUYER-ITEM-001',
            sellersItemIdentification: 'SELLER-ITEM-001',
            standardItemIdentification: {
                id: '05412340000013',
                schemeID: '0160',
            },
            originCountry: 'BE',
            commodityClassification: [
                { code: '72000000', listID: 'SRV', listVersionID: '1.0' },
            ],
            taxCategory: { categoryCode: 'S', percent: 21 },
            additionalItemProperties: [
                { name: 'Consultant level', value: 'Senior' },
            ],
            price: 100,
            currency: 'EUR',
            unitCode: 'C62',
            baseQuantity: 1,
            priceAllowanceCharge: {
                amount: 5,
                baseAmount: 105,
            },
        },
    ],
} satisfies Invoice;
