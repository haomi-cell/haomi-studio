/**
 * Cloudflare Worker Entrypoint with Static Assets & API Routing (HAOMI Studio)
 */
import { onRequestPost as handleSharePost, onRequestOptions as handleShareOptions } from './functions/api/share.js';
import { onRequestGet as handleProjectGet, onRequestOptions as handleProjectOptions } from './functions/api/project.js';
import { onRequestPost as handleSairiPost, onRequestOptions as handleSairiOptions } from './functions/api/sairi.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route /api/share
    if (url.pathname === '/api/share' || url.pathname === '/api/share/') {
      const context = { request, env, params: {}, waitUntil: ctx.waitUntil.bind(ctx), next: () => env.ASSETS.fetch(request), data: {} };
      if (request.method === 'OPTIONS') return handleShareOptions(context);
      if (request.method === 'POST') return handleSharePost(context);
    }

    // Route /api/project
    if (url.pathname === '/api/project' || url.pathname === '/api/project/') {
      const context = { request, env, params: {}, waitUntil: ctx.waitUntil.bind(ctx), next: () => env.ASSETS.fetch(request), data: {} };
      if (request.method === 'OPTIONS') return handleProjectOptions(context);
      if (request.method === 'GET') return handleProjectGet(context);
    }

    // Route /api/sairi
    if (url.pathname === '/api/sairi' || url.pathname === '/api/sairi/') {
      const context = { request, env, params: {}, waitUntil: ctx.waitUntil.bind(ctx), next: () => env.ASSETS.fetch(request), data: {} };
      if (request.method === 'OPTIONS') return handleSairiOptions(context);
      if (request.method === 'POST') return handleSairiPost(context);
    }

    // Default: Serve static assets (HTML, JS, CSS, Media)
    return env.ASSETS.fetch(request);
  }
};
