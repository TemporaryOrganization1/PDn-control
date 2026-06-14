import puppeteer from 'puppeteer';
import { check, prepare } from './checks.js';
import { Data } from './data.js';
import { delay } from './delay.js';
import { getDomain } from './url.js';
import { initReader } from './checks/country.js';

async function run() {
    await initReader ();
    const baseUrl = 'https://innopolis.university/';
    const domain = getDomain (baseUrl);

    if (domain === null) {
        console.log ('baseUrl is invalid');
        return;
    }

    const browser = await puppeteer.launch({ 
        browser: 'chrome',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',                    // Отключаем расширения
            '--disable-plugins',                       // Отключаем плагины
            '--disable-gpu',                           // Отключаем GPU
            '--disable-software-rasterizer',
            '--disable-background-networking',         // Отключаем фоновые сетевые запросы
            '--disable-sync',                          // Отключаем синхронизацию
            '--disable-translate',                     // Отключаем переводчик
            '--disable-default-apps',                  // Отключаем дефолтные приложения
            '--mute-audio',                            // Отключаем звук
            '--no-first-run',                          // Пропускаем первый запуск
            '--disable-features=TranslateUI',          // Отключаем UI переводчика
            '--disable-features=BlockInsecurePrivateNetworkRequests', // Отключаем блокировку
            '--ignore-certificate-errors',           // Игнорируем ошибки SSL
            '--ignore-certificate-errors-spki-list',  // Игнорируем ошибки SSL SPKI
          ],
          ignoreDefaultArgs: ['--disable-extensions'],   // Игнорируем дефолтные аргументы }); // Set false to see the browser
          acceptInsecureCerts: true
      });

    const page = await browser.newPage();
    
    let sr = new Data (browser, page, baseUrl, domain);

    await prepare (sr);

    if (await sr.checkConnection ()) {
        await check (sr);
    }
    else {
        console.error ('sr.checkConnection failed');
    }

    sr.finish ();

    await browser.close();

    console.log (JSON.stringify (sr.result, undefined, 2));
}

run();