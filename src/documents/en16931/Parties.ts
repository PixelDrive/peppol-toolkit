import { z } from 'zod';
import { CefEASCodeSchema } from '../common/CefEASCodes';
import { ICDCodeSchema } from '../common/ICDCodes';
import { addressSchema } from '../common/AdressSchema';
import { contactSchema } from '../common/Contact';
import { partyTaxSchemeSchema } from '../common/PartyTaxScheme';

// BR-CL-10 in the CEN validation artefacts 1.3.17 also accepts these ICD schemes.
const en16931ICDCodeSchema = z.enum([
    ...ICDCodeSchema.options,
    '0249',
    '0250',
    '0251',
]);

export const partyIdentificationSchema = z.object({
    scheme: en16931ICDCodeSchema.optional(),
    id: z.string().min(1),
});

/**
 * Seller (BG-4) or buyer (BG-7) of an EN 16931 document.
 *
 * EN 16931 does not require an electronic address: `endPoint` (BT-34, BT-49) is optional, for
 * example for a consumer. When present, its scheme must come from the CEF EAS code list
 * (BR-62, BR-63, BR-CL-25), which is wider than the Peppol one (e.g. `EM` for an e-mail address).
 */
export const en16931PartySchema = z.object({
    endPoint: z
        .object({
            scheme: CefEASCodeSchema,
            id: z.string().min(1),
        })
        .optional(),
    identification: partyIdentificationSchema.array().optional(),
    name: z.string().min(1).optional(),
    address: addressSchema,
    taxSchemes: z.array(partyTaxSchemeSchema).min(0).max(2).optional(),
    legalEntity: z.object({
        registrationName: z.string().min(1),
        legalForm: z.string().min(1).optional(),
        companyId: z
            .object({
                id: z.string().min(1),
                schemeID: z.string().min(1).optional(),
            })
            .optional(),
    }),
    contact: contactSchema.optional(),
});

/**
 * BR-CL-10 permits SEPA only for the seller or payee creditor identifier (BT-90): the buyer
 * identifiers use the same schemes, without SEPA.
 * @param schemes The identification schemes allowed for the parties of the document
 */
export function buyerIdentificationSchema<T extends z.ZodEnum>(schemes: T) {
    return partyIdentificationSchema
        .extend({
            scheme: schemes
                .refine(
                    (scheme): boolean => scheme !== 'SEPA',
                    'SEPA is reserved for the seller or payee creditor identifier'
                )
                .optional(),
        })
        .array()
        .optional();
}

export const en16931BuyerPartySchema = en16931PartySchema.extend({
    identification: buyerIdentificationSchema(en16931ICDCodeSchema),
});
