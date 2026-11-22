import { describe, expect, it } from 'vitest';
import { isValidEASCode } from '../src/documents/common/EASCodes';
import { isValidICDCode } from '../src/documents/common/ICDCodes';
import { isValidCountryCode } from '../src/documents/common/CountryCodes';
import { isValidCurrencyCode } from '../src/documents/common/CurrencyCodes';
import { isValidPaymentMeansCode } from '../src/documents/common/PaymentMeansCodes';
import { isValidUnitCode } from '../src/documents/common/UnitCodes';

describe('code-list guards reject inherited Object.prototype keys', () => {
    const validators = [
        isValidEASCode,
        isValidICDCode,
        isValidCountryCode,
        isValidCurrencyCode,
        isValidPaymentMeansCode,
        isValidUnitCode,
    ];

    it.each(['toString', 'constructor', '__proto__', 'valueOf', 'hasOwnProperty'])(
        'rejects %s for every code list',
        (key) => {
            for (const validate of validators) {
                expect(validate(key)).toBe(false);
            }
        }
    );
});
