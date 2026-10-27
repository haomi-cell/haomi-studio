/**
 * Cloudflare Pages / Worker Function: /api/sairi
 * Proxies Sairi Payment Gateway API requests:
 * - GET /api/sairi/balance -> https://api.sairibot.my.id/api/balance?apikey=...
 * - GET /api/sairi/invoice?amount=... -> https://api.sairibot.my.id/api/invoice?apikey=...&amount=...
 * - GET /api/sairi/invoice/status?invoice_id=... -> https://api.sairibot.my.id/api/invoice/status?apikey=...&invoice_id=...
 */

const DEFAULT_SAIRI_BASE = 'https://api.sairibot.my.id/api';
const DEFAULT_SAIRI_KEY = 'SKY_39575737d3d744d8';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '');

    const apiBase = ((env && env.SAIRI_API_BASE) || DEFAULT_SAIRI_BASE).replace(/\/+$/, '');
    const apiKey = ((env && env.SAIRI_API_KEY) || url.searchParams.get('apikey') || DEFAULT_SAIRI_KEY).trim().replace(/\.$/, '');

    let action = url.searchParams.get('action') || '';
    if (pathname.endsWith('/balance')) action = 'balance';
    else if (pathname.endsWith('/invoice/status') || pathname.endsWith('/status')) action = 'status';
    else if (pathname.endsWith('/invoice')) action = 'invoice';

    let targetUrl = '';
    if (action === 'balance') {
      targetUrl = `${apiBase}/balance?apikey=${encodeURIComponent(apiKey)}`;
    } else if (action === 'invoice') {
      const amount = parseInt(url.searchParams.get('amount') || '10000', 10);
      if (!amount || amount < 100) {
        return new Response(JSON.stringify({ success: false, error: 'Nominal tidak valid' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
      targetUrl = `${apiBase}/invoice?apikey=${encodeURIComponent(apiKey)}&amount=${encodeURIComponent(amount)}`;
    } else if (action === 'status') {
      const invoiceId = (url.searchParams.get('invoice_id') || '').trim();
      if (!invoiceId) {
        return new Response(JSON.stringify({ success: false, error: 'Parameter invoice_id wajib diisi' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
      targetUrl = `${apiBase}/invoice/status?apikey=${encodeURIComponent(apiKey)}&invoice_id=${encodeURIComponent(invoiceId)}`;
    } else {
      return new Response(JSON.stringify({
        success: true,
        gateway: 'Sairi Payment Gateway',
        base: apiBase,
        endpoints: ['/api/sairi/balance', '/api/sairi/invoice?amount=50000', '/api/sairi/invoice/status?invoice_id=ID']
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Gagal menghubungi Sairi Payment Gateway'
    }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
