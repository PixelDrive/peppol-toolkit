import { z } from 'zod';
import { date } from './Date';
import { addressSchema } from './AdressSchema';

export const deliverySchema = z.object({
    actualDeliveryDate: date.optional(),
    deliveryLocation: z
        .object({
            id: z.string().min(1).optional(),
            locationSchemeID: z.string().optional(),
            address: addressSchema.optional(),
        })
        .optional(),
    deliveryPartyName: z.string().min(1).optional(),
});
