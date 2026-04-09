export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://omqnmdgaotlledbhtlvj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcW5tZGdhb3RsbGVkYmh0bHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjMxNTYsImV4cCI6MjA5MDk5OTE1Nn0.wO5LUsrNB1XK7Yr9WXlkTMPACiRZ3cUuGBpthot3iRc';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Vercel'in otomatik eklediği ülke header'ı
  const country = req.headers.get('x-vercel-ip-country') || 'XX';

  let body = {};
  try { body = await req.json(); } catch (_) {}

  await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_type: body.device_type || 'unknown',
      browser:     body.browser     || 'unknown',
      referrer:    body.referrer    || 'direct',
      country,
    }),
  });

  return new Response('ok', {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
