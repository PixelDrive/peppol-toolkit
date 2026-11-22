import { DOMParser, type Element } from '@xmldom/xmldom';
import { parserOptions } from './parserOptions';

const UBL_NAMESPACE = 'urn:oasis:names:specification:ubl:schema:xsd:';
export const CBC_NAMESPACE = `${UBL_NAMESPACE}CommonBasicComponents-2`;
const CAC_NAMESPACE = `${UBL_NAMESPACE}CommonAggregateComponents-2`;

/**
 * Child elements allowed to appear more than once under a given parent element
 * in EN 16931 / Peppol BIS Billing 3.0. Repeating any other element is rejected
 * during parsing so duplicates cannot silently disappear.
 */
const REPEATABLE_CHILDREN: Record<string, ReadonlySet<string>> = {
    Invoice: new Set([
        'cbc:Note',
        'cac:BillingReference',
        'cac:AdditionalDocumentReference',
        'cac:PaymentMeans',
        'cac:AllowanceCharge',
        'cac:TaxTotal',
        'cac:InvoiceLine',
    ]),
    CreditNote: new Set([
        'cbc:Note',
        'cac:BillingReference',
        'cac:AdditionalDocumentReference',
        'cac:PaymentMeans',
        'cac:AllowanceCharge',
        'cac:TaxTotal',
        'cac:CreditNoteLine',
    ]),
    'cac:Party': new Set(['cac:PartyIdentification', 'cac:PartyTaxScheme']),
    'cac:TaxTotal': new Set(['cac:TaxSubtotal']),
    'cac:InvoiceLine': new Set(['cbc:Note', 'cac:AllowanceCharge']),
    'cac:CreditNoteLine': new Set(['cbc:Note', 'cac:AllowanceCharge']),
    'cac:Item': new Set([
        'cac:CommodityClassification',
        'cac:AdditionalItemProperty',
    ]),
};

export function readUblDocument(xml: string) {
    const parser = new DOMParser({
        onError: (_level, message) => {
            throw new Error(message);
        },
    });
    // xmldom rejects a UTF-8 BOM (kept by readFileSync(path, 'utf8')) and whitespace
    // before the XML declaration; trimStart() removes both.
    const { documentElement: root } = parser.parseFromString(
        xml.trimStart(),
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
    const parentName =
        getUblFieldName(element) ?? element.localName ?? element.tagName;
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
            if (name) appendField(fields, parentName, name, childElement);
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

function isRepeatableChild(parentName: string, childName: string): boolean {
    return REPEATABLE_CHILDREN[parentName]?.has(childName) ?? false;
}

function appendField(
    fields: Record<string, unknown>,
    parentName: string,
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
    if (previous !== undefined) {
        if (!isRepeatableChild(parentName, name)) {
            throw new Error(`Duplicate element "${name}" in "${parentName}"`);
        }
        if (Array.isArray(previous)) {
            previous.push(value);
        } else {
            fields[name] = [previous, value];
        }
    } else {
        fields[name] = parserOptions.isArray(name) ? [value] : value;
    }
}
