import { describe, expect, it } from 'vitest';
import {
  normalizeOpenRouterBaseUrl,
  resolveOpenRouterSettings,
} from '../src/openrouter-config.js';

describe('OpenRouter configuration', () => {
  it('prefers environment API key and base URL over config values', () => {
    expect(
      resolveOpenRouterSettings(
        {
          apiKey: 'config-key',
          baseUrl: 'https://config-proxy.example/api/v1',
          model: 'config-model',
        },
        {
          OPENROUTER_API_KEY: 'env-key',
          OPENROUTER_BASE_URL: 'https://env-proxy.example/api/v1',
        },
      ),
    ).toEqual({
      apiKey: 'env-key',
      baseUrl: 'https://env-proxy.example/api/v1',
      model: 'config-model',
    });
  });

  it('uses config fallback when environment values are empty', () => {
    expect(
      resolveOpenRouterSettings(
        {
          apiKey: 'config-key',
          baseUrl: 'https://config-proxy.example/api/v1',
          model: 'config-model',
        },
        {
          OPENROUTER_API_KEY: '',
          OPENROUTER_BASE_URL: '',
        },
      ),
    ).toEqual({
      apiKey: 'config-key',
      baseUrl: 'https://config-proxy.example/api/v1',
      model: 'config-model',
    });
  });

  it('keeps SDK default OpenRouter server when base URL is empty', () => {
    expect(resolveOpenRouterSettings({}, {})).toEqual({
      apiKey: '',
      model: 'google/gemma-4-31b-it',
    });
  });

  it('normalizes a bare proxy origin to the OpenRouter API path', () => {
    expect(normalizeOpenRouterBaseUrl('https://manapi.ru:37777')).toBe(
      'https://manapi.ru:37777/api/v1',
    );
  });

  it('keeps an explicit OpenRouter API path without a trailing slash', () => {
    expect(normalizeOpenRouterBaseUrl('https://manapi.ru:37777/api/v1/')).toBe(
      'https://manapi.ru:37777/api/v1',
    );
  });

  it('rejects invalid base URLs with a clear error', () => {
    expect(() => normalizeOpenRouterBaseUrl('not a url')).toThrow(
      'Invalid OPENROUTER_BASE_URL',
    );
  });
});
