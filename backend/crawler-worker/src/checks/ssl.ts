import type { SecurityDetails } from "puppeteer";
import type { Data } from "../data.js";
import { getDomain } from "../url.js";

type SslData = { 'endpoints': {[key: string]: string}, 'acceptedRussianCertificates': string[] };

const russianCertificateIssuerMarkers = [
    'russian trusted',
    'digital.gov.ru',
    'digital government',
    'ministry of digital development',
    'минцифр',
    'минкомсвяз',
    'минцифры',
];

function isHttpsEndpoint(value: string): boolean {
    try {
        return new URL(value).protocol === 'https:';
    } catch {
        return false;
    }
}

function isRussianDomain(domain: string): boolean {
    const normalized = domain.trim().toLowerCase();
    return normalized.endsWith('.ru') || normalized.endsWith('.su') || normalized.endsWith('.xn--p1ai');
}

function hasRussianCertificateIssuer(details: SecurityDetails): boolean {
    const issuer = details.issuer().toLowerCase();
    return russianCertificateIssuerMarkers.some((marker) => issuer.includes(marker));
}

function addUnique(value: string[], item: string): void {
    if (!value.includes(item)) value.push(item);
}

export async function prepareSslConnection (sr: Data) {
    sr.subs.response.push ({
        'cb': (resp, data: SslData) => {
            let details : SecurityDetails|null = null;
            let msg: string = 'insecure';
            let finalUrl = resp.url();

            try { details = resp.securityDetails (); }
            catch (e: unknown) { }

            try {
                const chain = resp.request().redirectChain();
                if (chain && chain.length > 0) {
                    const z = chain[chain.length - 1];
                    if (z) finalUrl = z.url();
                }
            } catch (e) { }

            const statusCode = resp.status();
            if (statusCode >= 300 && statusCode < 400 && statusCode != 304) {
                return;
            }

            if (statusCode == 200) {
                const domain = getDomain (finalUrl);
                if (!domain) return;

                if (details !== null) {
                    if (hasRussianCertificateIssuer(details)) {
                        msg = 'ok';
                        addUnique(data.acceptedRussianCertificates, domain);
                    }
                    else if (details.issuer() == details.subjectName()) {
                        msg = 'self-signed';
                    }
                    else {
                        msg = 'ok';
                    }
                }
                else if (isHttpsEndpoint(finalUrl) && isRussianDomain(domain)) {
                    msg = 'ok';
                    addUnique(data.acceptedRussianCertificates, domain);
                }

                if (msg !== 'ok' && (domain in data['endpoints'] == false || data['endpoints'][domain] == 'fail'))
                    data['endpoints'][domain] = msg;
            }
        },
        'fin': (data: SslData) => {
            let res : 'ok'|'fail' = 'ok';
            for (const key of Object.keys(data.endpoints)) {
                if (data.endpoints[key] == 'ok')
                    delete data.endpoints[key];
            }

            if (Object.keys (data.endpoints).length != 0)
                res = 'fail';

            const resultData: Record<string, unknown> = { 'endpoints': data.endpoints };
            if (data.acceptedRussianCertificates.length > 0) {
                resultData['acceptedRussianCertificates'] = data.acceptedRussianCertificates.sort();
            }

            sr.result.checks.push ({
                'id': 'ssl/tls',
                'result': res,
                'data': resultData,
                'images': []
            });
        },
        'init': () => { return {'endpoints': {}, 'acceptedRussianCertificates': []}; }
    });
}

export async function checkSslConnection (sr: Data) {
    try {
        let p: string = sr.genPath('/');
        for (let i = 0; i < 7; i++) {
            let res = await sr.page.goto (p, {
                'waitUntil': 'domcontentloaded'
            });

            if (res) {
                const statusCode = res.status();
                if (statusCode >= 300 && statusCode < 400 && statusCode != 304) {
                    p = sr.page.url();
                    console.log('Redirect to', p);
                    continue;
                }

                const z = res.securityDetails ();
                if (z) {
                    sr.result.ssl = {
                        issuer: z.issuer(),
                        protocol: z.protocol(),
                        subjectAlternativeNames: z.subjectAlternativeNames(),
                        subjectName: z.subjectName(),
                        validFrom: z.validFrom(),
                        validTo: z.validTo()
                    };
                }
            }

            break;
        }
    }
    catch (e) {
        if (e instanceof Error) {
            console.error ('checkSslConnection failed', e.message);
        }
    }
}
