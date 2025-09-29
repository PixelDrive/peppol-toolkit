import { XmlBuilderOptions } from 'fast-xml-parser';

export const builderOptions = {
    attributeNamePrefix: '$',
    ignoreAttributes: false,
    format: true,
} satisfies XmlBuilderOptions;
