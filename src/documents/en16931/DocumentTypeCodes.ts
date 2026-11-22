import { z } from 'zod';

// UNTDID 1001 subsets used by BR-CL-01 in the CEN validation artefacts 1.3.17.
export const En16931InvoiceTypeCodeSchema = z.literal([
    71, 80, 81, 82, 84, 102, 130, 202, 203, 204, 211, 218, 219, 295, 325, 326,
    331, 380, 382, 383, 384, 385, 386, 387, 388, 389, 390, 393, 394, 395, 456,
    457, 471, 472, 473, 500, 501, 527, 553, 575, 623, 633, 751, 780, 817, 870,
    875, 876, 877, 935,
]);

export const En16931CreditNoteTypeCodeSchema = z.literal([
    81, 83, 261, 262, 296, 308, 381, 396, 420, 458, 502, 503, 532,
]);
