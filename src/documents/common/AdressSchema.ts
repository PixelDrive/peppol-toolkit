import { z } from 'zod';
import { CountryCodeSchema } from './CountryCodes';

export const addressSchema = z.object({
    streetName: z.string().optional(),
    additionalStreetName: z.string().optional(),
    cityName: z.string().optional(),
    postalZone: z.string().optional(),
    countrySubentity: z.string().optional(),
    addressLine: z.string().optional(),
    country: CountryCodeSchema,
});
