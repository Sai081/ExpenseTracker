# 🚀 ExpenseTracker Production Deployment Guide

This guide walks you through deploying **ExpenseTracker** using a modern, decoupled cloud architecture:
- **Frontend**: [Vercel](https://vercel.com) (React SPA + Vite on Global Edge CDN)
- **Backend API**: [Render](https://render.com) or [Railway](https://railway.app) (Python Flask + Gunicorn WSGI)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL on IPv4 Pooler + Google OAuth)
- **AI Engine**: [Groq Cloud](https://console.groq.com) (LLaMA 3.1 & Whisper v3)

---

## Architecture Blueprint

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT TOPOLOGY                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Frontend:   Vercel            (React 18 + Vite SPA, dist/)             │
│  Backend:    Render / Railway  (Flask REST API + Gunicorn on port $PORT)│
│  Database:   Supabase          (PostgreSQL Pooler on port 6543)         │
│  Auth:       Supabase Auth     (Google OAuth 2.0 + Email Session)       │
│  AI Engine:  Groq Cloud        (BYOK Client Key or Server Fallback)     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Prepare Database & Auth (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/skfjnwiyhtknluqtipff).
2. **Database Connection Pooler (Port 6543):**
   * Go to **Project Settings** $\rightarrow$ **Database**.
   * Under **Connection Parameters**, find **Connection Pooling** (Transaction mode).
   * Note the connection string on port `6543`:
     ```text
     postgresql://postgres.skfjnwiyhtknluqtipff:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
3. **Google OAuth Provider:**
   * Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Google**.
   * Ensure Google is enabled with your Google Cloud Client ID and Secret.
4. **URL Configuration:**
   * Go to **Authentication** $\rightarrow$ **URL Configuration**.
   * Set **Site URL**: `https://your-app.vercel.app` (or your initial custom domain).
   * Add to **Redirect URLs**:
     * `https://your-app.vercel.app/**`
     * `http://localhost:5173/**`
     * `http://localhost:5173/dashboard`

---

## Step 2: Deploy Backend API (Render / Railway)

### Using Render:
1. Create a free account at [render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository containing the ExpenseTracker code.
4. Configure the service:
   * **Name:** `expensetracker-api` (or your preferred name)
   * **Region:** Choose the region closest to your Supabase project
   * **Branch:** `main`
   * **Root Directory:** `.` *(leave blank / project root)*
   * **Runtime:** `Python 3`
   * **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   * **Start Command:**
     ```bash
     gunicorn 'app:create_app()' --bind 0.0.0.0:$PORT
     ```
5. Add **Environment Variables** under the **Environment** tab:

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.skfjnwiyhtknluqtipff:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require` | Supabase IPv4 Pooler |
| `SECRET_KEY` | *(A strong random 32+ character string)* | Flask session signing |
| `SUPABASE_URL` | `https://skfjnwiyhtknluqtipff.supabase.co` | Supabase API endpoint |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Public client anon key |
| `GROQ_API_KEY` | `gsk_...` | Groq AI Insights & Whisper |
| `FRONTEND_URL` | `https://your-app.vercel.app,http://localhost:5173` | Allowed CORS origins |
| `FLASK_DEBUG` | `false` | Production mode |

6. Click **Create Web Service**.
7. Once deployed, copy your service's live URL (e.g. `https://expensetracker-api.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel App)

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your **ExpenseTracker** GitHub repository.
4. In the **Configure Project** screen, set:
   * **Framework Preset:** `Vite`
   * **Root Directory:** Click *Edit* and select **`frontend`**
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Expand **Environment Variables** and add the following:

| Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://skfjnwiyhtknluqtipff.supabase.co` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmpud2l5aHRrbmx1cXRpcGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODkyMzEsImV4cCI6MjEwNDI2NTIzMX0.C0PspOW-MY9kcVQyfai0-O8LZecqOwYffnAfP5RGvKk` | Valid Supabase anon key |
| `VITE_API_BASE_URL` | `https://your-backend-api.onrender.com/api` | Your live Render backend API |

6. Click **Deploy**.
7. Vercel will build and assign your domain: `https://your-app.vercel.app`.

> **Note on Client-Side Routing:**  
> The included [`frontend/vercel.json`](./frontend/vercel.json) automatically directs all route requests (`/dashboard`, `/transactions`, `/budgets`, etc.) to `index.html`. Refreshing pages on Vercel will never throw 404 errors.

---

## Step 4: Final Connection Check

1. In Render, ensure `FRONTEND_URL` contains your final Vercel domain (e.g. `https://your-app.vercel.app`).
2. In Supabase, ensure **Site URL** and **Redirect URLs** include `https://your-app.vercel.app/**`.
3. Open `https://your-app.vercel.app`:
   * Test **Continue with Google** $\rightarrow$ redirects to `/dashboard` with session intact.
   * Add an expense via text or microphone.
   * Switch currencies in the top navbar (`USD`, `EUR`, `INR`, `GBP`).
   * Export PDF/CSV transaction reports in your chosen currency.
   * Verify the dynamic greeting (`Good morning`, `Good afternoon`, `Good evening`).
   * Verify the **Delete Account** button and bottom **Sign Out** button in Profile.
