import { z } from 'zod';
import { CurrencyCodeSchema } from './CurrencyCodes';

export const legalMonetaryTotalSchema = z.object({
    // Not in the peppol specification, but we make it mandatory here for flexibility
    currency: CurrencyCodeSchema,
    lineExtensionAmount: z.number(),
    taxExclusiveAmount: z.number(),
    taxInclusiveAmount: z.number(),
    payableAmount: z.number(),
    payableRoundingAmount: z.number().optional(),
    prepaidAmount: z.number().optional(),
    allowanceTotalAmount: z.number().optional(),
    chargeTotalAmount: z.number().optional(),

    // Mandatory in the peppol specification, but we make it optional since currency is mandatory in this object
    lineExtensionAmountCurrency: CurrencyCodeSchema.optional(),
    taxExclusiveAmountCurrency: CurrencyCodeSchema.optional(),
    taxInclusiveAmountCurrency: CurrencyCodeSchema.optional(),
    payableAmountCurrency: CurrencyCodeSchema.optional(),
    prepaidAmountCurrency: CurrencyCodeSchema.optional(),
    allowanceTotalAmountCurrency: CurrencyCodeSchema.optional(),
    chargeTotalAmountCurrency: CurrencyCodeSchema.optional(),
    payableRoundingAmountCurrency: CurrencyCodeSchema.optional(),
});
