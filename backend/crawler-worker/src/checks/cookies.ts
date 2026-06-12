import type { Data } from "../data.js";
import { getDomain } from "../url.js";

function init_blocked_addr (b: {[key: string]: string[]}): {[key: string]: string} {
    let obj: {[key: string]: string} = {};
    for (const [key, value] of Object.entries (b)) {
        for (const p of value) {
            obj[p] = key;
        }
        obj[key] = key;
    }
    return obj;
}

const blocked_aliases: {[key: string]: string[]} = {
    "google.com": [
        "google-analytics.com",
        "google.com",
        "googletagmanager.com",
        "analytics.google.com",
        "googleadservices.com",
        "doubleclick.net",
        "pagead2.googlesyndication.com",
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "ajax.googleapis.com",
        "www.googletagmanager.com"
    ],
    "yandex.ru": [
        "mc.yandex.ru",
        "yandexadnet.ru",
        "an.yandex.ru",
        "yandex.ru"
    ],
    "mail.ru": [
        "top-fwz1.mail.ru"
    ],
    "sber.ru": [
        "sberanalytics.ru",
        "sbermetrika.ru"
    ],
    "rambler": [
        "counter.rambler.ru"
    ],
    "hotjar.com": [
        "hotjar.com",
        "static.hotjar.com"
    ],
    "clarity.ms": [
        "clarity.ms",
        "c.clarity.ms"
    ],
    "matomo.org": [
        "matomo.org",
        "piwik.org"
    ],
    "posthog.com": [
        "posthog.com"
    ],
    "plausible.io": [
        "plausible.io"
    ],
    "fathom.com": [
        "fathom.com",
        "cdn.fathom.com"
    ],
    "meta.com": [
        "connect.facebook.net",
        "fbcdn.net",
        "meta.com",
        "business.facebook.com"
    ],
    "tealium.com": [
        "tealium.com"
    ],
    "segment.com": [
        "segment.com"
    ],
    "analytics.js": [
        "analytics.js"
    ],
    "telegram.org": [
        "telegram.org",
        "t.me"
    ],
    "cdnjs.cloudflare.com": [
        "cdnjs.cloudflare.com"
    ],
    "adobe.com": [
        "use.typekit.net"
    ]
};

const blocked_addr = init_blocked_addr (blocked_aliases);

type HttpsData = { 'endpoints': Set<string> };
export async function prepareCookieChecks (sr: Data) {
    sr.subs.request.push ({
        'cb': (req, data: HttpsData) => {
            const domain = getDomain (req.url ().trim ());
            if (domain) {
                const z = blocked_addr[domain];
                if (z !== undefined) {
                    const addrs = blocked_aliases[z];
                    if (addrs !== undefined) {
                        let isWarning = false;
                        for (const p of addrs) {
                            if (sr.mainDomain == domain)
                                isWarning = true;
                        }

                        if (isWarning) {
                            return;
                        }

                        data.endpoints.add (domain);
                    }
                }
            }
        },
        'fin': (data: HttpsData) => {
            let res : 'ok'|'fail' = 'ok';
            if (data.endpoints.size != 0)
                res = 'fail';

            sr.result.checks.push ({
                'id': 'cookie-ads',
                'result': res,
                'data': { 'endpoints': Array.from (data.endpoints) }
            });
        },
        'init': () => { return {'endpoints': new Set<string>()}; }
    });
}