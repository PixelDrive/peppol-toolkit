/**
 * Electronic Address Scheme (EAS) codes as used in PEPPOL networks
 * These codes identify the scheme used for electronic addresses of parties
 *
 * Follows the EAS code list of Peppol BIS Billing 3.0.21 (PEPPOL-EN16931-CL008), a subset of the
 * CEF EAS code list (`CefEASCodes`) accepted by EN 16931 documents.
 * @see https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/
 */
import { z } from 'zod';

export const EASCodes = {
    '0002': 'System Information et Repertoire des Entreprise et des Etablissements: SIRENE',
    '0007': 'Organisationsnummer (Swedish legal entities)',
    '0009': 'SIRET-CODE',
    '0060': 'Data Universal Numbering System (D-U-N-S Number)',
    '0088': 'Global Location Number',
    '0096': 'The Danish Business Authority - P-number (DK:P)',
    '0097': 'FTI - Ediforum Italia, (EDIRA compliant)',
    '0106': 'Vereniging van Kamers van Koophandel en Fabrieken in Nederland (Association of Chambers of Commerce and Industry in the Netherlands), Scheme (EDIRA compliant)',
    '0130': 'Directorates of the European Commission',
    '0135': 'SIA Object Identifiers',
    '0142': 'SECETI Object Identifiers',
    '0151': 'Australian Business Number (ABN) Scheme',
    '0158': 'Identification number of economic subject (ICO) Act on State Statistics of 29 November 2001, § 27',
    '0183': "Numéro d'identification suisse des enterprises (IDE), Swiss Unique Business Identification Number (UIDB)",
    '0184': 'The Danish Business Authority - CVR-number (DK:CVR)',
    '0188': 'Corporate Number of The Social Security and Tax Number System',
    '0190': 'Organisatie-identificatienummer (OIN)',
    '0191': 'Company code',
    '0192': 'Organisasjonsnummer',
    '0195': 'Singapore Nationwide E-Invoice Framework',
    '0196': 'Icelandic identifier',
    '0198': 'The Danish Business Authority - SE-number (DK:SE)',
    '0199': 'Legal Entity Identifier (LEI)',
    '0200': 'Legal entity code (Lithuania)',
    '0201': 'Codice Univoco Unità Organizzativa iPA',
    '0204': 'Peppol-Leitweg-ID',
    '0208': "Numero d'entreprise / ondernemingsnummer / Unternehmensnummer",
    '0209': 'GS1 identification keys',
    '0210': 'CODICE FISCALE',
    '0211': 'PARTITA IVA',
    '0216': 'OVTcode',
    '0218': 'Unified registration number (Latvia)',
    '0221': 'The registered number of the qualified invoice issuer (Japan)',
    '0225': 'FRCTC ELECTRONIC ADDRESS',
    '0230': 'National e-Invoicing Framework (Malaysia)',
    '0235': 'UAE Tax Identification Number (TIN)',
    '0240': 'Register of legal persons (in French : Répertoire des personnes morales)',
    '0242': 'OpenPeppol Service Provider Identification Scheme (SPIS)',
    '0244': 'Tax Identification (Tax ID), Nigeria',
    '0245': 'Tax identification number (DIČ), Slovakia',
    '0246': 'German Electronic Business Address',
    '0248': 'Oman Value Added Tax Identification Number (VATIN)',
    '9910': 'Hungary VAT number',
    '9913': 'Business Registers Network',
    '9914': 'Österreichische Umsatzsteuer-Identifikationsnummer',
    '9915': 'Österreichisches Verwaltungs bzw. Organisationskennzeichen',
    '9918': 'SOCIETY FOR WORLDWIDE INTERBANK FINANCIAL, TELECOMMUNICATION S.W.I.F.T',
    '9919': 'Kennziffer des Unternehmensregisters',
    '9920': 'Agencia Española de Administración Tributaria',
    '9922': 'Andorra VAT number',
    '9923': 'Albania VAT number',
    '9924': 'Bosnia and Herzegovina VAT number',
    '9925': 'Belgium VAT number',
    '9926': 'Bulgaria VAT number',
    '9927': 'Switzerland VAT number',
    '9928': 'Cyprus VAT number',
    '9929': 'Czech Republic VAT number',
    '9930': 'Germany VAT number',
    '9931': 'Estonia VAT number',
    '9932': 'United Kingdom VAT number',
    '9933': 'Greece VAT number',
    '9934': 'Croatia VAT number',
    '9935': 'Ireland VAT number',
    '9936': 'Liechtenstein VAT number',
    '9937': 'Lithuania VAT number',
    '9938': 'Luxemburg VAT number',
    '9939': 'Latvia VAT number',
    '9940': 'Monaco VAT number',
    '9941': 'Montenegro VAT number',
    '9942': 'Macedonia, the former Yugoslav Republic of VAT number',
    '9943': 'Malta VAT number',
    '9944': 'Netherlands VAT number',
    '9945': 'Poland VAT number',
    '9946': 'Portugal VAT number',
    '9947': 'Romania VAT number',
    '9948': 'Serbia VAT number',
    '9949': 'Slovenia VAT number',
    '9950': 'Slovakia VAT number',
    '9951': 'San Marino VAT number',
    '9952': 'Turkey VAT number',
    '9953': 'Holy See (Vatican City State) VAT number',
    '9957': 'French VAT number',
    '9959': 'US Employer ID Number',
} as const;

export type EASCode = keyof typeof EASCodes;

/**
 * Get the description of an EAS code
 * @param code The EAS code to get the description for
 * @returns The description of the EAS code
 */
export function getEASDescription(code: EASCode): string {
    return EASCodes[code];
}

/**
 * Check if a given code is a valid EAS code
 * @param code The code to check
 */
export function isValidEASCode(code: string): code is EASCode {
    return code in EASCodes;
}

/**
 * Mapping of country codes to their default VAT-related EAS codes
 * @see https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/
 */
const CountryVATScheme: Record<string, EASCode> = {
    AD: '9922', // Andorra VAT number
    AL: '9923', // Albania VAT number
    AT: '9914', // Österreichische Umsatzsteuer-Identifikationsnummer
    BA: '9924', // Bosnia and Herzegovina VAT number
    BE: '9925', // Belgium VAT number
    BG: '9926', // Bulgaria VAT number
    CH: '9927', // Switzerland VAT number
    CY: '9928', // Cyprus VAT number
    CZ: '9929', // Czech Republic VAT number
    DE: '9930', // Germany VAT number
    EE: '9931', // Estonia VAT number
    ES: '9920', // Agencia Española de Administración Tributaria
    // FI: none since BIS 3.0.21, which removed 0213 (Finnish Organization Value Add Tax Identifier)
    FR: '9957', // French VAT number
    GB: '9932', // United Kingdom VAT number
    GR: '9933', // Greece VAT number
    HR: '9934', // Croatia VAT number
    HU: '9910', // Hungary VAT number
    IE: '9935', // Ireland VAT number
    IT: '0211', // PARTITA IVA
    LI: '9936', // Liechtenstein VAT number
    LT: '9937', // Lithuania VAT number
    LU: '9938', // Luxemburg VAT number
    LV: '9939', // Latvia VAT number
    MC: '9940', // Monaco VAT number
    ME: '9941', // Montenegro VAT number
    MK: '9942', // Macedonia, the former Yugoslav Republic of VAT number
    MT: '9943', // Malta VAT number
    NL: '9944', // Netherlands VAT number
    PL: '9945', // Poland VAT number
    PT: '9946', // Portugal VAT number
    RO: '9947', // Romania VAT number
    RS: '9948', // Serbia VAT number
    SI: '9949', // Slovenia VAT number
    SK: '9950', // Slovakia VAT number
    SM: '9951', // San Marino VAT number
    TR: '9952', // Turkey VAT number
    VA: '9953', // Holy See (Vatican City State) VAT number
};

/**
 * Get the EAS code for a given tax ID
 * @param taxId The tax ID to get the EAS code for (e.g. "BE0123456789")
 * @returns The EAS code for the tax ID, or undefined if not found
 */
export function getEASFromTaxId(taxId: string): EASCode | undefined {
    const countryCode = taxId.substring(0, 2).toUpperCase();
    return CountryVATScheme[countryCode];
}

// Zod schema for EAS codes
const easCodeKeys = Object.keys(EASCodes) as unknown as [EASCode, ...EASCode[]];
export const EASCodeSchema = z.enum(easCodeKeys);
