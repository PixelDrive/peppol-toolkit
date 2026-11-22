import {
    EN16931_CUSTOMIZATION_ID,
    PEPPOL_BIS3_CUSTOMIZATION_ID,
} from '../documents';
import { CBC_NAMESPACE, readUblDocument } from './readUblDocument';

/**
 * Specification followed by a UBL invoice or credit note, according to its
 * cbc:CustomizationID (BT-24):
 * - `peppol-bis3`: Peppol BIS Billing 3.0, see {@link PEPPOL_BIS3_CUSTOMIZATION_ID}
 * - `en16931`: EN 16931 core model, without CIUS, see {@link EN16931_CUSTOMIZATION_ID}
 * - `unknown`: anything else (another CIUS, missing CustomizationID, not a UBL Invoice or CreditNote)
 */
export type UblProfile = 'peppol-bis3' | 'en16931' | 'unknown';

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
    let parsed: ReturnType<typeof readUblDocument>;
    try {
        parsed = readUblDocument(xml);
    } catch {
        return 'unknown';
    }
    if (!parsed) return 'unknown';

    const { root } = parsed;
    const identifiers = root.getElementsByTagNameNS(
        CBC_NAMESPACE,
        'CustomizationID'
    );
    let customizationID: string | undefined;
    for (let index = 0; index < identifiers.length; index++) {
        const identifier = identifiers.item(index);
        if (!identifier || identifier.parentNode !== root) continue;
        if (
            customizationID !== undefined ||
            identifier.getElementsByTagName('*').length > 0
        ) {
            return 'unknown';
        }
        customizationID = identifier.textContent?.trim() ?? '';
    }
    if (!customizationID) return 'unknown';

    if (
        customizationID === PEPPOL_BIS3_CUSTOMIZATION_ID ||
        customizationID.startsWith(`${PEPPOL_BIS3_CUSTOMIZATION_ID}#`)
    ) {
        return 'peppol-bis3';
    }
    if (customizationID === EN16931_CUSTOMIZATION_ID) return 'en16931';
    return 'unknown';
}
