import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getApiBaseUrl, fetchApiJson } from './api.ts';

describe('API Utility & JSON parser', () => {
  test('getApiBaseUrl returns sanitized string or empty string', () => {
    const url = getApiBaseUrl();
    assert.equal(typeof url, 'string');
    assert.equal(url.endsWith('/'), false);
  });

  test('fetchApiJson rejects HTML response with human-readable error instead of SyntaxError', async () => {
    // Mock global fetch to return an HTML page simulating Apache/HostGator SPA redirect
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response('<!doctype html><html><body>Error 404 Not Found</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    }) as any;

    try {
      await assert.rejects(
        async () => {
          await fetchApiJson('/api/mercadopago/create-pix');
        },
        (err: any) => {
          assert.equal(err.isHtmlResponse, true);
          assert.match(err.message, /HTML/i);
          // Crucial check: must NOT be an unhandled raw SyntaxError: Unexpected token '<'
          assert.equal(err.name, 'Error');
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('fetchApiJson successfully returns parsed JSON object on valid API response', async () => {
    const originalFetch = globalThis.fetch;
    const mockData = { paymentId: 'pix_12345', qrCode: '000201...', status: 'pending' };

    globalThis.fetch = (async () => {
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }) as any;

    try {
      const res = await fetchApiJson<{ paymentId: string; qrCode: string }>('/api/mercadopago/create-pix');
      assert.equal(res.paymentId, 'pix_12345');
      assert.equal(res.qrCode, '000201...');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
