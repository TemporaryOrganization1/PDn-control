import { readFileSync } from 'node:fs';
import { OpenRouter } from '@openrouter/sdk';
import type { Data } from '../data.js';

const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

const prompt = `You are a legal compliance auditor for Russian Federation laws (152-FZ, 38-FZ, 168-FZ, 420-FZ).

Inspect the provided website HTML by using tool and output a JSON report for the following 9 checks.

DO NOT check if cookies load before consent. IGNORE cookie loading behavior.
ONLY check for the presence of a cookie banner with specific buttons.

=== CHECKS ===

1. "Separate Consent Document (152-FZ Art. 9, effective 01.09.2025)"
   - id - "sep-consent"
   - Look for: A dedicated, separate document explicitly titled "Согласие на обработку персональных данных" (or similar).
   - fail: Consent is embedded inside User Agreement / Terms of Service / Privacy Policy.
   - ok: Separate document exists as a distinct page or a distinct checkblock.

2. "Foreign Words Without Translation (168-FZ Art. 10.1)"
   - id - "foreign-words"
   - Look for: User interface text (buttons, labels, menus, forms) in foreign languages.
   - FAIL: Foreign text without an equivalent Russian translation nearby (same font size, same visual prominence).
   - PASS: Everything is in Russian, OR foreign words are registered trademarks or have Russian translation.

3. "Privacy Policy (152-FZ Art. 18)"
   - id - "privacy-policy"
   - Look for: Document named "Политика обработки персональных данных" or "Privacy Policy".
   - FAIL: No document found. Document exists but lacks: purposes of data processing, list of collected data, retention periods, data destruction procedure.
   - PASS: Complete document exists and is linked in footer.

4. "Cookie Banner (152-FZ / 420-FZ)"
   - id - "cookie-banner"
   - Look for: A banner/widget that appears on page load asking about cookies.
   - REQUIRED BUTTONS: "Принять" (Accept) AND "Отказаться" (Reject) OR "Настроить" (Settings).
   - FAIL: Banner has only "Accept" button without "Reject" button. Banner uses implied consent text ("Продолжая использование сайта..."). Different colors: "Accept" is green and "Reject" is gray.
   - PASS: Banner exists with both Accept and Reject/Configure buttons.
   - WARN: No cookie banner.

5. "Consent in Web Forms (152-FZ Art. 9)"
   - id - "consent-forms"
   - Look for: Any form that collects personal data (name, phone, email, address).
   - REQUIRED: A checkbox (чекбокс) that is NOT pre-ticked by default. Label must explicitly state agreement to Personal Data processing.
   - FAIL: No checkbox. Checkbox is pre-ticked. Text says "By submitting this form you agree..." without a checkbox.
   - PASS: Unticked checkbox next to consent text and link to Privacy Policy.

6. "Email for PD Requests (152-FZ Art. 18)"
   - id - "email-pdn"
   - Look for: Email address or contact form specifically for personal data requests (deletion, correction, withdrawal of consent).
   - FAIL: No email found. Only general "info@" or "sales@" email with no reference to PD requests.
   - PASS: Dedicated email (e.g., "pd@site.ru", "personaldata@site.ru") mentioned in Privacy Policy or Contacts section.

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

9. "Special Categories of PD (152-FZ Art. 10)"
   - id - "special-categ"
   - Look for: Forms asking for health data, race, religion, political views, biometrics, intimate life.
   - FAIL: Collecting special category data without explicit written consent and exceptional legal basis.
   - PASS: No special categories collected.

=== OUTPUT FORMAT ===
For each check print in JSON format the result is 'ok' for PASS, 'fail' for FAIL, 'warn' for WARN and the pages URL of data. 
You can write brief description about error in clear english. Give the result in \`\`\`json ... \`\`\` format. Finish the chat with all results as 'ok' if 
the main page doesn't exist and tools return NOT FOUND.
Example:
\`\`\`json
[
    {
        "id": "minors-data",
        "result": "fail",
        "pages": ["https://example.com/fitness", "https://example.com/personal-data"],
        "about": "has no parental consent mechanism"
    },
    {
        "id": "privacy-policy",
        "result": "ok",
        "pages": ["https://example.com/privacy-policy.pdf"],
        "about": "has no parental consent mechanism"
    },
    {
        "id": "ad-marking",
        "result": "ok"
    }
]
\`\`\`

=== VISITS ===
It's more preferable if you will visit as more pages if you wish.
Find links <a href=...> and open it. If the main page doesn't exist you can finish chat without error messages in the response.

=== Host ===
Host: `;

const prompt_tries = `
=== REQS ===
Left tries: `;

type MessageType = {
  'role': 'user' | 'assistant' | 'system',
  'content': string
};

export async function checkAi(sr: Data) {
  const key = config.openrouter.apiKey || process.env.OPENROUTER_API_KEY || '';
  const b = prompt + sr.baseUrl;
  const tries = 10;
  const model = config.openrouter.model || 'google/gemma-4-31b-it';
  const maxTextSize = config.worker.maxTextSize || 500000;
  const visitedPages = new Set<string>();

  const messages: MessageType[] = [{
    'role': 'system',
    'content': b + prompt_tries + String(tries)
  }];

  let openrouter = new OpenRouter({ apiKey: key });
  let zzp = 0;

  for (let i = 0; i < tries; i++) {
    const stream = await openrouter.chat.send({
      "chatRequest": {
        "model": model,
        "messages": messages,
        "stream": false,
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
            
            messages.push({ 'role': 'system', 'content': content });

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
            messages.push({ 'role': 'system', content: ' === JS EVAL RESULT ===\n' + result + '\n === END ===' });
          }
        }
      }

      if (sz) continue;
    }

    let response = stream.choices[0]?.message.content;
    if (response) {
      // Try to extract JSON array from the response
      let jsonStr = response;
      
      // First try to find ```json ... ``` code block
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) jsonStr = codeBlockMatch[1];

      try {
        const z = JSON.parse(jsonStr) as { id: string; result: 'ok' | 'fail' | 'warn'; pages?: string[]; about?: string }[];
        for (const p of z) {
          sr.result.checks.push({ id: p.id, result: p.result, data: { pages: p.pages, about: p.about } });
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        console.error('Raw JSON (first 1000 chars):', jsonStr.substring(0, 1000));
        messages.push({ 'role': 'system', 'content': 'Invalid output. Output must be in JSON format.' });
        continue;
      }
    }

    break;
  }
}