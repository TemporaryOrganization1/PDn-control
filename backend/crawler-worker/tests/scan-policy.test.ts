import { describe, expect, it } from 'vitest';
import { coverageFallbacks, ExplorationBudget, normalizeScanOptions } from '../src/scan-policy.js';

describe('scan policy', () => {
  it('uses restrictive free defaults for missing or invalid worker options', () => {
    expect(normalizeScanOptions({ 'ai-iterations': 99, 'capture-images': 'true', 'detail-level': 'unexpected' })).toEqual({
      aiIterations: 3,
      captureImages: false,
      detailLevel: 'summary',
    });
  });

  it('allows an explicitly valid paid profile', () => {
    expect(normalizeScanOptions({ 'ai-iterations': 10, 'capture-images': true, 'detail-level': 'full' })).toEqual({
      aiIterations: 10,
      captureImages: true,
      detailLevel: 'full',
    });
  });

  it('downgrades contradictory worker options to the restrictive free profile', () => {
    expect(normalizeScanOptions({ 'ai-iterations': 10, 'capture-images': true, 'detail-level': 'summary' })).toEqual({
      aiIterations: 3,
      captureImages: false,
      detailLevel: 'summary',
    });
  });

  it('stops exploration after the configured number of tool calls', () => {
    const budget = new ExplorationBudget(3);
    expect([budget.consume(), budget.consume(), budget.consume(), budget.consume()]).toEqual([true, true, true, false]);
    expect(budget.remaining()).toBe(0);
  });

  it('marks evaluated clean checks as ok and unevaluated checks as unknown', () => {
    const fallback = coverageFallbacks(new Set(['privacy-policy']), new Set(['cookie-banner']));
    expect(fallback.find((item) => item.id === 'privacy-policy')).toBeUndefined();
    expect(fallback.find((item) => item.id === 'cookie-banner')?.result).toBe('ok');
    expect(fallback.find((item) => item.id === 'minors-data')?.result).toBe('unknown');
  });
});
