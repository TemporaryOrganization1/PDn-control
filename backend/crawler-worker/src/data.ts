import { Browser, HTTPRequest, HTTPResponse, Page } from "puppeteer";
import { delay } from "./delay.js";
import { getDomain, getMainDomain } from "./url.js";

type SubsType = { 
    'request': { 'cb': (req: HTTPRequest, data: any) => void, 'init': () => any, 'data'?: any, fin: (data: any) => void }[], 
    'response': { 'cb': (resp: HTTPResponse, data: any) => void, 'init': () => any, 'data'?: any, fin: (data: any) => void }[] 
};

export class Data {
    constructor (browser: Browser, page: Page, baseUrl: string, domain: string) {
        this.mainDomain = getMainDomain (domain) ?? domain;
        this.isSsl = this.isSslUrl(baseUrl);
        this.browser = browser;
        this.baseUrl = baseUrl.trim();
        this.domain = domain;
        this.page = page;
        this.links = new Set<string>();
        this.maxLinks = 3000;
        this.result = {
            'checks': []
        };
        this.subs = {'request': [], 'response': []};
        this.page.on ('request', (request) => {
            for (const p of this.subs.request) {
                try { p.cb (request, p.data); }
                catch (e: any) { console.error (e); }
            }
        });
        this.page.on ('response', ( response ) => {
            for (const p of this.subs.response) {
                try { p.cb (response, p.data); }
                catch (e: any) { console.error (e); }
            }
        });

        console.log ('domain', domain, 'baseUrl', baseUrl);
    }

    public async checkConnection (): Promise<boolean> {
        while (true) {
            for (const [key, value] of Object.entries(this.subs)) {
                for (const p of value) {
                    p.data = p.init ();
                }
            }

            let resp : HTTPResponse|null;
            try {
                this.baseUrl = this.genBaseUrl ();
                resp = await this.page.goto (this.baseUrl, { 
                    waitUntil: 'domcontentloaded' 
                });
            
            }
            catch (e: Error|unknown) {
                console.error (e);
                resp = null;
            }

            if (resp === null || !resp.ok()) {
                if (this.isSsl) {
                    this.isSsl = false;
                    continue;
                }
                return false;
            }
            
            return true;
        }
    }

    public async initLinks (): Promise<void> {
        if (this.links.size != 0)
            return;

        // await this.collectFromSiteMap ();
        // await this.collectWalking();
    }

    public finish (): void {
        for (const [key, value] of Object.entries(this.subs)) {
            for (const p of value) {
                p.fin (p.data);
            }
        }
    }

    public isSsl: boolean
    public domain: string
    public mainDomain: string
    public browser: Browser
    public baseUrl: string
    public page: Page
    public links: Set<string>
    public subs: SubsType
    public result: { 'checks': { 'id': string, result: 'fail'|'ok'|'warn', data?: any }[] }
    public maxLinks: number

    public async open (path: string): Promise<boolean> {
        try {
            
            if (!path.startsWith ('http://') && !path.startsWith ('https://'))
                path = `${this.baseUrl}${path}`;

            let res = await this.page.goto (path, {
                'waitUntil': 'domcontentloaded'
            });

            if (res !== null) {
                return true;
            }

            console.error (`open() ${path} failed. Not Found`);
        }
        catch (e: Error|unknown) {
            console.error (`open() ${path} failed`);
        }
        return false;
    }

    private async collectFromSiteMap () : Promise<void> {
        if (await this.open ('sitemap.xml')) {
            console.debug ('sitemap found');
            const content = await this.page.content ();
        }
        else {
            console.log ('sitemap not found');
        }
    }

    private async collectWalking () : Promise<void> {
        let path = '/';
        if (await this.open (path)) {
            const hrefLinks = await this.page.evaluate(`(function () {
                const baseUrl = "${this.baseUrl}";
                const ddomain = "${this.domain}";
                const ppath = "${path}";
                const links = Array.from(document.querySelectorAll('a[href]')).slice(0, ${this.maxLinks});
                return links
                    .map(link => {
                        function isAlphabet (char) { /^\\p\{L\}\$/u.test(char); }
                        function getDomain (url) { try { return new URL(url).host; } catch { return null; } };

                        let s = link.getAttribute('href');

                        if (s !== null) {
                            s = s.trim();

                            if (s.startsWith ('https://') || s.startsWith ('http://')) {
                                let domain = getDomain (s);
                                if (domain !== null) {
                                    if (domain.indexOf (ddomain) != -1)
                                        return s;
                                }
                                return null;
                            }

                            const c = s.length ? s[0] : null;

                            if (c) {
                                if (isAlphabet (c)) {
                                    if (ppath.endsWith('/'))
                                        return baseUrl + ppath + s;
                                    return baseUrl + ppath + '/' + s;
                                }
                                if (c == '/') {
                                    if (s.startsWith('/'))
                                        return baseUrl+s.substring(1);
                                    return baseUrl+s;
                                }
                            }

                            return null;
                        }

                        return null;
                    })
                    .filter(href => 
                        href
                    );
            })()`).catch((e) => { console.error(e); return []; }) as string[]|undefined;
            
            if (hrefLinks) {
                for (const link of hrefLinks) {
                    if (link) {
                        this.links.add(link);
                    }
                }
            }
        }
        else {
            throw Error ('Main Page is not available');
        }
    }

    private isSslUrl (url: string) : boolean {
        url = url.trim();
        if (url.startsWith ('http://'))
            return false;
        return true;
    }

    private genBaseUrl () : string {
        return `${ (this.isSsl ? 'https://' : 'http://') }${this.domain}/`;
    }
}