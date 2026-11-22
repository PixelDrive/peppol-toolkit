import { DOMParser, type Element } from '@xmldom/xmldom';
import { parserOptions } from './parserOptions';

const UBL_NAMESPACE = 'urn:oasis:names:specification:ubl:schema:xsd:';
export const CBC_NAMESPACE = `${UBL_NAMESPACE}CommonBasicComponents-2`;
const CAC_NAMESPACE = `${UBL_NAMESPACE}CommonAggregateComponents-2`;

export function readUblDocument(xml: string) {
    const parser = new DOMParser({
        onError: (_level, message) => {
            throw new Error(message);
        },
    });
    const { documentElement: root } = parser.parseFromString(
        xml,
        'application/xml'
    );
    if (!root) return undefined;

    const { localName: kind, namespaceURI } = root;
    if (
        (kind === 'Invoice' || kind === 'CreditNote') &&
        namespaceURI === `${UBL_NAMESPACE}${kind}-2`
    ) {
        return { kind, root } as const;
    }
    return undefined;
}

/** Reads an element into the field shape used by the document parser. */
export function readUblFields(element: Element): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    let text = '';
    let pendingText = '';

    for (let child = element.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === child.TEXT_NODE) {
            pendingText += child.nodeValue ?? '';
        } else if (child.nodeType === child.CDATA_SECTION_NODE) {
            text += pendingText.trim() + (child.nodeValue ?? '');
            pendingText = '';
        } else if (child.nodeType === child.ELEMENT_NODE) {
            text += pendingText.trim();
            pendingText = '';
            const childElement = child as Element;
            const name = getUblFieldName(childElement);
            if (name) appendField(fields, name, childElement);
        }
    }

    for (let index = 0; index < element.attributes.length; index++) {
        const attribute = element.attributes.item(index);
        if (attribute && !attribute.namespaceURI) {
            fields[`$${attribute.localName}`] = attribute.value.trim();
        }
    }

    text += pendingText.trim();
    if (text) fields['#text'] = text;
    return fields;
}

export function getUblChild(
    fields: Record<string, unknown> | undefined,
    name: string
): Record<string, unknown> | undefined {
    const value = fields?.[name];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return undefined;
}

export function getUblChildren(
    fields: Record<string, unknown>,
    name: string
): unknown[] | undefined {
    const value = fields[name];
    return Array.isArray(value) ? value : undefined;
}

function getUblFieldName(element: Element): string | undefined {
    if (element.namespaceURI === CBC_NAMESPACE)
        return `cbc:${element.localName}`;
    if (element.namespaceURI === CAC_NAMESPACE)
        return `cac:${element.localName}`;
    return undefined;
}

function appendField(
    fields: Record<string, unknown>,
    name: string,
    element: Element
): void {
    const childFields = readUblFields(element);
    const keys = Object.keys(childFields);
    const value =
        keys.length === 0 || (keys.length === 1 && keys[0] === '#text')
            ? (childFields['#text'] ?? '')
            : childFields;
    const previous = fields[name];
    if (Array.isArray(previous)) {
        previous.push(value);
    } else if (previous !== undefined) {
        fields[name] = [previous, value];
    } else {
        fields[name] = parserOptions.isArray(name) ? [value] : value;
    }
}
