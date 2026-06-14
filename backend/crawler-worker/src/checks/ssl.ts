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

            if (details !== null) {
                if (details.issuer() == details.subjectName()) {
                    msg = 'self-signed';
                }
                else {
                    msg = 'ok';
                }
            }

            if (msg != 'ok') {
                const domain = getDomain (resp.url ());
                if (domain) {
                    data['endpoints'][domain] = msg;
                }
            }
        },
        'fin': (data: SslData) => {
            let res : 'ok'|'fail' = 'ok';
            if (Object.keys (data.endpoints).length != 0)
                res = 'fail';

            sr.result.checks.push ({
                'id': 'ssl/tls',
                'result': res,
                'data': { 'endpoints': data.endpoints }
            });
        },
        'init': () => { return {'endpoints': new Set<string>()}; }
    });
}