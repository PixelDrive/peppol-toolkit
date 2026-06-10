import { z } from 'zod';
import { date } from './Date';
import { CountryCodeSchema } from './CountryCodes';
import { taxCategorySchema } from './TaxCategory';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { UnitCodeSchema } from './UnitCodes';
import { lineAllowanceChargeSchema } from './AllowanceCharge';

export const lineSchema = z.object({
    id: z.string().min(1),
    note: z
        .array(
            z.object({
                content: z.string().min(1),
                languageID: z.string().min(1).optional(),
            })
        )
        .optional(),
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
    documentReference: z
        .object({
            id: z.string().min(1),
            documentTypeCode: z.string().optional(),
            attachment: z
                .object({
                    embeddedDocumentBinaryObject: z.string().optional(),
                    mimeCode: z.string().optional(),
                    filename: z.string().optional(),
                    externalReference: z.string().optional(),
                })
                .optional(),
        })
        .optional(),
    allowanceCharge: z.array(lineAllowanceChargeSchema).optional(),
    name: z.string(),
    description: z.string().optional(),
    buyersItemIdentification: z.string().optional(),
    sellersItemIdentification: z.string().optional(),
    standardItemIdentification: z
        .object({
            id: z.string().min(1),
            schemeID: z.string().min(1),
        })
        .optional(),
    originCountry: CountryCodeSchema.optional(),
    commodityClassification: z
        .array(
            z.object({
                code: z.string().min(1),
                listID: z.string().min(1),
                listVersionID: z.string().optional(),
            })
        )
        .optional(),
    taxCategory: taxCategorySchema.pick({
        categoryCode: true,
        percent: true,
    }),
    additionalItemProperties: z
        .array(
            z.object({
                name: z.string().min(1),
                value: z.string().min(1),
            })
        )
        .optional(),
    price: z.number().min(0),
    currency: CurrencyCodeSchema,
    unitCode: UnitCodeSchema,
    baseQuantity: z.number().min(0).optional(),
    priceAllowanceCharge: z
        .object({
            amount: z.number(),
            /** Currency – defaults to line/document currency when omitted */
            currency: CurrencyCodeSchema.optional(),
            baseAmount: z.number().optional(),
        })
        .optional(),
});
