import { describe, expect, it, vi } from 'vitest';
import { Data, type WorkerReportPayload } from '../src/data.js';

function makeData() {
  const page = { on: vi.fn() } as any;
  return new Data({} as any, page, 'https://example.com', 'example.com', async () => null, async () => {});
}

describe('worker report payload', () => {
  it('initializes the stable final payload shape', () => {
    const data = makeData();
    const payload: WorkerReportPayload = data.result;

    expect(payload).toEqual({
      checks: [],
      screenshotId: null,
      ssl: null,
      about: null,
      country: null,
    });
  });

  it('awaits async finish hooks before returning the final payload', async () => {
    const data = makeData();
    data.subs.response.push({
      init: () => ({}),
      cb: () => {},
      fin: async () => {
        await Promise.resolve();
        data.result.country = 'ru';
        data.result.screenshotId = 'img-top';
        data.result.ssl = {
          issuer: 'Example CA',
          validFrom: 1700000000,
          validTo: 2000000000,
          protocol: 'TLS 1.3',
          subjectName: 'example.com',
          subjectAlternativeNames: ['example.com'],
        };
        data.result.checks.push({
          id: 'cookie-banner',
          result: 'warn',
          pages: ['https://example.com'],
          about: 'Cookie banner needs review',
          images: ['img-cookie'],
          data: {},
        });
      },
    });

    await data.finish();

    expect(data.result.screenshotId).toBe('img-top');
    expect(data.result.country).toBe('ru');
    expect(data.result.ssl?.issuer).toBe('Example CA');
    expect(data.result.checks[0]?.images).toEqual(['img-cookie']);
  });
});
