import type { WorkerCheck } from './data.js';
import type { ScanOptions } from './runner.js';

export const AI_CHECK_IDS = [
  'sep-consent',
  'foreign-words',
  'privacy-policy',
  'cookie-banner',
  'consent-forms',
  'email-pdn',
  'ad-marking',
  'minors-data',
  'special-categ',
] as const;

export function normalizeScanOptions(payload: Record<string, unknown>): ScanOptions {
  const requestedIterations = Number(payload['ai-iterations']);
  const detailLevel = payload['detail-level'];
  const captureImages = payload['capture-images'];
  const validIterations = Number.isInteger(requestedIterations) && requestedIterations >= 1 && requestedIterations <= 10;
  const validDetail = detailLevel === 'summary' || detailLevel === 'full';
  const validCapture = typeof captureImages === 'boolean';
  const consistentProfile = (detailLevel === 'summary' && captureImages === false)
    || (detailLevel === 'full' && captureImages === true);

  if (!validIterations || !validDetail || !validCapture || !consistentProfile) {
    return { aiIterations: 3, captureImages: false, detailLevel: 'summary' };
  }

  return {
    aiIterations: requestedIterations,
    captureImages,
    detailLevel,
  };
}

export class ExplorationBudget {
  private remainingCount: number;

  constructor(limit: number) {
    this.remainingCount = Math.max(1, Math.min(10, Math.trunc(limit)));
  }

  consume(): boolean {
    if (this.remainingCount <= 0) return false;
    this.remainingCount--;
    return true;
  }

  remaining(): number {
    return this.remainingCount;
  }
}

export function coverageFallbacks(found: Set<string>, checked: Set<string>): WorkerCheck[] {
  return AI_CHECK_IDS.flatMap((id) => {
    if (found.has(id)) return [];
    return [{ id, result: checked.has(id) ? 'ok' as const : 'unknown' as const, images: [] }];
  });
}
