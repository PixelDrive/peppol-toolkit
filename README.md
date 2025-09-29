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

## Development Status

⚠️ **Early Development**: This project is currently in early development. The Invoice type definitions and full feature set are still being implemented. Contributions and feedback are welcome!

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
