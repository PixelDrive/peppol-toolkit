import { z } from 'zod';
import { EASCodeSchema } from './EASCodes';
import { ICDCodeSchema } from './ICDCodes';
import { addressSchema } from './AdressSchema';
import { contactSchema } from './Contact';

export const partyTaxSchemeSchema = z.object({
    companyId: z.string().min(1),
    schemeID: z.string().min(1).optional(),
});

export const partySchema = z.object({
    endPoint: z.object({
        scheme: EASCodeSchema,
        id: z.string().min(1),
    }),
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
