import { z } from 'zod';
import { date } from './Date';
import { CountryCodeSchema } from './CountryCodes';
import { taxCategorySchema } from './TaxCategory';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { UnitCodeSchema } from './UnitCodes';

export const lineSchema = z.object({
    id: z.string().min(1),
    note: z.string().optional(),
    invoicedQuantity: z.number().min(0),
    lineExtensionAmount: z.number().min(0),
    accountingCost: z.string().optional(),
    invoicePeriod: z
        .object({
            startDate: date.optional(),
            endDate: date.optional(),
        })
        .optional(),
    orderLineReference: z.string().optional(),
    documentReference: z.string().optional(),
    //TODO: add AllowanceCharge
    name: z.string(),
    description: z.string().optional(),
    buyersItemIdentification: z.string().optional(),
    sellersItemIdentification: z.string().optional(),
    standardItemIdentification: z.string().optional(),
    originCountry: CountryCodeSchema.optional(),
    //TODO: add item classification
    taxCategory: taxCategorySchema.pick({
        categoryCode: true,
        percent: true,
    }),
    additionalItemProperties: z.record(z.string(), z.any()).optional(),
    price: z.number().min(0),
    currency: CurrencyCodeSchema,
    //TODO: add price allowance and baseQT
    unitCode: UnitCodeSchema,
});
