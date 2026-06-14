import http from 'node:http';
import { readFileSync } from 'node:fs';
import { runCheck, initBrowser } from './runner.js';

interface Config {
  port: number;
  openrouter: { apiKey: string; model: string };
  worker: { pageTimeout: number; maxPageSize: number; maxTextSize: number };
  geoip: { serviceUrl: string };
  checks: { fast: string[]; detail: string[] };
}

const config: Config = JSON.parse(readFileSync('./config.json', 'utf-8'));

const errorCodes = {
  ERR_OK: 'ok',
  ERR_INTERNAL: 'internal error',
  ERR_PAGE_OPEN_TIMEOUT: 'page open timeout',
  ERR_AI_FAILED: 'AI check failed',
  ERR_INVALID_REQUEST: 'invalid request body',
} as const;

function makeResponse(code: string, reqId: string, data?: any, msg?: string) {
  const resp: any = { code, 'req-id': reqId };
  if (data) resp.data = data;
  if (msg) resp.msg = msg;
  return resp;
}

async function handleCheck(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';
  for await (const chunk of req) body += chunk;

  let parsed: any;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(makeResponse(errorCodes.ERR_INVALID_REQUEST, '', null, 'invalid JSON')));
    return;
  }

  const { url, type, 'req-id': reqId, fallback } = parsed;

  if (!url || !type || !reqId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(makeResponse(errorCodes.ERR_INVALID_REQUEST, reqId || '', null, 'url, type, req-id required')));
    return;
  }

  // Accept the task immediately
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(makeResponse(errorCodes.ERR_OK, reqId, { status: 'accepted' })));

  // Report progress via fallback
  const reportProgress = async (progress: number, status: string, completed: string[] = [], errors: string[] = [], resultData?: any) => {
    if (!fallback) return;
    console.log (resultData);
    try {
      const payload = JSON.stringify({
        code: errorCodes.ERR_OK,
        'req-id': reqId,
        progress,
        status,
        completed,
        errors,
        data: resultData,
      });
      const urlObj = new URL(fallback);
      const options: http.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      };
      const r = http.request(options);
      r.write(payload);
      r.end();
    } catch (e) {
      console.error('Failed to report progress:', e);
    }
  };

  try {
    await reportProgress(10, 'starting');

    const browser = await initBrowser();
    try {
      await reportProgress(20, 'browser_ready');

      const results = await runCheck(browser, url, type, config, async (progress, status, completed, errors) => {
        await reportProgress(progress, status, completed, errors);
      });

      await reportProgress(100, 'completed', results.map((r: any) => r.id), [], results);
    } finally {
      await browser.close();
    }
  } catch (e: any) {
    console.error('Check failed:', e);
    await reportProgress(0, 'failed', [], [e.message || String(e)]);
  }
}

async function main() {
  console.log("hello world!");
    await initBrowser();

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/check') {
      await handleCheck(req, res);
    } else if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
    }
  });

  server.listen(config.port, () => {
    console.log(`[Worker] Listening on port ${config.port}`);
  });
}

main().catch(console.error);