import { z } from 'zod';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { taxCategorySchema } from './TaxCategory';

export const taxSubtotalSchema = z.object({
    taxableAmount: z.number().min(0),
    taxAmount: z.number().min(0),
    calculationSequence: z.number().min(1).optional(),
    taxCategory: taxCategorySchema,

    // Required in the peppol specification, but we make it optional here for flexibility since
    // it is required in the parent object (taxTotal)
    taxableAmountCurrency: CurrencyCodeSchema.optional(),
    taxAmountCurrency: CurrencyCodeSchema.optional(),
});

export const taxTotalSchema = z.object({
    taxAmount: z.number().min(0),
    taxAmountCurrency: CurrencyCodeSchema,
    subTotals: z.array(taxSubtotalSchema),
});
