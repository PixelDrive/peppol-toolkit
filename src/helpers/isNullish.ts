export const isNullish = (value: any): value is null | undefined =>
    value === null || value === undefined;
