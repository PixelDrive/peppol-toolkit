import { XMLParser } from 'fast-xml-parser';
import {
    EN16931_CUSTOMIZATION_ID,
    PEPPOL_BIS3_CUSTOMIZATION_ID,
} from '../documents';

/**
 * Specification followed by a UBL invoice or credit note, according to its
 * cbc:CustomizationID (BT-24):
 * - `peppol-bis3`: Peppol BIS Billing 3.0, see {@link PEPPOL_BIS3_CUSTOMIZATION_ID}
 * - `en16931`: EN 16931 core model, without CIUS, see {@link EN16931_CUSTOMIZATION_ID}
 * - `unknown`: anything else (another CIUS, missing CustomizationID, not a UBL Invoice or CreditNote)
 */
export type UblProfile = 'peppol-bis3' | 'en16931' | 'unknown';

const parser = new XMLParser({
    // Also recognize documents using a prefix for the root element (e.g. <ubl:Invoice>)
    removeNSPrefix: true,
    ignoreAttributes: true,
    parseTagValue: false,
});

/**
 * Detects the specification a UBL document follows, to pick the parser and the validator of a
 * stored document, or to refuse to send a document that is not a Peppol BIS document over the
 * Peppol network.
 *
 * Peppol BIS extensions (a CustomizationID starting with the Peppol one followed by `#`) are
 * detected as `peppol-bis3`. Malformed XML gives `unknown`.
 * @param xml The UBL Invoice or CreditNote XML string
 * @returns The detected profile
 */
export function detectUblProfile(xml: string): UblProfile {
    let parsed: Record<string, unknown>;
    try {
        parsed = parser.parse(xml);
    } catch {
        return 'unknown';
    }
    const root = (parsed['Invoice'] ?? parsed['CreditNote']) as
        | Record<string, unknown>
        | undefined;
    const customizationID = root?.['CustomizationID'];
    if (typeof customizationID !== 'string') return 'unknown';

    if (
        customizationID === PEPPOL_BIS3_CUSTOMIZATION_ID ||
        customizationID.startsWith(`${PEPPOL_BIS3_CUSTOMIZATION_ID}#`)
    ) {
        return 'peppol-bis3';
    }
    if (customizationID === EN16931_CUSTOMIZATION_ID) return 'en16931';
    return 'unknown';
}
