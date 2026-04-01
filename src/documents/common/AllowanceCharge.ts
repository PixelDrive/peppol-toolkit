import { z } from 'zod';
import { CurrencyCodeSchema } from './CurrencyCodes';
import { DutyTaxFeeCategoryCodeSchema } from './TaxCategory';

/**
 * Document level allowance or charge (BG-20, BG-21)
 * @see https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AllowanceCharge/
 */
export const allowanceChargeSchema = z.object({
    /** Use true for charges, false for allowances */
    chargeIndicator: z.boolean(),
    reasonCode: z.string().optional(),
    reason: z.string().optional(),
    /** Percentage used to calculate the amount */
    multiplierFactorNumeric: z.number().min(0).optional(),
    /** Amount without VAT */
    amount: z.number(),
    /** Currency for amount fields – defaults to document currency when omitted */
    currency: CurrencyCodeSchema.optional(),
    /** Base amount used with percentage to calculate the amount */
    baseAmount: z.number().optional(),
    /** VAT category applied to this allowance/charge */
    taxCategory: z.object({
        categoryCode: DutyTaxFeeCategoryCodeSchema,
        percent: z.number().min(0).max(100).optional(),
    }),
});

/**
 * Invoice line level allowance or charge (BG-27, BG-28)
 * Same as document level but without tax category (tax is on the line item)
 * @see https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/cac-AllowanceCharge/
 */
export const lineAllowanceChargeSchema = z.object({
    /** Use true for charges, false for allowances */
    chargeIndicator: z.boolean(),
    reasonCode: z.string().optional(),
    reason: z.string().optional(),
    /** Percentage used to calculate the amount */
    multiplierFactorNumeric: z.number().min(0).optional(),
    /** Amount without VAT */
    amount: z.number(),
    /** Currency for amount fields – defaults to document/line currency when omitted */
    currency: CurrencyCodeSchema.optional(),
    /** Base amount used with percentage to calculate the amount */
    baseAmount: z.number().optional(),
});
