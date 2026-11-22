import { describe, expect, it } from 'vitest';
import { DocumentBuilder, exampleCreditNote, exampleInvoice } from '../src';
import { fullCreditNote, fullInvoice } from './fixtures/full-documents';

/**
 * Non-regression of the Peppol XML output: the snapshots were recorded before the
 * serialization was shared with the EN 16931 builder and must not change by a
 * single byte. Update them only for an intended change of the Peppol output.
 */
describe('Peppol UBL output', () => {
    const builder = new DocumentBuilder();

    it('example invoice', async () => {
        await expect(
            builder.generatePeppolInvoice(exampleInvoice)
        ).toMatchFileSnapshot('./__snapshots__/peppol-example-invoice.xml');
    });

    it('example credit note', async () => {
        await expect(
            builder.generatePeppolCreditNote(exampleCreditNote)
        ).toMatchFileSnapshot('./__snapshots__/peppol-example-creditnote.xml');
    });

    it('invoice using every supported element', async () => {
        await expect(
            builder.generatePeppolInvoice(fullInvoice)
        ).toMatchFileSnapshot('./__snapshots__/peppol-full-invoice.xml');
    });

    it('credit note using every supported element', async () => {
        await expect(
            builder.generatePeppolCreditNote(fullCreditNote)
        ).toMatchFileSnapshot('./__snapshots__/peppol-full-creditnote.xml');
    });
});
