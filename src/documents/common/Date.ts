import { z } from 'zod';

export const date = z.union([z.string(), z.date()]);
