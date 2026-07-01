import { describe, expect, it } from 'vitest';
import { getDomain, getMainDomain } from '../src/url.js';

describe('URL helpers', () => {
  it('extract domains from valid absolute URLs', () => {
    expect(getDomain('https://sub.example.com/path')).toBe('sub.example.com');
    expect(getDomain('http://localhost:3000/check')).toBe('localhost:3000');
  });

  it('reject invalid URLs without throwing', () => {
    expect(getDomain('not a url')).toBeNull();
    expect(getMainDomain('not a url')).toBeNull();
  });

  it('keeps public suffix exceptions when selecting the main domain', () => {
    expect(getMainDomain('https://shop.example.co.uk/catalog')).toBe('example.co.uk');
    expect(getMainDomain('https://service.example.com.ru')).toBe('example.com.ru');
    expect(getMainDomain('https://a.b.example.com')).toBe('example.com');
    expect(getMainDomain('http://127.0.0.1:3000/check')).toBe('127.0.0.1');
    expect(getMainDomain('localhost:3000')).toBe('localhost');
  });
});
