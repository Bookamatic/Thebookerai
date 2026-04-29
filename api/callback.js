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

    console.log(`Calendar connected for: ${bizInfo.biz}`);

    return res.redirect(`/connect-success.html?biz=${encodeURIComponent(bizInfo.biz)}&slug=${bizInfo.slug}&status=success`);

  } catch(error) {
    console.error('Callback error:', error);
    return res.redirect(`/connect-success.html?biz=${encodeURIComponent(bizInfo.biz)}&slug=${bizInfo.slug}&status=error`);
  }
}
