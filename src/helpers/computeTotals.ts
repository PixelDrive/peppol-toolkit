import Decimal from 'decimal.js';
import type { DutyTaxFeeCategoryCode } from '../documents/common/TaxCategory';

export type UBLLineItem = {
    price: number | Decimal | string;
    quantity: number | Decimal | string;
    taxPercent: number | Decimal | string;
    /** VAT category code of the line (UNCL5305, e.g. 'S', 'Z', 'E', 'AE'). Defaults to 'S' */
    taxCategoryCode?: DutyTaxFeeCategoryCode;
};

/**
 * One VAT breakdown (BG-23) entry: a distinct combination of VAT category code and VAT rate
 */
export type VATBreakdownEntry = {
    categoryCode: DutyTaxFeeCategoryCode;
    /** Canonical VAT rate (21, '21' and '21.0' all give 21) */
    percent: number;
    /** Sum of the rounded line extension amounts of the group */
    taxableAmount: Decimal;
    /** taxableAmount × percent / 100, rounded half-up to two decimals (BR-CO-17) */
    taxAmount: Decimal;
};

const DEFAULT_TAX_CATEGORY_CODE: DutyTaxFeeCategoryCode = 'S';

/**
 * Compute the totals of a list of items based on their base price and invoicedQuantity following EN16931 rules
 *
 * The lines are grouped into one VAT breakdown per distinct combination of VAT category code and
 * (canonical) VAT rate (Peppol BIS 3.0 §8.3). The VAT of each group is computed on the rounded taxable
 * amount of the group and rounded to two decimals (ROUND_HALF_UP, BR-CO-17). `taxAmount` is exactly
 * the sum of those rounded group amounts (BR-CO-14), so `vatBreakdown` can be used as-is to build the
 * `TaxSubtotal`s of the document.
 *
 * `taxableAmountPerRate` and `taxAmountPerRate` are derived from the breakdown by summing the groups
 * that share a rate: they merge categories that share a rate (e.g. E and Z at 0%).
 * @param items
 */
export const computeTotals = <T extends UBLLineItem>(items: T[]) => {
    const itemsWithLineExtensionAmount = items.map((item) => ({
        ...item,
        lineExtensionAmount: new Decimal(item.price)
            .mul(new Decimal(item.quantity))
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    }));

    const lines = itemsWithLineExtensionAmount.map(
        (i) => i.lineExtensionAmount
    );

    const baseAmount = lines.reduce((acc, amt) => acc.add(amt), new Decimal(0));

    // Group the taxable amounts by (category code, canonical rate), keeping the first-seen order
    const groups = new Map<
        string,
        {
            categoryCode: DutyTaxFeeCategoryCode;
            rate: Decimal;
            taxable: Decimal;
        }
    >();
    items.forEach((item, i) => {
        const lineAmt = lines[i] ?? new Decimal(0);
        const categoryCode = item.taxCategoryCode ?? DEFAULT_TAX_CATEGORY_CODE;
        // Canonical rate so that 21, '21' and '21.0' end up in the same group
        const rate = new Decimal(item.taxPercent);
        const key = `${categoryCode}|${rate.toString()}`;
        const existing = groups.get(key);
        if (existing) {
            existing.taxable = existing.taxable.add(lineAmt);
        } else {
            groups.set(key, { categoryCode, rate, taxable: lineAmt });
        }
    });

    const vatBreakdown: VATBreakdownEntry[] = [];
    const taxableAmountPerRate = new Map<string, Decimal>();
    const taxAmountPerRate = new Map<string, Decimal>();
    let taxAmount = new Decimal(0);
    for (const { categoryCode, rate, taxable } of groups.values()) {
        const groupTax = taxable
            .mul(rate)
            .div(100)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        vatBreakdown.push({
            categoryCode,
            percent: rate.toNumber(),
            taxableAmount: taxable,
            taxAmount: groupTax,
        });
        taxAmount = taxAmount.add(groupTax);

        const rateKey = rate.toString();
        taxableAmountPerRate.set(
            rateKey,
            (taxableAmountPerRate.get(rateKey) ?? new Decimal(0)).add(taxable)
        );
        taxAmountPerRate.set(
            rateKey,
            (taxAmountPerRate.get(rateKey) ?? new Decimal(0)).add(groupTax)
        );
    }

    return {
        baseAmount,
        taxAmount,
        vatBreakdown,
        taxableAmountPerRate,
        taxAmountPerRate,
        totalAmount: baseAmount.add(taxAmount),
        itemsWithLineExtensionAmount,
    };
};
