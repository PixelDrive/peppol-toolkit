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
import { PeppolToolkit, createToolkit } from '@pixeldrive/peppol-toolkit';

// Using the class directly
const toolkit = new PeppolToolkit();

// Or using the factory function
// const toolkit = createToolkit();

// Generate PEPPOL UBL XML from invoice data
const invoiceData = {};
const peppolXML = toolkit.invoiceToPeppolUBL(invoiceData);
console.log(peppolXML);
```

### CommonJS

```javascript
const { PeppolToolkit, createToolkit } = require('@pixeldrive/peppol-toolkit');

const toolkit = new PeppolToolkit();
const peppolXML = toolkit.invoiceToPeppolUBL({});
```

## API Reference

### PeppolToolkit

The main class that provides invoice conversion functionality.

#### Methods

- `invoiceToPeppolUBL(invoice: Invoice): string`
    - Converts an invoice object to PEPPOL-compliant UBL XML
    - Returns: XML string formatted for PEPPOL compliance

### createToolkit()

Factory function that creates a new instance of PeppolToolkit.

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

- [ ] Initial invoice-to-UBL XML generation API
- [ ] Define and export robust Invoice TypeScript types
- [ ] Add input validation helpers
- [ ] Support CreditNote documents
- [ ] Implement UBL 2.1 schema validation (offline)
- [ ] Implement PEPPOL BIS profile validation (offline)
- [ ] Enable online validation against remote services
- [ ] Support attachments/binary objects embedding (e.g., PDF)
- [ ] CLI: Convert JSON invoices to UBL XML
- [ ] Documentation: Examples and recipe-style guides
- [ ] QA: Expand unit tests

Last updated: 2025-09-29

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
