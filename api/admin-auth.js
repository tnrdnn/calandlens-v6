export const config = { runtime: 'edge' };

async function makeToken(secret, user) {
  const enc = new TextEncoder();
  const day = Math.floor(Date.now() / 86400000); // changes daily
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${user}:${day}`));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ADMIN_USER   = process.env.ADMIN_USER;
  const ADMIN_PASS   = process.env.ADMIN_PASS;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  let body = {};
  try { body = await req.json(); } catch (_) {}

  if (body.user !== ADMIN_USER || body.pass !== ADMIN_PASS) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = await makeToken(ADMIN_SECRET, ADMIN_USER);

  return new Response(JSON.stringify({ ok: true, token }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
