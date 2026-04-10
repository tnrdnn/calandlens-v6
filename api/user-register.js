export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const SUPABASE_URL         = process.env.VITE_SUPABASE_URL || 'https://omqnmdgaotlledbhtlvj.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  let body = {};
  try { body = await req.json(); } catch {}

  const { user_id, full_name } = body;
  if (!user_id) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing user_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const country = req.headers.get('x-vercel-ip-country') || 'XX';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ user_id, full_name: full_name || '', country }),
  });

  return new Response(JSON.stringify({ ok: res.ok }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
