export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, start_date, end_date } = req.body;

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    const clientRes = await fetch(
      `${supabaseUrl}/rest/v1/clients?slug=eq.${slug}&select=access_token,refresh_token,token_expiry,calendar_id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const clients = await clientRes.json();

    if (!clients || clients.length === 0) {
      return res.status(200).json({ busy: [] });
    }

    let { access_token, refresh_token, token_expiry, calendar_id } = clients[0];

    const now = Math.floor(Date.now() / 1000);
    if (token_expiry && now >= token_expiry - 60 && refresh_token) {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          grant_type: 'refresh_token'
        })
      });
      const refreshed = await refreshRes.json();
      if (refreshed.access_token) access_token = refreshed.access_token;
    }

    const freebusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        timeMin: start_date,
        timeMax: end_date,
        items: [{ id: calendar_id || 'primary' }]
      })
    });

    const freebusy = await freebusyRes.json();
    const busy = freebusy.calendars?.[calendar_id || 'primary']?.busy || [];

    return res.status(200).json({ busy });
  } catch(error) {
    console.error('Get slots error:', error);
    return res.status(200).json({ busy: [] });
  }
}
