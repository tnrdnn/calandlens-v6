export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://omqnmdgaotlledbhtlvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' },
    });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const country = req.headers.get('x-vercel-ip-country') || 'XX';

  let body = {};
  try { body = await req.json(); } catch (_) {}

  const { user_id, email } = body;
  if (!user_id) return new Response('Missing user_id', { status: 400 });

  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({ id: user_id, email, country }),
  });

  return new Response('ok', {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
