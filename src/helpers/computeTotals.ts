import Decimal from 'decimal.js';

export type UBLLineItem = {
    price: number | Decimal | string;
    quantity: number | Decimal | string;
    taxPercent: number | Decimal | string;
};

/**
 * Compute the totals of a list of items based on their base price and invoicedQuantity following EN16931 rules
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
    const baseAmountPerRate = new Map<string, Decimal>();
    const taxableAmountPerRate = new Map<string, Decimal>();
    items.forEach((item, i) => {
        const lineAmt = lines[i] ?? new Decimal(0);
        const rate = item.taxPercent.toString();
        const existing = baseAmountPerRate.get(rate) ?? new Decimal(0);
        baseAmountPerRate.set(rate, existing.add(lineAmt));
    });

    let taxAmount = new Decimal(0);
    for (const [rate, taxableAmount] of baseAmountPerRate) {
        const groupTax = taxableAmount
            .mul(rate)
            .div(100)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        taxableAmountPerRate.set(rate, taxableAmount);
        taxAmount = taxAmount.add(groupTax);
    }

    return {
        baseAmount,
        taxAmount,
        taxableAmountPerRate,
        totalAmount: baseAmount.add(taxAmount),
        itemsWithLineExtensionAmount,
    };
};
