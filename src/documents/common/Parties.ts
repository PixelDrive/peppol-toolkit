import { z } from 'zod';
import { EASCodeSchema } from './EASCodes';
import { en16931PartySchema } from '../en16931/Parties';

/**
 * Seller or buyer of a Peppol BIS document: an EN 16931 party whose electronic address is
 * mandatory (PEPPOL-EN16931-R020, PEPPOL-EN16931-R010) and uses a scheme of the Peppol EAS code
 * list (PEPPOL-EN16931-CL008).
 */
export const partySchema = en16931PartySchema.extend({
    endPoint: z.object({
        scheme: EASCodeSchema,
        id: z.string().min(1),
    }),
});
