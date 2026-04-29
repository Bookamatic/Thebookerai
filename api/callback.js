export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code received');
  }

  let bizInfo = {};
  try {
    bizInfo = JSON.parse(decodeURIComponent(state));
  } catch(e) {
    bizInfo = { biz: 'Unknown', slug: 'unknown' };
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://www.thebookerai.com/auth/callback',
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token error:', tokens);
      return res.redirect(`/connect-success.html?biz=${encodeURIComponent(bizInfo.biz)}&slug=${bizInfo.slug}&status=error`);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    const saveResponse = await fetch(`${supabaseUrl}/rest/v1/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        slug: bizInfo.slug,
        business_name: bizInfo.biz,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expiry: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
        calendar_id: 'primary'
      })
    });

    if (!saveResponse.ok) {
      const err = await saveResponse.text();
      console.error('Supabase save error:', err);
    } else {
      console.log(`Calendar connected and saved for: ${bizInfo.biz}`);
    }

    return res.redirect(`/connect-success.html?biz=${encodeURIComponent(bizInfo.biz)}&slug=${bizInfo.slug}&status=success`);

  } catch(error) {
    console.error('Callback error:', error);
    return res.redirect(`/connect-success.html?biz=${encodeURIComponent(bizInfo.biz)}&slug=${bizInfo.slug}&status=error`);
  }
}
