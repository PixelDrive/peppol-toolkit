# @pixeldrive/peppol-toolkit

A TypeScript toolkit for preparing and reading documents for e-invoicing and PEPPOL integration. This library helps you generate PEPPOL-compliant UBL XML invoices from structured data.

PEPPOL (Pan-European Public Procurement On-Line) is a set of specifications that enables cross-border e-procurement in Europe and beyond. This toolkit simplifies the process of creating compliant electronic invoices.

## Features

- 🚀 Generate PEPPOL-compliant UBL XML invoices
- 📦 ESM and CommonJS builds for broad compatibility
- 🔷 Written in TypeScript with bundled type definitions
- 🧪 Built with fast-xml-parser for reliable XML generation
- ⚡ Simple API for quick integration

## Installation

```bash
npm install @pixeldrive/peppol-toolkit
```

## Quick Start

### ESM

```typescript
import { PeppolToolkit } from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();
```

### CommonJS

```javascript
const { PeppolToolkit } = require('@pixeldrive/peppol-toolkit');

const toolkit = new PeppolToolkit();
```

## Usage Examples

### Generate a PEPPOL UBL Invoice

```typescript
import { PeppolToolkit, Invoice } from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();

const invoice: Invoice = {
    ID: 'INV-2024-001',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    invoiceTypeCode: 380,
    documentCurrencyCode: 'EUR',
    buyerReference: 'PO-12345',
    seller: {
        endPoint: { scheme: '9925', id: '0123456789' },
        legalEntity: {
            registrationName: 'Acme Corp',
            companyId: '0123456789',
        },
        name: 'Acme Corp',
        address: {
            streetName: '123 Seller Street',
            cityName: 'Brussels',
            postalZone: '1000',
            country: 'BE',
        },
        taxSchemeCompanyID: 'BE0123456789',
        identification: [{ id: 'BE0123456789' }],
    },
    buyer: {
        endPoint: { scheme: '9925', id: '9876543210' },
        legalEntity: {
            registrationName: 'Buyer Ltd',
            companyId: '9876543210',
            legalForm: 'SRL',
        },
        name: 'Buyer Ltd',
        address: {
            streetName: '456 Buyer Avenue',
            cityName: 'Amsterdam',
            postalZone: '1011',
            country: 'NL',
        },
        taxSchemeCompanyID: 'NL9876543210',
        identification: [{ id: 'NL9876543210' }],
    },
    paymentMeans: [
        {
            code: '30',
            paymentId: 'INV-2024-001',
            name: 'Bank Transfer',
            financialAccount: {
                id: 'BE71 0961 2345 6769',
                name: 'Acme Corp',
                financialInstitutionBranch: 'GEBABEBB',
            },
        },
    ],
    paymentTermsNote: 'Payment due within 30 days.',
    taxTotal: [
        {
            taxAmountCurrency: 'EUR',
            taxAmount: 210.0,
            subTotals: [
                {
                    taxableAmount: 1000,
                    taxAmount: 210,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
            ],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 1000,
        taxExclusiveAmount: 1000,
        taxInclusiveAmount: 1210,
        prepaidAmount: 0,
        payableAmount: 1210,
    },
    invoiceLines: [
        {
            id: '1',
            invoicedQuantity: 10,
            unitCode: 'EA',
            lineExtensionAmount: 1000,
            price: 100,
            name: 'Consulting Services',
            currency: 'EUR',
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
};

const xml: string = toolkit.invoiceToPeppolUBL(invoice);
console.log(xml);
```

### Generate a PEPPOL UBL Credit Note

```typescript
import { PeppolToolkit, CreditNote } from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();

const creditNote: CreditNote = {
    ID: 'CN-2024-001',
    issueDate: '2024-01-20',
    creditNoteTypeCode: 381,
    documentCurrencyCode: 'EUR',
    buyerReference: 'PO-12345',
    billingReference: {
        invoiceDocReference: {
            id: 'INV-2024-001',
            issueDate: '2024-01-15',
        },
    },
    seller: {
        endPoint: { scheme: '9925', id: '0123456789' },
        legalEntity: {
            registrationName: 'Acme Corp',
            companyId: '0123456789',
        },
        name: 'Acme Corp',
        address: {
            streetName: '123 Seller Street',
            cityName: 'Brussels',
            postalZone: '1000',
            country: 'BE',
        },
        taxSchemeCompanyID: 'BE0123456789',
        identification: [{ id: 'BE0123456789' }],
    },
    buyer: {
        endPoint: { scheme: '9925', id: '9876543210' },
        legalEntity: {
            registrationName: 'Buyer Ltd',
            companyId: '9876543210',
        },
        name: 'Buyer Ltd',
        address: {
            streetName: '456 Buyer Avenue',
            cityName: 'Amsterdam',
            postalZone: '1011',
            country: 'NL',
        },
        taxSchemeCompanyID: 'NL9876543210',
        identification: [{ id: 'NL9876543210' }],
    },
    taxTotal: [
        {
            taxAmountCurrency: 'EUR',
            taxAmount: 21.0,
            subTotals: [
                {
                    taxableAmount: 100,
                    taxAmount: 21,
                    taxCategory: { categoryCode: 'S', percent: 21 },
                },
            ],
        },
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 100,
        taxExclusiveAmount: 100,
        taxInclusiveAmount: 121,
        prepaidAmount: 0,
        payableAmount: 121,
    },
    creditNoteLines: [
        {
            id: '1',
            invoicedQuantity: 1,
            unitCode: 'EA',
            lineExtensionAmount: 100,
            price: 100,
            name: 'Consulting Services (correction)',
            currency: 'EUR',
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
};

const xml: string = toolkit.creditNoteToPeppolUBL(creditNote);
console.log(xml);
```

### Parse a PEPPOL UBL XML back to an Invoice or CreditNote

```typescript
import { PeppolToolkit, Invoice, CreditNote } from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();

// Parse an invoice XML string back into a structured Invoice object
const invoiceXml = '<?xml version="1.0"?>...'; // your UBL XML string
const invoice: Invoice = toolkit.peppolUBLToInvoice(invoiceXml);
console.log(invoice.ID);             // 'INV-2024-001'
console.log(invoice.invoiceLines);   // array of line items

// Parse a credit note XML string back into a CreditNote object
const creditNoteXml = '<?xml version="1.0"?>...'; // your UBL credit note XML
const creditNote: CreditNote = toolkit.peppolUBLToCreditNote(creditNoteXml);
console.log(creditNote.ID);
```

### Compute Invoice Totals

Use the static `computeTotals` helper to calculate line totals, tax amounts, and the grand total from a list of line items — following EN 16931 rounding rules.

```typescript
import { PeppolToolkit } from '@pixeldrive/peppol-toolkit';

const items = [
    { price: 100,  quantity: 10, taxPercent: 21 },  // 1 000.00 + 210.00 VAT
    { price: 49.99, quantity: 3, taxPercent: 21 },  //   149.97 +  31.49 VAT
    { price: 200,  quantity: 2,  taxPercent: 0  },  //   400.00 + 0.00 VAT (exempt)
];

const totals = PeppolToolkit.computeTotals(items);

console.log(totals.baseAmount.toNumber());          // 1549.97
console.log(totals.taxAmount.toNumber());           // 241.49
console.log(totals.totalAmount.toNumber());         // 1791.46

// Tax amounts grouped by rate
for (const [rate, taxableAmount] of totals.taxableAmountPerRate) {
    console.log(`${rate}% → taxable: ${taxableAmount}`);
}
```

### Look up an EAS Endpoint Scheme from a VAT Number

`getEASFromTaxId` resolves the correct EAS (Electronic Address Scheme) identifier for a given country-prefixed VAT number.

```typescript
import { PeppolToolkit } from '@pixeldrive/peppol-toolkit';

const scheme = PeppolToolkit.getEASFromTaxId('BE0123456789');
console.log(scheme); // '9925'

const scheme2 = PeppolToolkit.getEASFromTaxId('NL9876543210');
console.log(scheme2); // '9944'
```

### Use the Built-in Example Data

The toolkit ships ready-to-run example documents so you can test your integration without building a full document from scratch.

```typescript
import {
    PeppolToolkit,
    exampleInvoice,
    exampleCreditNote,
} from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();

// Generate XML from the bundled example invoice
const invoiceXml = toolkit.invoiceToPeppolUBL(exampleInvoice);
console.log(invoiceXml);

// Generate XML from the bundled example credit note
const creditNoteXml = toolkit.creditNoteToPeppolUBL(exampleCreditNote);
console.log(creditNoteXml);
```

## API Reference

### `PeppolToolkit`

The main class that provides invoice and credit note conversion functionality.

#### Instance Methods

| Method | Description |
|--------|-------------|
| `invoiceToPeppolUBL(invoice: Invoice): string` | Converts an `Invoice` object to a PEPPOL-compliant UBL XML string |
| `creditNoteToPeppolUBL(creditNote: CreditNote): string` | Converts a `CreditNote` object to a PEPPOL-compliant UBL XML string |
| `peppolUBLToInvoice(xml: string): Invoice` | Parses a PEPPOL UBL XML string into an `Invoice` object |
| `peppolUBLToCreditNote(xml: string): CreditNote` | Parses a PEPPOL UBL XML string into a `CreditNote` object |

#### Static Helpers

| Helper | Description |
|--------|-------------|
| `PeppolToolkit.computeTotals(items: UBLLineItem[]): Totals` | Calculates line totals, tax amounts and grand total following EN 16931 rules |
| `PeppolToolkit.getEASFromTaxId(taxId: string): string` | Returns the EAS scheme code for a country-prefixed VAT number |

### `createToolkit()`

Factory function that creates a new instance of `PeppolToolkit`. Equivalent to `new PeppolToolkit()`.

```typescript
import { createToolkit } from '@pixeldrive/peppol-toolkit';

const toolkit = createToolkit();
```

## PEPPOL BIS UBL Invoice Elements Checklist

This toolkit supports the following PEPPOL BIS UBL invoice elements based on the current implementation:

### 📄 Document Level Elements

- [x] **CustomizationID** - PEPPOL compliance identifier
- [x] **ProfileID** - PEPPOL business process identifier
- [x] **ID** - Invoice number/identifier
- [x] **IssueDate** - Invoice issue date
- [x] **DueDate** - Payment due date (optional)
- [x] **InvoiceTypeCode** - Type of invoice (e.g., 380, 383)
- [x] **DocumentCurrencyCode** - Currency for the invoice
- [x] **BuyerReference** - Buyer's reference identifier

### 👤 Party Information (Seller & Buyer)

- [x] **EndpointID** - Electronic address with scheme
- [x] **PartyIdentification** - Party identifiers with schemes
- [x] **PartyName** - Party name (optional)
- [x] **PostalAddress** - Complete address information
    - [x] StreetName
    - [x] AdditionalStreetName (optional)
    - [x] CityName
    - [x] PostalZone
    - [x] Country identification code
- [x] **PartyTaxScheme** - VAT information
    - [x] CompanyID (VAT number)
    - [x] TaxScheme ID (VAT)
- [x] **PartyLegalEntity** - Legal entity details
    - [x] RegistrationName
    - [x] CompanyID (optional)
    - [x] CompanyLegalForm (optional)
- [x] **Contact** - Contact information (optional)
    - [x] Name
    - [x] Telephone
    - [x] ElectronicMail

### 💳 Payment Information

- [x] **PaymentMeans** - Payment method details
    - [x] PaymentMeansCode
    - [x] PaymentID
    - [x] PayeeFinancialAccount (optional)
        - [x] Account ID
        - [x] Account Name
        - [x] FinancialInstitutionBranch
- [x] **PaymentTerms** - Payment terms note (optional)

### 💰 Tax Information

- [x] **TaxTotal** - Complete tax breakdown
    - [x] TaxAmount with currency
    - [x] TaxSubtotal details
        - [x] TaxableAmount with currency
        - [x] TaxAmount with currency
        - [x] TaxCategory information
            - [x] Category ID/Code
            - [x] Percent rate
            - [x] TaxExemptionReason (optional)
            - [x] TaxExemptionReasonCode (optional)
            - [x] TaxScheme (VAT)

### 🧮 Monetary Totals

- [x] **LegalMonetaryTotal** - Invoice totals
    - [x] LineExtensionAmount - Sum of line amounts
    - [x] TaxExclusiveAmount - Amount excluding tax
    - [x] TaxInclusiveAmount - Amount including tax
    - [x] PayableAmount - Final payable amount
    - [x] AllowanceTotalAmount (optional)
    - [x] ChargeTotalAmount (optional)
    - [x] PrepaidAmount (optional)
    - [x] PayableRoundingAmount (optional)

### 📋 Invoice Lines

- [x] **InvoiceLine** - Individual line items
    - [x] ID - Line identifier
    - [x] Note (optional)
    - [x] InvoicedQuantity with unit code
    - [x] LineExtensionAmount with currency
    - [x] Item information
        - [x] Name
        - [x] Description (optional)
        - [x] ClassifiedTaxCategory
            - [x] Category ID
            - [x] Percent rate
            - [x] TaxScheme (VAT)
    - [x] Price information
        - [x] PriceAmount with currency

### 🔧 Technical Features

- [x] **XML Namespaces** - Proper UBL 2.1 namespaces
- [x] **Currency Support** - Multi-currency handling
- [x] **Unit Codes** - UN/ECE Recommendation No. 20 unit codes
- [x] **Country Codes** - ISO 3166-1 alpha-2 country codes
- [x] **Schema Validation** - Zod-based type validation
- [x] **XML Formatting** - Properly formatted XML output

## Development Status

⚠️ **Early Development**: This project is currently in early development. The Invoice type definitions and full feature set are still being implemented. Contributions and feedback are welcome!

## Versioning

Starting from version 1.0.0, this library will follow [Semantic Versioning (SemVer)](https://semver.org/). Until then, breaking changes may occur in minor and patch releases as the API is still being stabilized.

## Roadmap

- [x] Initial invoice-to-UBL XML generation API
- [x] Define and export robust Invoice TypeScript types
- [x] Add input validation helpers
- [x] Support CreditNote documents
- [ ] Implement UBL 2.1 schema validation (offline)
- [ ] Implement PEPPOL BIS profile validation (offline)
- [ ] Enable online validation against remote services
- [ ] Support attachments/binary objects embedding (e.g., PDF)
- [ ] CLI: Convert JSON invoices to UBL XML
- [x] Documentation: Examples and recipe-style guides
- [ ] QA: Expand unit tests

Last updated: 2026-03-10

## Development Scripts

- `npm run build` - Build the library
- `npm run dev` - Build in watch mode for development
- `npm run test` - Run tests
- `npm run lint` - Lint the codebase
- `npm run format` - Format code with Prettier

## Requirements

- Node.js 18+ recommended
- Works in TypeScript and JavaScript projects

## About PEPPOL

PEPPOL is an international standard for electronic document exchange, particularly for invoicing and procurement. It ensures that electronic documents can be exchanged seamlessly between different systems across borders.

This toolkit helps you:

- Generate UBL (Universal Business Language) XML invoices
- Ensure PEPPOL compliance for cross-border transactions
- Integrate e-invoicing capabilities into your applications

## Contributing

Contributions are welcome! This project is in active development and we're looking for contributors to help build out the full feature set.

Please feel free to:

- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Help with documentation and examples

## License

MIT

## Disclaimer

This software is provided "as is" without warranty of any kind. Please ensure compliance with your local regulations and PEPPOL requirements when using this toolkit in production.
