import { z } from 'zod';
import { EASCodeSchema } from './EASCodes';
import { addressSchema } from './AdressSchema';

export const partySchema = z.object({
    endPoint: z.object({
        scheme: EASCodeSchema,
        id: z.string().min(1),
    }),
    identification: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    address: addressSchema,
});
