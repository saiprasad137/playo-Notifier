# Playo Notifier

Polls Playo every 5 minutes for new badminton games within 5km of your location and sends an email notification.

---

## Setup

### Step 1 — Install dependencies

```bash
cd playo-notifier
npm install
```

### Step 2 — Find the Playo API endpoint (one-time, ~5 minutes)

1. Open **https://playo.co** in Chrome and log in
2. Open **DevTools** → **Network** tab → select **Fetch/XHR** filter
3. Search for badminton games near Hyderabad
4. Look for a request that returns a JSON list of activities (usually named `activities`, `activitylist`, `feed`, or similar)
5. Click that request and copy:
   - **Request URL** → paste as `PLAYO_API_URL` in your `.env`
   - **Authorization** header (if present) → paste as `PLAYO_AUTH_HEADER`
   - Any other required headers (Cookie, x-device-id, etc.) → add to `PLAYO_EXTRA_HEADERS` as JSON
6. Look at the **Response** JSON and check if the field names in `playo.js → extractGames()` match. Update them if needed.

### Step 3 — Configure environment

```bash
cp .env.example .env
# Edit .env and fill in PLAYO_API_URL, PLAYO_AUTH_HEADER, and Gmail credentials
```

### Step 4 — Set up Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Create an app password for "Mail"
3. Copy the 16-character password into `GMAIL_APP_PASSWORD` in your `.env`

### Step 5 — Run locally to test

```bash
npm start
```

You should see logs like:
```
Playo notifier running. Polling every 5 min...
[2026-03-23T10:00:00.000Z] Checking for new badminton games...
No new games found (checked 3 total nearby games).
```

---

## Deploy to a free server (Railway)

1. Push this repo to GitHub (make sure `.env` is in `.gitignore`)
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add your environment variables under **Variables** (same keys as `.env`)
4. Railway will run `npm start` automatically — it stays on 24/7

Alternatively use **Render** (https://render.com) → New Web Service → same steps.

---

## How it works

```
Every 5 minutes:
  1. Call Playo API for badminton games in Hyderabad
  2. Filter to games within 5km of (17.473318, 78.482045)
  3. Cross-check against seen-games.json (persisted IDs)
  4. For any NEW games → send email to saiprasad14350@gmail.com
  5. Mark those game IDs as seen
```

---

## Tuning

| What to change | Where |
|---|---|
| Poll frequency | `config.js` → `POLL_INTERVAL` (cron syntax) |
| Radius | `config.js` → `RADIUS_KM` |
| Your coordinates | `config.js` → `MY_LAT`, `MY_LNG` |
| Notification email | `config.js` → `EMAIL_TO` |
