import { z } from 'zod';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { taxCategorySchema } from './TaxCategory';

// The VAT amounts can be negative, e.g. for an invoice with a returned item (valid in EN 16931 and
// Peppol BIS)
export const taxSubtotalSchema = z.object({
    taxableAmount: z.number(),
    taxAmount: z.number(),
    taxCategory: taxCategorySchema,

    // Required in the peppol specification, but we make it optional here for flexibility since
    // it is required in the parent object (taxTotal)
    taxableAmountCurrency: CurrencyCodeSchema.optional(),
    taxAmountCurrency: CurrencyCodeSchema.optional(),
});

export const taxTotalSchema = z.object({
    taxAmount: z.number(),
    taxAmountCurrency: CurrencyCodeSchema,
    subTotals: z.array(taxSubtotalSchema),
});
