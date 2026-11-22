import { z } from 'zod';
import { CefEASCodeSchema } from '../common/CefEASCodes';
import { ICDCodeSchema } from '../common/ICDCodes';
import { addressSchema } from '../common/AdressSchema';
import { contactSchema } from '../common/Contact';
import { partyTaxSchemeSchema } from '../common/PartyTaxScheme';

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
    identification: z
        .object({
            scheme: ICDCodeSchema.optional(),
            id: z.string().min(1),
        })
        .array()
        .optional(),
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
