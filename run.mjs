import { PeppolToolkit, exempleInvoice } from './dist/index.mjs';
import * as fs from 'node:fs';

const tk = new PeppolToolkit();

const xml = tk.invoiceToPeppolUBL(exempleInvoice);

console.log(xml);
fs.writeFileSync('./test.xml', xml);
