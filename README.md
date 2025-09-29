# @pixeldrive/netfly-sdk-js

Unofficial JavaScript/TypeScript SDK for interacting with the Netfly API. Ships with dual ESM and CommonJS builds and first-class TypeScript typings.

Important: This project is an independent, community-maintained SDK. It is not affiliated with, endorsed by, or sponsored by Netfly. All product names, logos, and brands are property of their respective owners.

## Features

- ESM and CommonJS builds for broad compatibility
- Written in TypeScript with bundled type definitions
- Simple client factory to get started quickly

## Installation

npm install @pixeldrive/netfly-sdk-js

## Quick start

- ESM

```ts
import { NetflyClient } from '@pixeldrive/netfly-sdk-js'

const client = new NetflyClient({ baseUrl: 'https://api.netfly.example', apiKey: 'YOUR_API_KEY' })
```


- CommonJS
```ts
const { NetflyClient } = require('@pixeldrive/netfly-sdk-js')

const client = new NetflyClient({ baseUrl: 'https://api.netfly.example', apiKey: 'YOUR_API_KEY' })
```


## Scripts

- Build: npm run build
- Dev (watch): npm run dev
- Test: npm run test

## Requirements

- Node.js 18+ recommended
- Works in TypeScript and JavaScript projects

## Contributing

Contributions are welcome! Please open an issue or PR with your proposal.

## License

MIT

## Disclaimer

This software is provided "as is" without warranty of any kind. This project is not affiliated with Netfly. Use at your own risk.