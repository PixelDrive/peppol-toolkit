import { builderOptions } from '../builder/builderOptions';

/**
 * Helper function to convert object keys to prefixed attributes
 * @param attributes Object containing attributes
 * @returns Object with prefixed attributes
 */
export default function XMLAttributes(attributes: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => [
            `${builderOptions.attributeNamePrefix}${key}`,
            value,
        ])
    );
}
