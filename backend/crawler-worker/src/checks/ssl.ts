import type { SecurityDetails } from "puppeteer";
import type { Data } from "../data.js";
import { getDomain } from "../url.js";

type SslData = { 'endpoints': {[key: string]: string} };

export async function prepareSslConnection (sr: Data) {
    sr.subs.response.push ({
        'cb': (resp, data: SslData) => {
            let details : SecurityDetails|null = null;
            let msg: string = 'insecure';
            
            try { details = resp.securityDetails (); }
            catch (e: unknown) { }

            const statusCode = resp.status();
            if (statusCode >= 300 && statusCode < 400 && statusCode != 304) {
                return;
            }

            if (statusCode == 200) {
                if (details !== null) {
                    if (details.issuer() == details.subjectName()) {
                        msg = 'self-signed';
                    }
                    else {
                        msg = 'ok';
                    }
                }

                
                let finalUrl = resp.url();
                try {
                    const chain = resp.request().redirectChain();
                    if (chain && chain.length > 0) {
                        const z = chain[chain.length - 1];
                        if (z) finalUrl = z.url();
                    }
                } catch (e) { }
                const domain = getDomain (finalUrl);
                if (domain) {
                    if (domain in data['endpoints'] == false || data['endpoints'][domain] == 'fail')
                        data['endpoints'][domain] = msg;
                }
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

            sr.result.checks.push ({
                'id': 'ssl/tls',
                'result': res,
                'data': { 'endpoints': data.endpoints },
                'images': []
            });
        },
        'init': () => { return {'endpoints': {}}; }
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
