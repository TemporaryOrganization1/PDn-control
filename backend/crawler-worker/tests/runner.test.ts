import { describe, expect, it, vi } from 'vitest';
import { runCheck } from '../src/runner.js';

describe('runCheck', () => {
  it('rejects invalid target URLs before opening a browser page', async () => {
    const browser = { newPage: vi.fn() };

    await expect(
      runCheck(browser, 'not a url', 'detail', {}, async () => {}),
    ).rejects.toThrow('Invalid URL');

    expect(browser.newPage).not.toHaveBeenCalled();
  });
});
