import { describe, expect, it } from 'vitest';
import { prepareHttpsConnection } from '../src/checks/https.js';
import { prepareSslConnection } from '../src/checks/ssl.js';

function makeState() {
  return {
    subs: { request: [], response: [] },
    result: { checks: [] },
  } as any;
}

describe('HTTPS connection check', () => {
  it('passes when no HTTP endpoints are requested', async () => {
    const state = makeState();
    await prepareHttpsConnection(state);
    const subscription = state.subs.request[0];
    const data = subscription.init();

    subscription.cb({ url: () => 'https://example.com/app.js' }, data);
    subscription.fin(data);

    expect(state.result.checks).toEqual([
      { id: 'https', result: 'ok', data: { endpoints: [] }, images: [] },
    ]);
  });

  it('fails and records domains when HTTP endpoints are requested', async () => {
    const state = makeState();
    await prepareHttpsConnection(state);
    const subscription = state.subs.request[0];
    const data = subscription.init();

    subscription.cb({ url: () => 'http://cdn.example.com/app.js' }, data);
    subscription.cb({ url: () => 'http://cdn.example.com/style.css' }, data);
    subscription.fin(data);

    expect(state.result.checks).toEqual([
      { id: 'https', result: 'fail', data: { endpoints: ['cdn.example.com'] }, images: [] },
    ]);
  });
});

describe('SSL/TLS check', () => {
  it('passes when every response has trusted certificate details', async () => {
    const state = makeState();
    await prepareSslConnection(state);
    const subscription = state.subs.response[0];
    const data = subscription.init();

    subscription.cb(
      {
        url: () => 'https://example.com/',
        status: () => 200,
        request: () => ({ redirectChain: () => [] }),
        securityDetails: () => ({
          issuer: () => 'Trusted CA',
          subjectName: () => 'example.com',
        }),
      },
      data,
    );
    subscription.fin(data);

    expect(state.result.checks).toEqual([
      { id: 'ssl/tls', result: 'ok', data: { endpoints: {} }, images: [] },
    ]);
  });

  it('does not fail Russian HTTPS endpoints when Chromium hides Russian trust details', async () => {
    const state = makeState();
    await prepareSslConnection(state);
    const subscription = state.subs.response[0];
    const data = subscription.init();

    subscription.cb(
      {
        url: () => 'https://bs.yandex.ru/',
        status: () => 200,
        request: () => ({ redirectChain: () => [] }),
        securityDetails: () => null,
      },
      data,
    );
    subscription.fin(data);

    expect(state.result.checks).toEqual([
      {
        id: 'ssl/tls',
        result: 'ok',
        data: {
          endpoints: {},
          acceptedRussianCertificates: ['bs.yandex.ru'],
        },
        images: [],
      },
    ]);
  });

  it('fails and records self-signed or insecure endpoints', async () => {
    const state = makeState();
    await prepareSslConnection(state);
    const subscription = state.subs.response[0];
    const data = subscription.init();

    subscription.cb(
      {
        url: () => 'https://self.example.com/',
        status: () => 200,
        request: () => ({ redirectChain: () => [] }),
        securityDetails: () => ({
          issuer: () => 'self.example.com',
          subjectName: () => 'self.example.com',
        }),
      },
      data,
    );
    subscription.cb(
      {
        url: () => 'http://plain.example.com/',
        status: () => 200,
        request: () => ({ redirectChain: () => [] }),
        securityDetails: () => null,
      },
      data,
    );
    subscription.fin(data);

    expect(state.result.checks).toEqual([
      {
        id: 'ssl/tls',
        result: 'fail',
        data: {
          endpoints: {
            'plain.example.com': 'insecure',
            'self.example.com': 'self-signed',
          },
        },
        images: [],
      },
    ]);
  });
});
