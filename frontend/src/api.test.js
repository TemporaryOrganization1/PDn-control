import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calcRiskScore,
  getCheckInfo,
  getGuestRemaining,
  startCheck,
} from './api.js';

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('startCheck', () => {
  it('normalizes hostnames to HTTPS before starting a check', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ code: 'ERR_OK', 'req-id': 'req-1' }));

    const result = await startCheck('example.com', 'detail');

    expect(result['req-id']).toBe('req-1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/check',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ url: 'https://example.com', type: 'detail' }),
      }),
    );
  });

  it('keeps explicit HTTP and reports API error codes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        { code: 'ERR_GUEST_LIMIT', msg: 'guest check limit reached' },
        { status: 403 },
      ),
    );

    await expect(startCheck('http://example.com', 'fast')).rejects.toMatchObject({
      code: 'ERR_GUEST_LIMIT',
      status: 403,
      message: 'guest check limit reached',
    });
  });
});

describe('getGuestRemaining', () => {
  it('parses successful guest quota responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ limit: 3, used: 1, remaining: 2 }),
    );

    await expect(getGuestRemaining()).resolves.toEqual({
      limit: 3,
      used: 1,
      remaining: 2,
    });
  });
});

describe('result helpers', () => {
  it('calculates bounded risk scores from failures and warnings', () => {
    expect(calcRiskScore([])).toBe(0);
    expect(calcRiskScore([{ result: 'ok' }])).toBe(100);
    expect(calcRiskScore([{ result: 'fail' }, { result: 'warn' }])).toBe(65);
    expect(calcRiskScore(new Array(10).fill({ result: 'fail' }))).toBe(0);
  });

  it('maps known and unknown check identifiers to display metadata', () => {
    expect(getCheckInfo('https', 'ok')).toMatchObject({
      art: 'HTTPS',
      color: 'bg-orange-500',
    });
    expect(getCheckInfo('custom-check', 'fail')).toMatchObject({
      label: 'custom-check',
      art: 'custom-check',
    });
  });
});
