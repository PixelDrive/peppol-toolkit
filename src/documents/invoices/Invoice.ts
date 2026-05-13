import { InvoiceTypeCodeSchema } from './InvoiceTypeCodes';
import { z } from 'zod';
import {
    CurrencyCodeSchema,
    date,
    deliverySchema,
    invoicePeriodSchema,
    legalMonetaryTotalSchema,
    lineSchema,
    partySchema,
    paymentMeansSchema,
    taxTotalSchema,
    allowanceChargeSchema,
    additionalDocumentReferenceSchema,
    payeePartySchema,
    taxRepresentativePartySchema,
} from '../common';

const billingReferenceSchema = z.object({
    invoiceDocReference: z.object({
        id: z.string(),
        issueDate: date.optional(),
    }),
});

export const invoiceSchema = z.object({
    customizationID: z.string().optional(),
    profileID: z.string().optional(),
    ID: z.string().min(1),
    issueDate: date,
    dueDate: date.optional(),
    invoiceTypeCode: InvoiceTypeCodeSchema,
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

    seller: partySchema,
    buyer: partySchema,
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

export type Invoice = z.infer<typeof invoiceSchema>;
