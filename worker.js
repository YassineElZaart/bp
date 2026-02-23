/**
 * Cloudflare Worker entry point.
 * Static files (index.html, CSS, JS, images) are served automatically by the assets binding.
 * This worker only handles dynamic API routes.
 */

import { handleContact, handleContactOptions } from './functions/api/contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // POST /api/contact — send email
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }

    // OPTIONS /api/contact — CORS preflight
    if (url.pathname === '/api/contact' && request.method === 'OPTIONS') {
      return handleContactOptions();
    }

    // Everything else (static files) is handled by the assets binding automatically.
    // If we reach here, nothing matched — return 404.
    return new Response('Not found', { status: 404 });
  },
};
