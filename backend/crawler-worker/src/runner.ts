import puppeteer from 'puppeteer';
import { check, prepare } from './checks.js';
import { Data } from './data.js';
import { getDomain } from './url.js';
import { initReader } from './checks/country.js';

export { initReader };

export async function initBrowser() {
  const browser = await puppeteer.launch({
    browser: 'chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--disable-default-apps',
      '--mute-audio',
      '--no-first-run',
      '--disable-features=TranslateUI',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    acceptInsecureCerts: true,
  });
  return browser;
}

export async function runCheck(
  browser: any,
  baseUrl: string,
  type: string,
  config: any,
  onProgress: (progress: number, status: string, completed: string[], errors: string[]) => Promise<void>
): Promise<any[]> {
  const domain = getDomain(baseUrl);
  if (domain === null) {
    throw new Error('Invalid URL');
  }

  const page = await browser.newPage();
  const sr = new Data(browser, page, baseUrl, domain);

  await prepare(sr);

  if (await sr.checkConnection()) {
    await check(sr);
  } else {
    throw new Error('Failed to connect to ' + baseUrl);
  }

  sr.finish();
  await page.close();

  return sr.result.checks;
}