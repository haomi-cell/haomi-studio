export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API Routes handled by Cloudflare Functions or Workers
    if (url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // Default static asset fetching with caching rules
    const response = await env.ASSETS.fetch(request);
    
    // Custom response headers for PWA & caching
    const newHeaders = new Headers(response.headers);
    
    if (url.pathname.endsWith('.wasm')) {
      newHeaders.set('Content-Type', 'application/wasm');
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
