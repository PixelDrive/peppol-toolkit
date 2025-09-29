import { z } from 'zod';
import { EASCodeSchema } from './EASCodes';
import { addressSchema } from './AdressSchema';
import { contactSchema } from './Contact';

export const partySchema = z.object({
    endPoint: z.object({
        scheme: EASCodeSchema,
        id: z.string().min(1),
    }),
    identification: z
        .object({
            scheme: EASCodeSchema.optional(),
            id: z.string().min(1),
        })
        .array()
        .optional(),
    name: z.string().min(1).optional(),
    address: addressSchema,
    taxSchemeCompanyID: z.string().min(1).optional(),
    legalEntity: z.object({
        registrationName: z.string().min(1),
        legalForm: z.string().min(1).optional(),
        companyId: z.string().min(1).optional(),
    }),
    contact: contactSchema.optional(),
});
