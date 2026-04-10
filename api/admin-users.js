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
  const ADMIN_USER          = process.env.ADMIN_USER;
  const ADMIN_SECRET        = process.env.ADMIN_SECRET;
  const SUPABASE_URL         = process.env.VITE_SUPABASE_URL || 'https://omqnmdgaotlledbhtlvj.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'No token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expected = await makeToken(ADMIN_SECRET, ADMIN_USER);
  if (token !== expected) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch all users from Supabase Admin API (paginated)
  let users = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const batch = data.users || [];
    users = users.concat(batch);

    if (batch.length < perPage) break;
    page++;
  }

  // Fetch profiles (country + full_name)
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=user_id,full_name,country`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const profilesData = profilesRes.ok ? await profilesRes.json() : [];
  const profileMap = {};
  profilesData.forEach(p => { profileMap[p.user_id] = p; });

  // Merge and return
  const result = users.map(u => ({
    id:           u.id,
    email:        u.email,
    full_name:    profileMap[u.id]?.full_name || u.user_metadata?.full_name || '',
    country:      profileMap[u.id]?.country || 'XX',
    created_at:   u.created_at,
    last_sign_in: u.last_sign_in_at,
    provider:     u.app_metadata?.provider || 'email',
    confirmed:    !!u.email_confirmed_at,
  }));

  return new Response(JSON.stringify({ ok: true, users: result }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
