import { z } from 'zod';
import { CurrencyCodeSchema } from '../common/CurrencyCodes';
import { date } from '../common/Date';
import { deliverySchema } from '../common/Delivery';
import { invoicePeriodSchema } from '../common/InvoicePeriodSchema';
import { legalMonetaryTotalSchema } from '../common/LegalMonetaryTotal';
import { lineSchema } from '../common/Line';
import { paymentMeansSchema } from '../common/PaymentMeans';
import { taxTotalSchema } from '../common/TaxTotal';
import { allowanceChargeSchema } from '../common/AllowanceCharge';
import { additionalDocumentReferenceSchema } from '../common/AdditionalDocumentReference';
import { payeePartySchema } from '../common/PayeeParty';
import { taxRepresentativePartySchema } from '../common/TaxRepresentativeParty';
import { En16931InvoiceTypeCodeSchema } from './DocumentTypeCodes';
import { en16931BuyerPartySchema, en16931PartySchema } from './Parties';

const billingReferenceSchema = z.object({
    invoiceDocReference: z.object({
        id: z.string(),
        issueDate: date.optional(),
    }),
});

/**
 * Invoice following the EN 16931 core model, without the Peppol CIUS: the seller and the buyer
 * may have no electronic address (see {@link en16931PartySchema}).
 *
 * The Peppol `invoiceSchema` extends this schema, so every Peppol invoice is also an EN 16931 invoice.
 */
export const en16931InvoiceSchema = z.object({
    customizationID: z.string().optional(),
    profileID: z.string().optional(),
    ID: z.string().min(1),
    issueDate: date,
    dueDate: date.optional(),
    invoiceTypeCode: En16931InvoiceTypeCodeSchema,
    note: z
        .array(
            z.object({
                content: z.string().min(1),
                languageID: z.string().min(1).optional(),
            })
        )
        .optional(),
    taxPointDate: date.optional(),
    documentCurrencyCode: CurrencyCodeSchema,
    taxCurrencyCode: CurrencyCodeSchema.optional(),
    accountingCost: z.string().optional(),
    buyerReference: z.string().optional(),
    invoicePeriod: invoicePeriodSchema.optional(),

    orderReference: z
        .object({
            id: z.string().min(1),
            salesOrderId: z.string().optional(),
        })
        .optional(),
    billingReference: z.array(billingReferenceSchema).optional(),
    despatchDocumentReference: z.string().optional(),
    receiptDocumentReference: z.string().optional(),
    originatorDocumentReference: z.string().optional(),
    contractDocumentReference: z.string().optional(),
    additionalDocumentReference: z
        .array(additionalDocumentReferenceSchema)
        .optional(),
    projectReference: z.string().optional(),

    seller: en16931PartySchema,
    buyer: en16931BuyerPartySchema,
    payeeParty: payeePartySchema.optional(),
    taxRepresentativeParty: taxRepresentativePartySchema.optional(),

    delivery: deliverySchema.optional(),
    paymentMeans: paymentMeansSchema.array().optional(),
    paymentTermsNote: z
        .string()
        .optional()
        .describe('Payment terms that apply (including penalties)'),
    allowanceCharge: z.array(allowanceChargeSchema).optional(),
    taxTotal: z.array(taxTotalSchema).min(1).max(2),
    legalMonetaryTotal: legalMonetaryTotalSchema,
    invoiceLines: z.array(lineSchema).min(1),
});

export type En16931Invoice = z.infer<typeof en16931InvoiceSchema>;
