import type { Data } from "../data.js";
import { getDomain } from "../url.js";

type HttpsData = { 'endpoints': Set<string> };
export async function prepareHttpsConnection (sr: Data) {
    sr.subs.request.push ({
        'cb': (req, data: HttpsData) => {
            const url = req.url ().trim ();
            if (url.startsWith('http://')) {
                const domain = getDomain (url);
                if (domain) {
                    data['endpoints'].add (domain);
                }
            }
        },
        'fin': (data: HttpsData) => {
            let res : 'ok'|'fail' = 'ok';
            if (data.endpoints.size != 0)
                res = 'fail';

            sr.result.checks.push ({
                'id': 'https',
                'result': res,
                'data': { 'endpoints': Array.from (data.endpoints) }
            });
        },
        'init': () => { return {'endpoints': new Set<string>()}; }
    });
}