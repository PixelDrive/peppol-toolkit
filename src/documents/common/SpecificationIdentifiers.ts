/**
 * Specification identifier (cbc:CustomizationID, BT-24) of a Peppol BIS Billing 3.0 document
 * @see https://docs.peppol.eu/poacc/billing/3.0/bis/#_specification_identifier
 */
export const PEPPOL_BIS3_CUSTOMIZATION_ID =
    'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';

/**
 * Business process type (cbc:ProfileID, BT-23) of the Peppol BIS Billing 3.0 billing process (profile 01)
 * @see https://docs.peppol.eu/poacc/billing/3.0/bis/#_business_process
 */
export const PEPPOL_BIS3_PROFILE_ID =
    'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';

/**
 * Business process type (cbc:ProfileID, BT-23) of the Peppol BIS Billing 3.0 billing process with
 * a mandatory invoice response (profile 02, added in BIS 3.0.21). The receiver needs a separate SMP
 * registration for this profile.
 */
export const PEPPOL_BIS3_BILLING_WITH_RESPONSE_PROFILE_ID =
    'urn:peppol:bis:billing_with_response';

/**
 * Specification identifier (cbc:CustomizationID, BT-24) of a document following the EN 16931
 * core model, without CIUS or extension
 */
export const EN16931_CUSTOMIZATION_ID = 'urn:cen.eu:en16931:2017';
