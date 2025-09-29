import { z } from 'zod';

export const addressSchema = z.object({
    streetName: z.string().optional(),
    additionalStreetName: z.string().optional(),
    cityName: z.string().optional(),
    postalZone: z.string().optional(),
    countrySubentity: z.string().optional(),
    addressLine: z.string().optional(),
    country: z.object({
        identificationCode: z.string().length(2), // Code pays ISO 3166-1
    }),
});
