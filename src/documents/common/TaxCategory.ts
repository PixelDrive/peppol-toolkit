import { z } from 'zod';

/**
 * Duty or tax or fee category codes (subset per EN 16931 / issue request)
 * @see https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL5305/
 */
export const DutyTaxFeeCategories = {
    AE: 'Vat Reverse Charge',
    E: 'Exempt from Tax',
    S: 'Standard rate',
    Z: 'Zero rated goods',
    G: 'Free export item, VAT not charged',
    O: 'Services outside scope of tax',
    K: 'VAT exempt for EEA intra-community supply of goods and services',
    L: 'Canary Islands general indirect tax (IGIC)',
    M: 'Tax for production, services and importation in Ceuta and Melilla (IPSI)',
    B: 'Transferred (VAT), In Italy',
} as const;

export type DutyTaxFeeCategoryCode = keyof typeof DutyTaxFeeCategories;

const dutyTaxFeeCategoryKeys = Object.keys(DutyTaxFeeCategories) as unknown as [
    DutyTaxFeeCategoryCode,
    ...DutyTaxFeeCategoryCode[],
];

export const DutyTaxFeeCategoryCodeSchema = z.enum(dutyTaxFeeCategoryKeys);

export const taxCategorySchema = z.object({
    categoryCode: DutyTaxFeeCategoryCodeSchema,
    percent: z.number().min(0).max(100).optional(),
    exemptionReason: z.string().min(1).optional(),
    exemptionReasonCode: z.string().min(1).optional(),
});

export type TaxCategory = z.infer<typeof taxCategorySchema>;
