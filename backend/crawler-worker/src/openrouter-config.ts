export type OpenRouterRuntimeConfig = {
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
  model?: string | undefined;
};

export type OpenRouterRuntimeEnv = {
  OPENROUTER_API_KEY?: string | undefined;
  OPENROUTER_BASE_URL?: string | undefined;
};

export type OpenRouterSettings = {
  apiKey: string;
  model: string;
  baseUrl?: string;
};

const defaultOpenRouterModel = 'google/gemma-4-31b-it';
const openRouterApiPath = '/api/v1';

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function normalizeOpenRouterBaseUrl(rawBaseUrl?: string): string | undefined {
  const value = rawBaseUrl?.trim();
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Invalid OPENROUTER_BASE_URL: expected an absolute http(s) URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Invalid OPENROUTER_BASE_URL: expected an http(s) URL');
  }

  url.hash = '';
  url.search = '';

  const path = url.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/') {
    url.pathname = openRouterApiPath;
  } else if (path === openRouterApiPath) {
    url.pathname = openRouterApiPath;
  } else {
    throw new Error('Invalid OPENROUTER_BASE_URL: expected origin or URL ending with /api/v1');
  }

  return url.toString().replace(/\/$/, '');
}

export function resolveOpenRouterSettings(
  config: OpenRouterRuntimeConfig = {},
  env: OpenRouterRuntimeEnv = process.env,
): OpenRouterSettings {
  const apiKey = firstNonEmpty(env.OPENROUTER_API_KEY, config.apiKey) || '';
  const model = firstNonEmpty(config.model) || defaultOpenRouterModel;
  const baseUrl = normalizeOpenRouterBaseUrl(
    firstNonEmpty(env.OPENROUTER_BASE_URL, config.baseUrl),
  );

  if (baseUrl) {
    return { apiKey, model, baseUrl };
  }

  return { apiKey, model };
}
