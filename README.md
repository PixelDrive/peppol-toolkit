# @pixeldrive/peppol-toolkit

A TypeScript toolkit for preparing and reading documents for e-invoicing and PEPPOL integration. This library helps you generate PEPPOL-compliant UBL XML invoices and credit notes from structured data.

PEPPOL (Pan-European Public Procurement On-Line) is a set of specifications that enables cross-border e-procurement in Europe and beyond. This toolkit simplifies the process of creating compliant electronic invoices.

## Features

- 🚀 Generate PEPPOL-compliant UBL XML invoices and credit notes
- 🧾 Generate and read plain EN 16931 UBL documents for invoices that do not travel over Peppol (e.g. B2C invoices)
- ✅ Validate UBL XML against a KoSIT validator service
- 📦 ESM and CommonJS builds for broad compatibility
- 🔷 Written in TypeScript with bundled type definitions
- 🧪 Built with fast-xml-parser for reliable XML generation
- ⚡ Simple API for quick integration

## Installation

```bash
npm install @pixeldrive/peppol-toolkit
```

Install prereleases with `npm install @pixeldrive/peppol-toolkit@canary`. The prerelease suffix keeps canary builds out of ordinary stable version ranges.

## Breaking changes in the `0.10` series

`0.10.0-canary.0` is the preview release. The first stable release with these changes is planned for `0.10.1`.

The `0.10` series aligns the code lists with **Peppol BIS Billing 3.0.21** (mandatory since 2026-08-17, see [Code lists](#code-lists)). Codes that the toolkit used to accept but that a BIS 3.0.21 validator rejects are no longer part of the types and schemas: documents using them do not compile anymore and fail to parse with `peppolUBLToInvoice` / `peppolUBLToCreditNote`.

- **EAS** (`EASCodes`, `EASCodeSchema`, used by `endPoint.scheme`): the 14 codes removed by BIS 3.0.21 are no longer accepted: `0037`, `0147`, `0154`, `0170`, `0177`, `0193`, `0194`, `0202`, `0203`, `0205`, `0212`, `0213`, `0215` and `0217` (they were rejected by `PEPPOL-EN16931-CL008`). `0242`, `0244`, `0245`, `0246` and `0248` are added, and 11 descriptions follow the new list (e.g. `0088` is now `Global Location Number`). The removed codes are still part of the CEF EAS code list: such parties can still be invoiced with an [EN 16931 document](#generate-an-en-16931-ubl-document-outside-peppol).
- `getEASFromTaxId` returns `undefined` for Finnish VAT numbers instead of the removed `0213`.
- **ICD** (`ICDCodes`, `ICDCodeSchema`, used by `identification[].scheme`): the list now holds the 243 codes of BIS 3.0.21 (192 were missing, including `0246`, `0247` and `0248`) and no longer accepts the `99xx` codes, which are electronic address schemes and not ICD codes (they were rejected by `BR-CL-10`). `SEPA` is still accepted for the seller, as bank assigned creditor identifier (BT-90), but no longer for the buyer (`BR-CL-10`).
- **Currencies** (`CurrencyCodes`, `CurrencyCodeSchema`): `ANG` and `BGN` are removed, `XCG` and `CNH` are added.
- **Credit note type codes** (`CreditNoteTypeCodes`, `CreditNoteTypeCodeSchema`): `261` (self-billed credit note) is removed. BIS Billing only allows `81`, `83`, `381`, `396` and `532` (`PEPPOL-EN16931-P0101`).

Other changes in the `0.10` series:

- EN 16931 documents for invoices that do not travel over Peppol, e.g. B2C invoices (see [Generate an EN 16931 UBL document](#generate-an-en-16931-ubl-document-outside-peppol)).
- `PEPPOL_BIS3_BILLING_WITH_RESPONSE_PROFILE_ID` (`urn:peppol:bis:billing_with_response`), the profile 02 added by BIS 3.0.21, to set as `profileID`. `PEPPOL_BIS3_CUSTOMIZATION_ID` and `PEPPOL_BIS3_PROFILE_ID` are exported as well.
- The Peppol builders throw a descriptive `TypeError` when the seller or the buyer has no `endPoint` (only possible with untyped input), instead of failing on `undefined`.

## Breaking changes in `0.9.0`

Version `0.9.0` validates monetary amounts when building UBL documents (see [Amount precision](#amount-precision)).

- `invoiceToPeppolUBL` and `creditNoteToPeppolUBL` now **throw** when a monetary amount has more than two decimals (e.g. `taxAmount: 52.605`). Previously such values were silently rounded with `toFixed(2)`, which is not half-up and could produce documents failing BR-CO-14. The unit price fields (`price` → `cbc:PriceAmount`, `priceAllowanceCharge.amount` / `.baseAmount`) are not affected and keep their full precision. Quantities are not affected either.
- The builder now **throws** when a `taxTotal[].taxAmount` does not equal the sum of its `subTotals[].taxAmount` (BR-CO-14).
- `cbc:Percent` (VAT rates on tax sub totals, document-level allowances/charges and lines) is now serialized at full precision instead of being rounded to two decimals: `21` instead of `21.00` (valid: Peppol BIS §7.2.3 puts no restriction on the number of decimals of percentages), and `5.125` is written unchanged instead of `5.13`.
- `computeTotals` additionally returns `vatBreakdown` (one entry per VAT category code + rate, see [Compute Invoice Totals](#compute-invoice-totals)) and `taxAmountPerRate: Map<string, Decimal>`, and line items accept an optional `taxCategoryCode` (default `'S'`). All additive. The keys of `taxableAmountPerRate` / `taxAmountPerRate` are now the canonical rate (`'21'` for `21`, `'21'` and `'21.0'`).

Parsing UBL documents is not affected by these checks. If you were relying on implicit rounding, round your amounts to two decimals half-up before building, e.g. with `new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()`, or use the amounts returned by `computeTotals`.

## Breaking changes in `0.8.0`

Version `0.8.0` tightens the public data model to better match PEPPOL BIS Billing 3 / UBL expectations. If you are upgrading from `0.7.x` or earlier, review the following migrations.

### Migration checklist

| Before                                      | Now                                                 | Notes                                                    |
| ------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `party.taxSchemeCompanyID: string`          | `party.taxSchemes: [{ companyId, schemeID? }]`      | Supports 0..2 tax schemes instead of a single flat field |
| `party.legalEntity.companyId: string`       | `party.legalEntity.companyId: { id, schemeID? }`    | Matches the XML structure and allows `schemeID`          |
| `invoice.note: string`                      | `invoice.note: { content, languageID? }[]`          | Same change for `creditNote.note` and line `note`        |
| `billingReference: { ... }`                 | `billingReference: [{ ... }]`                       | Applies to invoices and credit notes                     |
| `line.documentReference: string`            | `line.documentReference: { id, documentTypeCode? }` | `documentTypeCode` defaults to `'130'` when omitted      |
| `identification[].scheme` using an EAS code | `identification[].scheme` must use an ICD code      | `endPoint.scheme` still uses EAS                         |

### Other notable changes

- Party and delivery addresses now use the proper UBL `cac:AddressLine/cbc:Line` structure when XML is generated.
- The parser still accepts legacy `cbc:AddressLine`, but that legacy shape is deprecated.
- `payeeParty` and `taxRepresentativeParty` are now supported on invoices and credit notes.
- `paymentMeans` supports `paymentDueDate`, `cardAccount`, and `paymentMandate`.
- Tax exemption reasons should be modeled on `taxTotal[].subTotals[].taxCategory`.
  Line `taxCategory` is intentionally limited to `categoryCode` and `percent` in the current TypeScript schema.
- The package now ships several advanced invoice fixtures for testing: `mixedVatAllowanceInvoice`, `reverseChargeServiceInvoice`, `dualCurrencyInvoice`, `specialVatCategoriesInvoice`, and the grouped `exampleInvoices` export.

### Before / after example

```typescript
// Before
const seller = {
    taxSchemeCompanyID: 'BE0123456789',
    legalEntity: {
        registrationName: 'Acme Corp',
        companyId: '0123456789',
    },
};

// Now
const seller = {
    taxSchemes: [
        {
            companyId: 'BE0123456789',
            schemeID: 'VAT',
        },
    ],
    legalEntity: {
        registrationName: 'Acme Corp',
        companyId: {
            id: '0123456789',
        },
    },
};
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
            companyId: {
                id: '0123456789',
            },
        },
        name: 'Acme Corp',
        address: {
            streetName: '123 Seller Street',
            cityName: 'Brussels',
            postalZone: '1000',
            country: 'BE',
        },
        taxSchemes: [{ companyId: 'BE0123456789', schemeID: 'VAT' }],
        identification: [{ id: 'BE0123456789' }],
    },
    buyer: {
        endPoint: { scheme: '9925', id: '9876543210' },
        legalEntity: {
            registrationName: 'Buyer Ltd',
            companyId: {
                id: '9876543210',
            },
            legalForm: 'SRL',
        },
        name: 'Buyer Ltd',
        address: {
            streetName: '456 Buyer Avenue',
            cityName: 'Amsterdam',
            postalZone: '1011',
            country: 'NL',
        },
        taxSchemes: [{ companyId: 'NL9876543210', schemeID: 'VAT' }],
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
    billingReference: [
        {
            invoiceDocReference: {
                id: 'INV-2024-001',
                issueDate: '2024-01-15',
            },
        },
    ],
    seller: {
        endPoint: { scheme: '9925', id: '0123456789' },
        legalEntity: {
            registrationName: 'Acme Corp',
            companyId: {
                id: '0123456789',
            },
        },
        name: 'Acme Corp',
        address: {
            streetName: '123 Seller Street',
            cityName: 'Brussels',
            postalZone: '1000',
            country: 'BE',
        },
        taxSchemes: [{ companyId: 'BE0123456789', schemeID: 'VAT' }],
        identification: [{ id: 'BE0123456789' }],
    },
    buyer: {
        endPoint: { scheme: '9925', id: '9876543210' },
        legalEntity: {
            registrationName: 'Buyer Ltd',
            companyId: {
                id: '9876543210',
            },
        },
        name: 'Buyer Ltd',
        address: {
            streetName: '456 Buyer Avenue',
            cityName: 'Amsterdam',
            postalZone: '1011',
            country: 'NL',
        },
        taxSchemes: [{ companyId: 'NL9876543210', schemeID: 'VAT' }],
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
console.log(invoice.ID); // 'INV-2024-001'
console.log(invoice.invoiceLines); // array of line items

// Parse a credit note XML string back into a CreditNote object
const creditNoteXml = '<?xml version="1.0"?>...'; // your UBL credit note XML
const creditNote: CreditNote = toolkit.peppolUBLToCreditNote(creditNoteXml);
console.log(creditNote.ID);
```

### Generate an EN 16931 UBL document (outside Peppol)

Some invoices are never sent over Peppol and cannot be valid Peppol BIS documents. B2C invoices are the typical case: Peppol requires an electronic address for the buyer (BT-49, `PEPPOL-EN16931-R010`), and no scheme of the Peppol EAS code list fits a consumer. For these documents, generate a plain EN 16931 document: the core semantic model, without the Peppol CIUS.

```typescript
import { PeppolToolkit, En16931Invoice } from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();

const invoice: En16931Invoice = {
    ID: 'B2C-2026-001',
    issueDate: '2026-03-01',
    dueDate: '2026-03-31',
    invoiceTypeCode: 380,
    documentCurrencyCode: 'EUR',
    seller: {
        endPoint: { scheme: '0208', id: '0732788874' },
        legalEntity: { registrationName: 'Pixeldrive SRL' },
        address: { cityName: 'Namur', postalZone: '5000', country: 'BE' },
        taxSchemes: [{ companyId: 'BE0732788874', schemeID: 'VAT' }],
    },
    // A consumer: no electronic address, no VAT identifier
    buyer: {
        legalEntity: { registrationName: 'Jane Doe' },
        address: {
            streetName: 'Rue de Fer 12',
            cityName: 'Namur',
            postalZone: '5000',
            country: 'BE',
        },
    },
    paymentMeans: [
        { code: '30', financialAccount: { id: 'BE71096123456769' } },
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
    ],
    legalMonetaryTotal: {
        currency: 'EUR',
        lineExtensionAmount: 100,
        taxExclusiveAmount: 100,
        taxInclusiveAmount: 121,
        payableAmount: 121,
    },
    invoiceLines: [
        {
            id: '1',
            invoicedQuantity: 1,
            unitCode: 'C62',
            lineExtensionAmount: 100,
            price: 100,
            name: 'Website maintenance',
            currency: 'EUR',
            taxCategory: { categoryCode: 'S', percent: 21 },
        },
    ],
};

const xml: string = toolkit.invoiceToEn16931UBL(invoice);
```

Compared to `invoiceToPeppolUBL` and `creditNoteToPeppolUBL`, `invoiceToEn16931UBL` and `creditNoteToEn16931UBL`:

- make `endPoint` (BT-34, BT-49) optional on the seller and the buyer. When present, its scheme must come from the CEF EAS code list (`CefEASCodes`, BR-CL-25), which is wider than the Peppol one: it includes for example `EM` (e-mail address);
- always write `urn:cen.eu:en16931:2017` (`EN16931_CUSTOMIZATION_ID`) as `cbc:CustomizationID`. The `customizationID` of the document is ignored;
- only write `cbc:ProfileID` (BT-23) when `profileID` is set;
- check the amounts in the same way (see [Amount precision](#amount-precision)).

The EN 16931 types are the base of the Peppol ones: every `Invoice` / `CreditNote` is also an `En16931Invoice` / `En16931CreditNote`. The Peppol schemas, builders and parsers keep their strictness: `invoiceToPeppolUBL` throws when the seller or the buyer has no electronic address.

Use `en16931UBLToInvoice` and `en16931UBLToCreditNote` to read EN 16931 and Peppol BIS UBL documents. The EN 16931 parsers support signed quantities, net line amounts and VAT amounts. The Peppol parsers require seller and buyer electronic addresses from the Peppol EAS code list.

Use `detectUblProfile` to select the parser and validator for a stored document. It reads the UBL `cbc:CustomizationID` from a well-formed invoice or credit note. Use KoSIT to check the business rules for the detected profile.

```typescript
PeppolToolkit.detectUblProfile(xml); // 'peppol-bis3' | 'en16931' | 'unknown'
```

Validating an EN 16931 document with KoSIT requires a configuration with an EN 16931 (CEN) scenario: the Peppol BIS configuration only matches Peppol documents and rejects any other document. `npm run kosit:start:en16931` starts a validator with such a configuration (see [KoSIT end-to-end tests](#kosit-end-to-end-tests)).

### Compute Invoice Totals

Use the static `computeTotals` helper to calculate line totals, tax amounts, and the grand total from a list of line items — following EN 16931 rounding rules.

```typescript
import { PeppolToolkit } from '@pixeldrive/peppol-toolkit';

const items = [
    { price: 100, quantity: 10, taxPercent: 21 }, // 1 000.00 + 210.00 VAT
    { price: 49.99, quantity: 3, taxPercent: 21 }, //   149.97 +  31.49 VAT
    { price: 200, quantity: 2, taxPercent: 0, taxCategoryCode: 'Z' }, //   400.00 + 0.00 VAT (zero-rated)
];

const totals = PeppolToolkit.computeTotals(items);

console.log(totals.baseAmount.toNumber()); // 1549.97
console.log(totals.taxAmount.toNumber()); // 241.49
console.log(totals.totalAmount.toNumber()); // 1791.46

// VAT breakdown: one entry per distinct combination of VAT category code and rate (Peppol BIS §8.3)
for (const entry of totals.vatBreakdown) {
    console.log(
        `${entry.categoryCode} ${entry.percent}% → taxable: ${entry.taxableAmount}, VAT: ${entry.taxAmount}`
    );
}
// S 21% → taxable: 1149.97, VAT: 241.49
// Z 0% → taxable: 400, VAT: 0
```

Each line may carry a `taxCategoryCode` (UNCL5305: `S`, `Z`, `E`, `AE`, `K`, `G`, `O`, ...), defaulting to `S`. Lines are grouped by category code and canonical rate (`21`, `'21'` and `'21.0'` are the same rate; `E` and `Z` lines at 0% are two separate groups). The VAT of each group is `taxableAmount × percent / 100` rounded half-up to two decimals (BR-CO-17), and `taxAmount` is exactly the sum of the group amounts (BR-CO-14). Never recompute `taxable × rate / 100` yourself: an unrounded value such as `52.605` is rejected by the builder (see [Amount precision](#amount-precision)).

`taxableAmountPerRate` and `taxAmountPerRate` (`Map<string, Decimal>`, keyed by the canonical rate as a string) are derived from the breakdown by summing the groups that share a rate; they therefore merge categories that share a rate (e.g. `E` and `Z` at 0%) and are not suitable for building the tax sub totals when several categories are used.

Build the `taxTotal` of the document from `vatBreakdown`:

```typescript
import { Invoice } from '@pixeldrive/peppol-toolkit';

const taxTotal: Invoice['taxTotal'] = [
    {
        taxAmountCurrency: 'EUR',
        taxAmount: totals.taxAmount.toNumber(),
        subTotals: totals.vatBreakdown.map((entry) => ({
            taxableAmount: entry.taxableAmount.toNumber(),
            taxAmount: entry.taxAmount.toNumber(),
            taxCategory: {
                categoryCode: entry.categoryCode,
                percent: entry.percent,
            },
        })),
    },
];
```

Two things are not covered by `computeTotals` and remain the caller's responsibility:

- **Document-level allowances and charges** (BG-20/BG-21) must be added to or subtracted from the taxable base of their VAT category before the VAT is computed (Peppol BIS §10.4). `computeTotals` only knows the lines.
- Categories other than `S` need an **exemption reason** on the sub total: set `taxCategory.exemptionReason` or `taxCategory.exemptionReasonCode` for `E`, `AE`, `K`, `G` and `O` sub totals (BR-E-10, BR-AE-10, BR-IC-10, BR-G-10, BR-O-10).

### Amount precision

EN 16931 requires every monetary amount (`cbc:TaxAmount`, `cbc:TaxableAmount`, `cbc:LineExtensionAmount`, the `cac:LegalMonetaryTotal` amounts, allowance/charge amounts, ...) to have at most two decimals. `invoiceToPeppolUBL` and `creditNoteToPeppolUBL` enforce this: an amount with more than two decimals throws an error naming the offending field instead of being silently rounded.

```typescript
toolkit.invoiceToPeppolUBL({ ...invoice, taxTotal: [{ ..., subTotals: [{ taxAmount: 52.605, ... }] }] });
// RangeError: Invalid amount for "taxTotal[0].subTotals[0].taxAmount": 52.605 has more than 2 decimal places. ...
```

The unit price fields are intentionally excluded and keep their full precision (serialized in fixed-point notation): the line price (`cac:Price/cbc:PriceAmount`) and the unit price discount and gross price (`priceAllowanceCharge.amount` / `.baseAmount` → `cac:Price/cac:AllowanceCharge/cbc:Amount` and `cbc:BaseAmount`). Line-level and document-level allowances/charges remain limited to two decimals. The builder also checks BR-CO-14 before serializing: each `taxTotal[].taxAmount` must equal the sum of its `subTotals[].taxAmount`, otherwise a descriptive error is thrown. Parsing received documents is never affected by these checks.

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

`exampleEn16931Invoice` and `exampleEn16931CreditNote` are EN 16931 documents to a consumer (buyer without electronic address), to use with `invoiceToEn16931UBL` and `creditNoteToEn16931UBL`.

### Validate UBL XML with KoSIT

You can validate generated (or external) UBL XML through a running KoSIT validator service.

```typescript
import { PeppolToolkit, exampleInvoice } from '@pixeldrive/peppol-toolkit';

const toolkit = new PeppolToolkit();
const xml = toolkit.invoiceToPeppolUBL(exampleInvoice);

const result = await toolkit.validateWithKosit(xml, {
    endpoint: 'http://localhost:8081/',
});

console.log(result.valid); // true | false
console.log(result.errors); // validation errors
console.log(result.warnings); // validation warnings
```

Notes:

- Default endpoint is `http://localhost:8081/`.
- Requests are sent as `POST` with `Content-Type: application/xml`.
- Some KoSIT deployments can return HTTP `406` together with an XML report for invalid documents; this toolkit still parses that report and returns structured `errors`/`warnings`.
- The Peppol BIS configuration only validates Peppol documents. EN 16931 documents (`invoiceToEn16931UBL`, `creditNoteToEn16931UBL`) need a configuration with an EN 16931 (CEN) scenario, such as the one started by `npm run kosit:start:en16931`.

## API Reference

### `PeppolToolkit`

The main class that provides invoice and credit note conversion functionality.

#### Instance Methods

| Method                                                                                            | Description                                                                  |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `invoiceToPeppolUBL(invoice: Invoice): string`                                                    | Converts an `Invoice` object to a PEPPOL-compliant UBL XML string            |
| `creditNoteToPeppolUBL(creditNote: CreditNote): string`                                           | Converts a `CreditNote` object to a PEPPOL-compliant UBL XML string          |
| `peppolUBLToInvoice(xml: string): Invoice`                                                        | Parses a PEPPOL UBL XML string into an `Invoice` object                      |
| `peppolUBLToCreditNote(xml: string): CreditNote`                                                  | Parses a PEPPOL UBL XML string into a `CreditNote` object                    |
| `invoiceToEn16931UBL(invoice: En16931Invoice): string`                                            | Converts an `En16931Invoice` object to an EN 16931 UBL XML string            |
| `creditNoteToEn16931UBL(creditNote: En16931CreditNote): string`                                   | Converts an `En16931CreditNote` object to an EN 16931 UBL XML string         |
| `en16931UBLToInvoice(xml: string): En16931Invoice`                                                | Parses an EN 16931 (or PEPPOL) UBL XML string into an `En16931Invoice`       |
| `en16931UBLToCreditNote(xml: string): En16931CreditNote`                                          | Parses an EN 16931 (or PEPPOL) UBL XML string into an `En16931CreditNote`    |
| `validateWithKosit(xml: string, options?: KositValidatorOptions): Promise<KositValidationResult>` | Sends XML to a KoSIT validator service and returns parsed validation outcome |

#### Static Helpers

| Helper                                                      | Description                                                                                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PeppolToolkit.computeTotals(items: UBLLineItem[]): Totals` | Calculates line totals, the VAT breakdown per category code and rate (`vatBreakdown`), tax amounts (total and per rate) and grand total following EN 16931 rules |
| `PeppolToolkit.getEASFromTaxId(taxId: string): string`      | Returns the EAS scheme code for a country-prefixed VAT number                                                                                                    |
| `PeppolToolkit.detectUblProfile(xml: string): UblProfile`   | Returns `'peppol-bis3'`, `'en16931'` or `'unknown'` according to the `cbc:CustomizationID` of a UBL document                                                     |

### `createToolkit()`

Factory function that creates a new instance of `PeppolToolkit`. Equivalent to `new PeppolToolkit()`.

```typescript
import { createToolkit } from '@pixeldrive/peppol-toolkit';

const toolkit = createToolkit();
```

### `KositValidator` and Related Types

Also exported for direct use:

- `KositValidator`
- `KositValidatorOptions`
- `KositValidationResult`
- `KositValidationMessage`

## Code lists

The Peppol code lists follow **Peppol BIS Billing 3.0.21**. The EN 16931 schemas follow the CEN 1.3.17 rules for electronic address schemes (BR-CL-25), party identification schemes (BR-CL-10) and document type codes (BR-CL-01). The EN 16931 document type schemas are exported as `En16931InvoiceTypeCodeSchema` and `En16931CreditNoteTypeCodeSchema`.

| Code list                                   | Export                 | Follows                                                                                                  |
| ------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Electronic address schemes (Peppol)         | `EASCodes`             | Peppol BIS Billing 3.0.21 (`PEPPOL-EN16931-CL008`)                                                       |
| Electronic address schemes (EN 16931)       | `CefEASCodes`          | BR-CL-25 of the EN 16931 validation artefacts 1.3.17: CEF EAS code list version 17.0, without `XA` (yet) |
| Party identifier schemes (ISO 6523 ICD)     | `ICDCodes`             | Peppol BIS Billing 3.0.21, plus `SEPA` for the seller (BT-90)                                            |
| Currencies (ISO 4217)                       | `CurrencyCodes`        | Peppol BIS Billing 3.0.21                                                                                |
| Countries (ISO 3166-1 alpha-2)              | `CountryCodes`         | Peppol BIS Billing 3.0.21                                                                                |
| Invoice type codes (UNCL1001)               | `InvoiceTypeCodes`     | Peppol BIS Billing 3.0.21                                                                                |
| Credit note type codes (UNCL1001)           | `CreditNoteTypeCodes`  | Peppol BIS Billing 3.0.21                                                                                |
| Payment means (UNCL4461)                    | `PaymentMeansCodes`    | Peppol BIS Billing 3.0.21                                                                                |
| VAT categories (UNCL5305)                   | `DutyTaxFeeCategories` | Peppol BIS Billing 3.0.21                                                                                |
| Units of measure (UN/ECE Recommendation 20) | `UnitCodes`            | Peppol BIS Billing 3.0.21                                                                                |

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
- [x] Enable online validation against remote services
- [ ] Support attachments/binary objects embedding (e.g., PDF)
- [ ] CLI: Convert JSON invoices to UBL XML
- [x] Documentation: Examples and recipe-style guides
- [ ] QA: Expand unit tests

Last updated: 2026-05-13

## Development Scripts

- `npm run build` - Build the library
- `npm run dev` - Build in watch mode for development
- `npm run test` - Run tests
- `npm run test:e2e` - Run the KoSIT end-to-end tests (see below)
- `npm run kosit:start` - Download and start a local KoSIT validator (Java 17+)
- `npm run kosit:start:en16931` - Download and start a local KoSIT validator for EN 16931 documents (Java 17+)
- `npm run lint` - Lint the codebase
- `npm run format` - Format code with Prettier

### KoSIT end-to-end tests

The `e2e/kosit` suite generates complete invoices and credit notes and submits them to a real [KoSIT validator](https://github.com/itplr-kosit/validator) loaded with the [Peppol BIS Billing 3 configuration](https://github.com/itplr-kosit/validator-configuration-bis).

- `e2e/kosit/cases/valid.ts` – documents that must be accepted
- `e2e/kosit/cases/invalid.ts` – documents that must be rejected, each with the rule(s) expected in the report (e.g. `BR-CO-15`)

```bash
npm run kosit:start   # terminal 1 – downloads into .kosit/ on first run, listens on :8081
npm run test:e2e      # terminal 2
```

Set `KOSIT_ENDPOINT` to target another instance. Generated XML and KoSIT reports are written to `e2e/output/` for inspection. The suite runs in CI through `.github/workflows/kosit.yml`.

EN 16931 documents are validated by a second, opt-in suite (`e2e/kosit/cases/en16931.ts`), since the Peppol BIS configuration rejects them. It needs a KoSIT validator with an EN 16931 (CEN) scenario: `npm run kosit:start:en16931` assembles one from the [EN 16931 validation artefacts](https://github.com/ConnectingEurope/eInvoicing-EN16931) of CEN/TC 434 (BR-62, BR-63 and BR-CL-25 included) and `scripts/kosit-en16931-scenarios.xml`. The suite only runs when `KOSIT_EN16931_ENDPOINT` is set:

```bash
npm run kosit:start:en16931                                    # terminal 3 – listens on :8082
KOSIT_EN16931_ENDPOINT=http://localhost:8082/ npm run test:e2e # terminal 2
```

`KOSIT_CEN_VERSION` (default `1.3.17`) and `KOSIT_EN16931_PORT` (default `8082`) configure that validator.

### Releasing

Pushing a new `version` in `package.json` to `main` publishes it to npm (`.github/workflows/publish.yml`). The workflow publishes each version once. For a canary, use a prerelease version such as `0.10.0-canary.0` and set `publishConfig.tag` to `canary`. For a stable release, set a stable version and remove `publishConfig.tag` in the same commit to publish under `latest`.

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
