import type { Data } from "../data.js";
import { getDomain } from "../url.js";
import Reader from 'maxmind';

let reader: Reader.Reader<Reader.CountryResponse>;

export async function initReader () {
    reader = await Reader.open('ip2country.mmdb');
}

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
        'fin': (data: CountryData) => {
            let res : 'ok'|'fail' = 'ok';
            let services: {'country': string[], 'ip': string[], 'domain': string}[] = [];

            for (const [domain, ips] of Object.entries (data.services)) {
                let countries: string[] = [];
                let zips = Array.from (ips);

                for (const ip of zips) {
                    try {
                        const resp = reader.get(ip);
                        if (resp && resp.country) {
                            const isoCode = resp.country.iso_code.toLowerCase();
                            if (isoCode != 'ru' && res == 'ok') {
                                res = 'fail';
                            }
                            countries.push (isoCode);
                        }
                        else {
                            countries.push ('localhost');
                        }
                    }
                    catch (e) {
                        if (e instanceof Error) {
                            console.log (e.message);
                        }
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