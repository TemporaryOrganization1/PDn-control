import type { Data } from "../data.js";
import { getDomain } from "../url.js";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
const geoipServiceUrl = config.geoip?.serviceUrl || "http://geoip-service:8080";

type CountryData = { 'services': {[key: string]: Set<string>} };

export async function prepareCountryChecks (sr: Data) {
    sr.subs.response.push ({
        'cb': (resp, data: CountryData) => {
            const domain = getDomain (resp.url ().trim());
            if (domain) {
                const address = resp.remoteAddress();
                if (address.ip) {
                    if (data.services[domain] instanceof Set == false) {
                        data.services[domain] = new Set();
                    }
                    data.services[domain].add (address.ip);
                }
            }
        },
        'fin': async (data: CountryData) => {
            let res : 'ok'|'fail' = 'ok';
            let services: {'country': string[], 'ip': string[], 'domain': string}[] = [];

            for (const [domain, ips] of Object.entries (data.services)) {
                let countries: string[] = [];
                let zips = Array.from (ips);

                for (const ip of zips) {
                    try {
                        const geoResp = await fetch(`${geoipServiceUrl}/api/v1/lookup/${ip}`);
                        if (geoResp.ok) {
                            const geoData = await geoResp.json() as { country_code?: string; country?: string };
                            const isoCode = (geoData.country_code || geoData.country || "").toLowerCase();
                            if (isoCode && isoCode != 'ru' && res == 'ok') {
                                res = 'fail';
                            }
                            countries.push (isoCode || 'unknown');
                        } else {
                            countries.push ('localhost');
                        }
                    }
                    catch (e) {
                        if (e instanceof Error) {
                            console.log (e.message);
                        }
                        countries.push ('localhost');
                    }
                }

                services.push ({
                    'country': countries,
                    'ip': zips,
                    'domain': domain
                });
            }

            sr.result.checks.push ({
                'id': 'ips',
                'result': res,
                'data': { 'services': services }
            });
        },
        'init': () => { return {'services': {}}; }
    });
}