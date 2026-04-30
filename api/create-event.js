export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, datetime, duration_minutes, service, notes, timezone } = req.body;

  if (!slug || !datetime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
      return res.status(200).json({ success: false, message: 'No calendar connected' });
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
      if (refreshed.access_token) {
        access_token = refreshed.access_token;
        await fetch(`${supabaseUrl}/rest/v1/clients?slug=eq.${slug}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            access_token: refreshed.access_token,
            token_expiry: Math.floor(Date.now() / 1000) + (refreshed.expires_in || 3600)
          })
        });
      }
    }

    const tz = timezone || 'America/New_York';

    // Format datetime as local time string (no UTC conversion) so Google Calendar
    // correctly interprets it in the business timezone
    const pad = n => String(n).padStart(2, '0');
    const d = new Date(datetime);
    const startTime = `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`;
    const endDate = new Date(d.getTime() + (duration_minutes || 30) * 60000);
    const endTime = `${endDate.getUTCFullYear()}-${pad(endDate.getUTCMonth()+1)}-${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}:${pad(endDate.getUTCMinutes())}:00`;

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id || 'primary')}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          summary: service || 'Appointment',
          description: notes ? `Notes: ${notes}` : 'Booked via The Booker AI',
          start: { dateTime: startTime, timeZone: tz },
          end: { dateTime: endTime, timeZone: tz }
        })
      }
    );

    const event = await eventRes.json();

    if (event.error) {
      console.error('Calendar event error:', event.error);
      return res.status(200).json({ success: false, message: 'Could not create calendar event' });
    }

    return res.status(200).json({ success: true, eventId: event.id });

  } catch(error) {
    console.error('Create event error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
