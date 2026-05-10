# Scanbers – Setup Guide

## Prerequisites

- Node.js 18+ (https://nodejs.org)
- A Google account

---

## Step 1 – Set up Google Sheets + Apps Script backend

### 1.1 Create the spreadsheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it **Scanbers Reports** (or anything you like).
3. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`

### 1.2 Create the Apps Script web app
1. In the spreadsheet, click **Extensions → Apps Script**.
2. Delete any existing code in the editor.
3. Copy the entire contents of [`apps-script/Code.gs`](apps-script/Code.gs) and paste it in.
4. Click **Save** (💾).

### 1.3 Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon ⚙ next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `Scanbers API v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` *(allows the React app to call it without login)*
4. Click **Deploy**.
5. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

> **Note:** Every time you edit Code.gs you must create a **new deployment** (or re-deploy to the same deployment) for changes to take effect. "Test deployments" do NOT work with CORS from a browser.

---

## Step 2 – Configure the React app

```bash
# In the scanbers/ directory:
cp .env.example .env
```

Open `.env` and replace the placeholder URL with your Web App URL:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## Step 3 – Install and run

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Step 4 – Build for production

```bash
npm run build
```

The `dist/` folder can be deployed to any static host (Netlify, Vercel, GitHub Pages, etc.).

> **Vite SPA routing:** If you deploy to a subdirectory, add `base: '/your-path/'` in `vite.config.js`.  
> For Netlify/Vercel, add a redirect rule so all routes serve `index.html`.

---

## Google Sheets column layout (auto-created)

| Column | Field |
|--------|-------|
| A | ID (UUID) |
| B | Reported At (ISO date) |
| C | Category |
| D | Scammer Name |
| E | Phone Number |
| F | Account Number |
| G | Bank Name |
| H | Description |
| I | Evidence URL |
| J | Reporter Email |
| K | Status (`pending` / `verified` / `removed`) |
| L | Report Count |

The sheet and header row are created automatically on first use.

---

## CORS note

Google Apps Script JSONP / fetch redirect means you need `Content-Type: text/plain` on POST requests (already handled in `sheetsService.js`). If you still see CORS errors, verify you deployed as **"Anyone"** (not "Anyone with a Google account") and that you're using the `/exec` URL, not `/dev`.
