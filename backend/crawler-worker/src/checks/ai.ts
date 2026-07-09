import { readFileSync } from 'node:fs';
import { HTTPClient, OpenRouter, type Fetcher } from '@openrouter/sdk';
import type { Data } from '../data.js';
import { resolveOpenRouterSettings } from '../openrouter-config.js';
import { Agent } from 'node:https';
import fetch from 'node-fetch';
import { error } from 'node:console';

const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

const prompt = `You are a legal compliance auditor for Russian Federation laws (152-FZ, 38-FZ, 168-FZ, 420-FZ).

Inspect the provided website HTML by using tool and output a JSON report for the following 9 checks.

DO NOT check if cookies load before consent. IGNORE cookie loading behavior.
ONLY check for the presence of a cookie banner with specific buttons.

=== CHECKS ===

1. "Separate Consent Document (152-FZ Art. 9, effective 01.09.2025)"
   - id - "sep-consent"
   - Look for: A dedicated, separate document explicitly titled "Согласие на обработку персональных данных", "Политика обработки персональных данных" or "Политика обработки данных" (or similar).
   - fail: Consent is embedded inside User Agreement / Terms of Service / Privacy Policy.
   - ok: Separate document exists as a distinct page or a distinct checkblock.

   !!! IMPORTANT NOTE: CHECK FOR SEPARATE CONSENT DOCUMENT CAREFULLY IN FOOTER. IT MUST BE AS A DISTINCT PAGE OR DISTINCT CHECKBLOCK. IT IS ONE OF THE IMPORTANT ABILITY !!!

2. "Foreign Words Without Translation (168-FZ Art. 10.1)"
   - id - "foreign-words"
   - Look for: User interface text (buttons, labels, menus, forms) in foreign languages.
   - FAIL: Foreign text without an equivalent Russian translation nearby (same font size, same visual prominence).
   - PASS: Everything is in Russian, OR foreign words are registered trademarks or have Russian translation.

   !!! IMPORTANT NOTE: PREFERABLE TO FILL "images" on FAIL !!!

3. "Privacy Policy (152-FZ Art. 18)"
   - id - "privacy-policy"
   - Look for: Document, Page named "Политика конфиденциальности" or "Privacy Policy".
   - FAIL: No document found. Document exists but lacks: purposes of data processing, list of collected data, retention periods, data destruction procedure.
   - PASS: Complete document exists and is linked in footer.

   !!! IMPORTANT NOTE: CHECK FOR PRIVACY POLICY CAREFULLY IN FOOTER. IT IS ONE OF THE IMPORTANT ABILITY !!!

4. "Cookie Banner (152-FZ / 420-FZ)"
   - id - "cookie-banner"
   - Look for: A banner/widget that appears on page load asking about cookies.
   - REQUIRED BUTTONS: "Принять" (Accept) AND "Отказаться" (Reject) OR "Настроить" (Settings).
   - FAIL: Banner has only "Accept" button without "Reject" button. Banner uses implied consent text ("Продолжая использование сайта..."). Different colors: "Accept" is green and "Reject" is gray.
   - PASS: Banner exists with both Accept and Reject/Configure buttons.
   - WARN: No cookie banner.

   !!! IMPORTANT NOTE: CHECK FOR COOKIE BANNER CAREFULLY. IT IS ONE OF THE IMPORTANT ABILITY !!!
   !!! IMPORTANT NOTE: MUST TO FILL "images" ON FAIL IF COOKIE-BANNER EXISTS !!!

5. "Consent in Web Forms (152-FZ Art. 9)"
   - id - "consent-forms"
   - Look for: Any form that collects personal data (name, phone, email, address).
   - REQUIRED: A checkbox (чекбокс) that is NOT pre-ticked by default. Label must explicitly state agreement to Personal Data processing.
   - FAIL: No checkbox. Checkbox is pre-ticked. Text says "By submitting this form you agree..." without a checkbox.
   - PASS: Unticked checkbox next to consent text and link to Privacy Policy.
   
   !!! IMPORTANT NOTE: CHECK FOR FORMS CAREFULLY IN REGISTER, LOGIN, UPLOAD, FEEDBACK, EMAIL-SUBSCRIBE PAGES. IT IS ONE OF THE IMPORTANT ABILITY !!!
   !!! IMPORTANT NOTE: PREFERABLE TO FILL "images" ON FAIL !!!

6. "Email for PD Requests (152-FZ Art. 18)"
   - id - "email-pdn"
   - Look for: Email address or contact form specifically for personal data requests (deletion, correction, withdrawal of consent).
   - FAIL: No email found. Only general "info@" or "sales@" email with no reference to PD requests.
   - PASS: Dedicated email (e.g., "pd@site.ru", "personaldata@site.ru") mentioned in Privacy Policy or Contacts section.

   !!! IMPORTANT NOTE: CHECK FOR EMAIL CAREFULLY IN FOOTER. IT IS ONE OF THE IMPORTANT ABILITY !!!

7. "Ad Marking - 38-FZ / ORD"
   - id - "ad-marking"
   - Look for: Any advertisements (banners, native ads, sponsored posts, affiliate links).
   - REQUIRED: 1) Label "Реклама" clearly visible. 2) ERID token (looks like "erid: XXXXX" or in URL parameter "?erid="). 3) Information about advertiser (company name or OGRN).
   - FAIL: Ad without "Реклама" label. Ad without ERID token.
   - PASS: Ad has label, ERID token, and advertiser info.

8. "Minors' Data (152-FZ Art. 9)"
   - id - "minors-data"
   - Look for: Forms asking for birth date, age, or any content targeting users under 18.
   - REQUIRED IF MINORS DATA COLLECTED: Parental/guardian consent mechanism with representative's passport data.
   - FAIL: Collects age/birth date but has no parental consent mechanism.
   - PASS: No minor data collected, OR parental consent form exists.

   !!! IMPORTANT NOTE: PREFERABLE TO FILL "images" ON FAIL !!!

9. "Special Categories of PD (152-FZ Art. 10)"
   - id - "special-categ"
   - Look for: Forms asking for health data, race, religion, political views, biometrics, intimate life.
   - FAIL: Collecting special category data without explicit written consent and exceptional legal basis.
   - PASS: No special categories collected.

=== SELECTED LANGUAGE ===
Selected language is RU or Russian.

=== REPORT ERRORS ===
For each found check report call function tool only if the result is not 'ok'. If the result is 'fail' for FAIL, 'warn' for WARN and the pages URL of data. 
You can write brief description about error in clear russian. Give the results of found checks using function tool "reportError". 
Field "about" must be in this language. Field "images" should contains CSS selector to elements with errors to take a screenshot.

{
    "id": "minors-data",
    "result": "fail",
    "pages": ["https://example.com/fitness", "https://example.com/personal-data"],
    "about": "не требует согласия родителей если меньше 18 лет",
    "images": []
}
 
or 

{
    "id": "",
    "result": "fail",
    "pages": ["https://example.com/"],
    "about": "в cookie-баннере отсутствет кнопка 'Отказаться'",
    "images": [
        {
            "url": "https://example.com/",
            "selector": ".cookie-popup"
        }
    ]
}

Do not report the same error twice only if you have another different error on the same check report.

!!! IMPORTANT NOTE: ALLOWED ELEMENTS TO TAKE A SCREENSHOT ONLY IS FORMS, COOKIE-BANNER, SPAN-TEXT !!!

=== OUTPUT FORMAT ===
If you have finished you review use function tool "reportFinish". Use selected language.

=== VISITS ===
It's more preferable if you will visit as more pages if you wish.
Find links <a href=...> and open it. If the main page doesn't exist you can finish chat without error messages in the response.

!!! IMPORTANT NOTE: TRY TO FIND REGISTER/LOGIN PAGES !!!

=== Host ===
Host: `;

const prompt_tries = `
=== REQS ===
LEFT AVAILABLE REQUESTS: `;

type MessageType = {
  'role': 'user' | 'assistant' | 'system',
  'content': string
};

type ReportData = {
  checks: {
    id: string;
    about: string;
    pages: string[];
    result: "ok" | "fail" | "warn";
    images: {"url": string, "selector": string}[]
  }[];
};

const customFetcher: Fetcher = async (input: RequestInfo | URL, init?: any) => {
    // Используем node-fetch или axios с отключенной проверкой SSL
    const agent = new Agent({
        rejectUnauthorized: false
    });
    let url = "";
    if (typeof input === 'string') {
        url = input;
    }
    else if (input instanceof Request) {
        url = input.url;
        const clonedRequest = input.clone();
        const bodyText = await clonedRequest.text();

        init = {
            method: input.method,
            headers: input.headers,
            body: bodyText,
            ...init
        };
    }
    else {
        url = input.toString();
    }
    const controller = new AbortController();
    const timeoutId = setTimeout (() => controller.abort(), 60 * 1000 * 5);
    try {
        let res =  await fetch(url, {
            ...init,
            agent,
            signal: controller.signal
        });
        return res as unknown as Response;
    }
    catch (e) {
        if (error.name == "AbortError") {
            console.log ("Запрос к Proxy прерван по таймауту");
        }
        else {
            console.error (e);
        }
        throw e;
    }
    finally {
        clearTimeout (timeoutId);
    }
};

export async function checkAi(sr: Data) {
    const openrouterSettings = resolveOpenRouterSettings(config.openrouter, process.env);
    const key = openrouterSettings.apiKey;
    const b = prompt + sr.baseUrl;
    const tries = 10;
    const model = openrouterSettings.model;
    const maxTextSize = config.worker.maxTextSize || 500000;

    const messages: MessageType[] = [{
        'role': 'system',
        'content': b + prompt_tries + String(tries)
    }];

    let openrouter = new OpenRouter({
        apiKey: key,
        httpClient: new HTTPClient ({fetcher: customFetcher}),
        ...(openrouterSettings.baseUrl ? { serverURL: openrouterSettings.baseUrl } : {}),
        timeoutMs: 60 * 1000 * 10
    });
    let foundChecks: {[key: string]: boolean} = {};

    for (let i = 0; i < tries + 5; i++) {
        try {
            const stream = await openrouter.chat.send({
            "chatRequest": {
                "model": model,
                "messages": messages,
                "stream": false,
                "plugins": [
                    {
                        "id": "context-compression",
                        "enabled": true
                    }
                ],
                "tools": [
                {
                    "type": "function",
                    "function": {
                    "name": "open",
                    "description": "Open rendered page content by URL |url| from browser Google Chrome. The page is treated as a file if it exceeds maxTextSize. Use it to open page.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                        "url": {
                            "type": "string",
                            "description": "The URL of the webpage to fetch and render"
                        }
                        },
                        "required": ["url"]
                    }
                    }
                },
                {
                    "type": "function",
                    "function": {
                    "name": "eval_js",
                    "description": "Execute JavaScript code on the current page and return the result",
                    "parameters": {
                        "type": "object",
                        "properties": {
                        "code": {
                            "type": "string",
                            "description": "JavaScript code to execute on the page (e.g. document.title, document.querySelectorAll('a').length). Example: (function () { return 5; })(); - returns 5"
                        }
                        },
                        "required": ["code"]
                    }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "reportError",
                        "description": "Report errors or warnings from page checks on finish your reasoning !!!IMPORTANT: CALL 'reportError' ONLY ON FINISH YOUR REASONING!!!",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "checks": {
                                    "type": "array",
                                    "description": "List of found check results on current iteration",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "id": {
                                                "type": "string",
                                                "description": "Unique identifier of the check"
                                            },
                                            "about": {
                                                "type": "string",
                                                "description": "About of found error in selected language. Use selected language. So in clear russian"
                                            },
                                            "pages": {
                                                "type": "array",
                                                "description": "List of URLs where the error or warn was found",
                                                "items": {
                                                    "type": "string",
                                                    "format": "uri"
                                                }
                                            },
                                            "result": {
                                                "type": "string",
                                                "enum": ["fail", "warn"],
                                                "description": "Result status of the check"
                                            },
                                            "images": {
                                                "type": "array",
                                                "description": "List of CSS selector to take a screenshot only on FAIL/WARN",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "url": {
                                                            "type": "string",
                                                            "format": "uri",
                                                            "description": "URL to endpoint to find an element with the provided CSS selector"
                                                        },
                                                        "selector": {
                                                            "type": "string",
                                                            "description": "Accepts a CSS selector for the element that contains the found error: '.cookie-banner', '#cookie-banner', 'div div .register-form'. Takes only the first found element. !!!IMPORTANT: The CSS path must be detailed and specific. ***ALLOWED ELEMENTS (CSS-SELECTOR):*** FORMS, COOKIE-BANNER, SPAN-TEXT. ***/ALLOWED ELEMENTS*** ***DENIED ELEMENTS TOTALY:*** CHECKBOX, BODY ***/DENIED ELEMENTS***!!!",
                                                            "pattern": "^(?!body$|html$).*"
                                                        }
                                                    },
                                                    "required": ["selector", "url"]
                                                }
                                            }
                                        },
                                        "required": ["id", "about", "result", "pages", "images"]
                                    }
                                }
                            },
                            "required": ["checks"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "finishReport",
                        "description": "Finish your report",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "about": {
                                    "type": "string",
                                    "description": "About the website, debug information. Use selected language. So in clear Russian"
                                }
                            },
                            "required": ["about"]
                        }
                    }
                }
                ]
            }
            });

            const msg = stream.choices[0]?.message;
            if (!msg) break;

            if (msg.toolCalls) {
                let sz = msg.toolCalls.length;

                while (msg.toolCalls.length) {
                    const toolCall = msg.toolCalls[msg.toolCalls.length - 1];
                    msg.toolCalls.pop();

                    if (toolCall && toolCall.type == "function") {
                    const func = toolCall.function;

                    if (i < tries) {
                        if (func.name == "open") {
                            messages.push({ 'role': 'assistant', 'content': func.arguments });

                            const args = JSON.parse(func.arguments) as { url: string; };
                            let content = `=== REQUEST URL ===\nurl:${args.url}\n` + prompt_tries + String(tries - i);

                            console.log(`Visit ${args.url}`);

                            if (await sr.open(args.url)) {
                            const fullContent = await sr.page.content();
                            const isLargeFile = fullContent.length > maxTextSize;
                            
                            content += `\n === OPENED ${args.url} ===\n`;
                            content += `\n isLargeFile=${isLargeFile}\n\n\n`;
                            } else {
                            content += `\n === NOT FOUND OR INTERNAL ERROR ===\n\n\n`;
                            }
                            
                            messages.push({ 'role': 'user', 'content': content });

                        } else if (func.name == "eval_js") {
                            messages.push({ 'role': 'assistant', 'content': func.arguments });

                            const args = JSON.parse(func.arguments) as { code: string };
                            console.log (args.code);
                            let result = '';
                            try {
                            const pageResult = await sr.page.evaluate(args.code);
                            result = JSON.stringify(pageResult, null, 2);
                            } catch (e: any) {
                            result = `JS Error: ${e.message || String(e)}`;
                            }
                            messages.push({ 'role': 'user', content: ' === JS EVAL RESULT ===\n' + result + '\n === END ===' });
                        }
                    }
                    else {  
                        messages.push({ 'role': 'assistant', 'content': 'Not available. Call a "reportError" and finish with "finishReport"' });
                    } 

                    if (func.name == "reportError") {
                        const args = JSON.parse(func.arguments) as ReportData;
                        let errorMsg: string = '';
                        console.log(func.arguments);
                        const previousURL = sr.page.url();
                        try {
                            for ( const p of args.checks) {
                                let imagesIds: string[] = [];
                                for (const cssSelector of p.images) {
                                    try {
                                        await sr.open (cssSelector.url);
                                        const elm = await sr.page.$(cssSelector.selector);
                                        console.log(cssSelector, elm);
                                        if (elm) {
                                            const image = await elm.screenshot ({ 'type': 'png', 'encoding': 'binary' });
                                            const resUpload = await sr.uploadImage (image);
                                            if (resUpload) {
                                                console.log(resUpload.image_id);
                                                imagesIds.push (resUpload.image_id);
                                            }
                                        }
                                    }
                                    catch (e) {
                                        if (e instanceof Error) {
                                            console.error ('Failed to take a screenshot', e.message);
                                            errorMsg = e.message;
                                            break;
                                        }
                                    }
                                }

                                if (errorMsg.length != 0) break;
                                
                                foundChecks[p.id] = true;
                                sr.result.checks.push({ id: p.id, result: p.result, data: { pages: p.pages, about: p.about }, images: imagesIds });
                            }
                        }
                        catch (e) {
                            console.error (e);
                        }
                        finally {
                            await sr.open (previousURL);
                        }
                        messages.push({ 'role': 'user', 'content': `${func.arguments}\n\n=== RESULT ===\n` + (errorMsg.length == 0 ? "ACCEPTED" : ("NOT ACCEPTED DUE TO " + errorMsg)) });
                    }
                        
                    if (func.name == "finishReport") {
                        console.log(func.arguments);
                        i = tries + 100;
                        const args = JSON.parse(func.arguments) as {"about": string};
                        sr.result.about = args.about;
                    }
                    }
                }

                if (sz) continue;
            }
        }
        catch (e) {
            console.error (e);
            continue;
        }
    }

    const checks = ["sep-consent", "foreign-words", "privacy-policy", 
        "cookie-banner", "consent-forms", "email-pdn", "ad-marking", 
        "minors-data", "special-categ"];

    for (const p of checks) {
        if (p in foundChecks)
            continue;
        sr.result.checks.push ({
            'id': p,
            'result': 'ok',
            'images': []
        });
    }
}
