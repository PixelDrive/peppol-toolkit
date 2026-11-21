import Decimal from 'decimal.js';

/**
 * Maximum number of decimals allowed for a monetary amount in EN 16931 / PEPPOL BIS Billing 3.0
 */
export const MAX_AMOUNT_DECIMALS = 2;

/**
 * Formats a monetary amount for serialization in a UBL document.
 *
 * Amounts must already be rounded to two decimals (EN 16931). Instead of silently
 * rounding with `toFixed(2)` (which uses the binary floating-point value and is not
 * half-up), an amount with more than two decimals is rejected with a descriptive error
 * naming the offending field.
 *
 * This is intentionally NOT used for the line price (`cac:Price/cbc:PriceAmount`) which may
 * carry more precision, nor for quantities.
 * @param field The path of the field in the input document (used in the error message)
 * @param amount The amount to format
 * @returns The amount formatted with exactly two decimals
 */
export const formatAmount = (field: string, amount: number): string => {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
        throw new TypeError(
            `Invalid amount for "${field}": expected a finite number but received ${String(amount)}`
        );
    }
    const decimal = new Decimal(amount);
    if (decimal.decimalPlaces() > MAX_AMOUNT_DECIMALS) {
        throw new RangeError(
            `Invalid amount for "${field}": ${decimal.toString()} has more than ${MAX_AMOUNT_DECIMALS} decimal places. ` +
                'Monetary amounts must be rounded to 2 decimals (EN 16931), e.g. with ' +
                'new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP) or by using the amounts returned by computeTotals.'
        );
    }
    return decimal.toFixed(MAX_AMOUNT_DECIMALS);
};
