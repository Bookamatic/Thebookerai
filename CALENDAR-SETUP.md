# Google Calendar Integration – Setup Guide

## What's included
1. **connect.html** – Page you send to each client to connect their Google Calendar (one time)
2. **nolas-nails.html** – Updated widget with business hours enforcement + calendar badge

## Step 1 – Add your Google Client ID to connect.html
 773624437328-gd2ed4ob0o7q7nc5hamnejkec5lkehib.apps.googleusercontent.com
Open connect.html and find this line:
```
const clientId = ' 773624437328-gd2ed4ob0o7q7nc5hamnejkec5lkehib.apps.googleusercontent.com';
```
Replace with your actual Client ID from Google Cloud Console.

## Step 2 – Upload both files to GitHub
Drag connect.html and nolas-nails.html into your GitHub repo.

## Step 3 – Send client their connect link
When you sign a new client, send them this link:
```
https://thebookerai.vercel.app/connect.html?biz=Nolas+Nails&slug=nolas-nails
```
They click it, sign into Google, done. Their calendar is connected.

## Step 4 – Customise business hours per client
In each client's widget file, update the CONFIG section:
```javascript
hours: {
  monday: { open: "9:00", close: "19:00" },
  tuesday: { open: "9:00", close: "19:00" },
  ...
  sunday: null  // null = closed
}
```

## What works right now
✅ Business hours enforcement (AI won't book outside hours)
✅ Sunday/day-off blocking  
✅ Calendar badge on booking confirmation
✅ Client connects their own Google Calendar

## What needs a backend for full live checking
To check if a SPECIFIC time slot is already booked (not just business hours),
you need a small backend server. This requires:
- A Supabase function OR a Vercel serverless function
- Store each client's Google refresh token after they connect
- Query their calendar before confirming a booking

Tell James in Claude when you're ready to build this — it's the next upgrade.
