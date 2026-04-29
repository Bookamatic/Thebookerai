# The Booker AI – Setup Guide for James
## thebookerai.com

---

## What you have
1. **widget/index.html** – The booking chatbot your clients embed on their website
2. **admin/index.html** – Your dashboard to manage all clients & bookings

---

## Step 1 – Add your Anthropic API key to the widget

Open `widget/index.html` in any text editor (Notepad, TextEdit, VSCode)

Find this line near the top of the `<script>` section:
```
apiKey: "YOUR_ANTHROPIC_API_KEY",
```

Replace `YOUR_ANTHROPIC_API_KEY` with your actual key from console.anthropic.com

---

## Step 2 – Deploy to Vercel (free)

1. Go to **vercel.com** and sign up (use your GitHub account if you have one)
2. Click "Add New Project"
3. Click "Deploy from file upload" or connect GitHub
4. Upload the entire `thebookerai` folder
5. Click Deploy – Vercel gives you a free URL like `thebookerai.vercel.app`

---

## Step 3 – Connect your domain (thebookerai.com)

In Vercel:
1. Go to your project → Settings → Domains
2. Add `thebookerai.com`
3. Vercel will show you DNS records to add

In Namecheap:
1. Go to Domain List → Manage → Advanced DNS
2. Add the records Vercel shows you (CNAME or A record)
3. Takes 10-30 minutes to go live

---

## Step 4 – Customise for each client

When you sign a new client, edit the widget's CONFIG section:
```javascript
const CONFIG = {
  businessName: "Their Business Name",  // ← change this
  businessType: "tattoo",               // ← "tattoo" or "hair"
  apiKey: "YOUR_ANTHROPIC_API_KEY",
};
```

Deploy a separate widget page for each client on Vercel.

---

## Step 5 – Give client their embed code

Send the client this one line to paste on their website:
```html
<iframe src="https://thebookerai.com/clients/BUSINESSNAME" width="440" height="700" frameborder="0"></iframe>
```

Or they can just link directly to their booking page.

---

## Pricing to charge clients
- **Starter** $99/month – up to 100 bookings/month
- **Pro** $149/month – unlimited bookings + priority support
- **Premium** $199/month – custom branding + SMS reminders

---

## Your costs (per client)
- Anthropic API: ~$3-8/month per active client
- Vercel hosting: Free up to 100 clients
- Domain: $11.48/year (already paid)

**Profit per client: ~$90-95/month**
**At 10 clients: ~$900-950/month profit**
**At 50 clients: ~$4,500-4,750/month profit**

---

## Questions? 
Come back to Claude and ask – I'll help you with every step.
