import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KositValidator } from '../src/validator';
import { PeppolToolkit } from '../src';
import { basicInvoice } from '../src/data/basic-invoice';

const ACCEPTED_REPORT = `<?xml version="1.0" encoding="UTF-8"?>
<rep:report xmlns:rep="http://www.xoev.de/de/validator/framework/1/createreportinput">
  <rep:scenarioMatched>
    <rep:validationStepResult>
      <rep:recommendation>accept</rep:recommendation>
    </rep:validationStepResult>
  </rep:scenarioMatched>
  <rep:assessment>
    <rep:accept/>
  </rep:assessment>
</rep:report>`;

const REJECTED_REPORT = `<?xml version="1.0" encoding="UTF-8"?>
<rep:report xmlns:rep="http://www.xoev.de/de/validator/framework/1/createreportinput">
  <rep:scenarioMatched>
    <rep:validationStepResult>
      <rep:recommendation>reject</rep:recommendation>
      <rep:message id="BR-01" level="error" location="/Invoice">
        An Invoice shall have a Specification identifier
      </rep:message>
    </rep:validationStepResult>
  </rep:scenarioMatched>
  <rep:assessment>
    <rep:reject/>
  </rep:assessment>
</rep:report>`;

const REPORT_WITH_WARNINGS = `<?xml version="1.0" encoding="UTF-8"?>
<rep:report xmlns:rep="http://www.xoev.de/de/validator/framework/1/createreportinput">
  <rep:scenarioMatched>
    <rep:validationStepResult>
      <rep:recommendation>accept</rep:recommendation>
      <rep:message id="UBL-SR-09" level="warning" location="/Invoice/cac:Delivery">
        Delivery date should be provided
      </rep:message>
    </rep:validationStepResult>
  </rep:scenarioMatched>
  <rep:assessment>
    <rep:accept/>
  </rep:assessment>
</rep:report>`;

function mockFetch(body: string, status = 200, statusText = 'OK') {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText,
        text: () => Promise.resolve(body),
    });
}

describe('KositValidator', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should use default endpoint when none is provided', async () => {
        const fetchSpy = mockFetch(ACCEPTED_REPORT);
        vi.stubGlobal('fetch', fetchSpy);

        const validator = new KositValidator();
        await validator.validate('<Invoice/>');

        expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8081/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: '<Invoice/>',
        });
    });

    it('should use a custom endpoint when provided', async () => {
        const fetchSpy = mockFetch(ACCEPTED_REPORT);
        vi.stubGlobal('fetch', fetchSpy);

        const validator = new KositValidator({
            endpoint: 'http://my-validator:9090/validate',
        });
        await validator.validate('<Invoice/>');

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://my-validator:9090/validate',
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('should return valid=true for an accepted report', async () => {
        vi.stubGlobal('fetch', mockFetch(ACCEPTED_REPORT));

        const validator = new KositValidator();
        const result = await validator.validate('<Invoice/>');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
        expect(result.rawXml).toBe(ACCEPTED_REPORT);
    });

    it('should return valid=false for a rejected report', async () => {
        vi.stubGlobal('fetch', mockFetch(REJECTED_REPORT));

        const validator = new KositValidator();
        const result = await validator.validate('<Invoice/>');

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].id).toBe('BR-01');
        expect(result.errors[0].location).toBe('/Invoice');
    });

    it('should parse warnings from the report', async () => {
        vi.stubGlobal('fetch', mockFetch(REPORT_WITH_WARNINGS));

        const validator = new KositValidator();
        const result = await validator.validate('<Invoice/>');

        expect(result.valid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].id).toBe('UBL-SR-09');
        expect(result.errors).toHaveLength(0);
    });

    it('should throw on non-OK HTTP response', async () => {
        vi.stubGlobal(
            'fetch',
            mockFetch('Internal Server Error', 500, 'Internal Server Error')
        );

        const validator = new KositValidator();
        await expect(validator.validate('<Invoice/>')).rejects.toThrow(
            'Kosit validator returned HTTP 500: Internal Server Error'
        );
    });

    it('should throw on unexpected response format', async () => {
        vi.stubGlobal('fetch', mockFetch('<unexpected/>'));

        const validator = new KositValidator();
        await expect(validator.validate('<Invoice/>')).rejects.toThrow(
            'Unexpected Kosit validator response: missing report element'
        );
    });

    it('should include rawXml in the result', async () => {
        vi.stubGlobal('fetch', mockFetch(REJECTED_REPORT));

        const validator = new KositValidator();
        const result = await validator.validate('<Invoice/>');

        expect(result.rawXml).toBe(REJECTED_REPORT);
    });
});

describe('PeppolToolkit.validateWithKosit', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should validate an invoice XML via the Kosit service', async () => {
        vi.stubGlobal('fetch', mockFetch(ACCEPTED_REPORT));

        const toolkit = new PeppolToolkit();
        const xml = toolkit.invoiceToPeppolUBL(basicInvoice);
        const result = await toolkit.validateWithKosit(xml);

        expect(result.valid).toBe(true);
    });

    it('should accept custom options', async () => {
        const fetchSpy = mockFetch(ACCEPTED_REPORT);
        vi.stubGlobal('fetch', fetchSpy);

        const toolkit = new PeppolToolkit();
        await toolkit.validateWithKosit('<Invoice/>', {
            endpoint: 'http://custom:1234/',
        });

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://custom:1234/',
            expect.objectContaining({ method: 'POST' })
        );
    });
});
