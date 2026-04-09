export const config = { runtime: 'edge' };

async function makeToken(secret, user) {
  const enc = new TextEncoder();
  const day = Math.floor(Date.now() / 86400000);
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
  const ADMIN_USER   = process.env.ADMIN_USER;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return new Response(JSON.stringify({ ok: false }), { status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expected = await makeToken(ADMIN_SECRET, ADMIN_USER);
  const ok = token === expected;

  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 401,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
