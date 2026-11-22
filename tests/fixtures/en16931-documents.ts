import {
    EN16931_CUSTOMIZATION_ID,
    En16931CreditNote,
    En16931Invoice,
    exampleEn16931CreditNote,
    exampleEn16931Invoice,
} from '../../src';

type Party = En16931Invoice['seller'];

/** A party whose electronic address is an e-mail address (CEF EAS `EM`, not allowed in Peppol) */
export const emailSeller: Party = {
    ...exampleEn16931Invoice.seller,
    endPoint: { scheme: 'EM', id: 'billing@example.com' },
};

/** A party whose electronic address uses a scheme removed from the Peppol EAS list in BIS 3.0.21 */
export const slovakBuyer: Party = {
    endPoint: { scheme: '0154', id: '12345678' },
    legalEntity: { registrationName: 'Firma s.r.o.' },
    address: { cityName: 'Bratislava', postalZone: '81101', country: 'SK' },
};

/** The example seller, without electronic address */
export const sellerWithoutEndpoint: Party = {
    ...exampleEn16931Invoice.seller,
    endPoint: undefined,
};

/**
 * The example EN 16931 invoice with every value that the parser reads back from the XML made
 * explicit (customization ID and currencies), so that a build and parse round trip gives it back
 * unchanged.
 */
export function roundTripInvoice(
    overrides: Partial<En16931Invoice> = {}
): En16931Invoice {
    return {
        ...exampleEn16931Invoice,
        customizationID: EN16931_CUSTOMIZATION_ID,
        taxTotal: [
            {
                taxAmount: 21,
                taxAmountCurrency: 'EUR',
                subTotals: [
                    {
                        taxableAmount: 100,
                        taxableAmountCurrency: 'EUR',
                        taxAmount: 21,
                        taxAmountCurrency: 'EUR',
                        taxCategory: { categoryCode: 'S', percent: 21 },
                    },
                ],
            },
        ],
        legalMonetaryTotal: {
            currency: 'EUR',
            lineExtensionAmount: 100,
            lineExtensionAmountCurrency: 'EUR',
            taxExclusiveAmount: 100,
            taxExclusiveAmountCurrency: 'EUR',
            taxInclusiveAmount: 121,
            taxInclusiveAmountCurrency: 'EUR',
            payableAmount: 121,
            payableAmountCurrency: 'EUR',
        },
        ...overrides,
    };
}

/** Same as {@link roundTripInvoice} for the example EN 16931 credit note */
export function roundTripCreditNote(
    overrides: Partial<En16931CreditNote> = {}
): En16931CreditNote {
    return {
        ...exampleEn16931CreditNote,
        customizationID: EN16931_CUSTOMIZATION_ID,
        taxTotal: [
            {
                taxAmount: 10.5,
                taxAmountCurrency: 'EUR',
                subTotals: [
                    {
                        taxableAmount: 50,
                        taxableAmountCurrency: 'EUR',
                        taxAmount: 10.5,
                        taxAmountCurrency: 'EUR',
                        taxCategory: { categoryCode: 'S', percent: 21 },
                    },
                ],
            },
        ],
        legalMonetaryTotal: {
            currency: 'EUR',
            lineExtensionAmount: 50,
            lineExtensionAmountCurrency: 'EUR',
            taxExclusiveAmount: 50,
            taxExclusiveAmountCurrency: 'EUR',
            taxInclusiveAmount: 60.5,
            taxInclusiveAmountCurrency: 'EUR',
            payableAmount: 60.5,
            payableAmountCurrency: 'EUR',
        },
        ...overrides,
    };
}
