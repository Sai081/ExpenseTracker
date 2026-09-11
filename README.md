<div align="center">

# 💰 ExpenseTracker AI
### Intelligent Sovereign Personal Finance & Voice Telemetry Platform

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq Cloud](https://img.shields.io/badge/Groq-LLaMA%203.3%20%2F%20Whisper-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Cross--Platform-5A67D8?style=for-the-badge&logo=pwa&logoColor=white)](https://expense-trackercom.vercel.app/)
[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://expense-trackercom.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

<!-- Animated Typing SVG Header Banner -->
<a href="https://expense-trackercom.vercel.app/">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=2800&pause=1000&color=2DD4BF&center=true&vCenter=true&multiline=false&width=650&height=46&lines=Know+where+your+money+goes.;Acoustic+Voice+Ledger+powered+by+Groq+Whisper;Conversational+Financial+AI+Copilot;Multi-Currency+Telemetry+across+8+Global+Rails;Installable+PWA+on+Android%2C+iOS%2C+Windows%2C+%26+macOS" alt="ExpenseTracker AI Typing Banner" />
</a>

<p align="center">
  A full-stack, cloud-native personal finance telemetry platform featuring acoustic voice ledger parsing in &lt;140ms, conversational AI financial mentorship, multi-currency conversion across 8 global rails, and installable PWA support across Android, iOS, Windows, and macOS.
</p>

<p align="center">
  🌐 <strong>Live Deployed URL:</strong> <a href="https://expense-trackercom.vercel.app/">https://expense-trackercom.vercel.app/</a>
</p>

</div>

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Variables](#-environment-variables)
- [PWA & Native Device Installation](#-pwa--native-device-installation)
- [API Reference](#-api-reference)
- [100% Free Cloud Deployment](#-100-free-cloud-deployment)
- [Security & Sovereignty](#-security--sovereignty)
- [Respectful Owners & Co-Creators](#-respectful-owners--co-creators)
- [Contributing & License](#-contributing--license)

---

## 🚀 Project Overview

**ExpenseTracker AI** replaces tedious manual bookkeeping with a high-speed, voice-driven, and context-aware telemetry workspace. By uniting ultra-fast speech models and real-time database transactions:
1. **Acoustic Voice Ledger in &lt;140ms:** Log complex transactions simply by speaking (e.g. *"Spent 450 rupees for lunch with team via UPI"* or *"Received 85,000 consulting fee via NEFT"*).
2. **Conversational Financial Copilot (BYOK):** Interrogate your financial health with an AI assistant that queries your real PostgreSQL ledger, budget envelopes, and burn velocity.
3. **Multi-Currency Telemetry:** Seamlessly switch between 8 global currencies (`INR ₹`, `USD $`, `EUR €`, `GBP £`, `JPY ¥`, `CAD C$`, `AUD A$`, `AED`) with real-time conversion and persistent profile preferences.
4. **Budget Velocity & Cap Envelopes:** Real-time progress bars with dynamic threshold warnings (`< 80%` on track, `80% - 100%` near limit, `> 100%` exceeded).
5. **Universal 4-Platform PWA:** Complete offline caching and native app experiences on Android, iOS, Windows, and macOS without app store lock-in.

---

## 🏗 System Architecture

```
                                  ┌──────────────────────────────────┐
                                  │   Client Devices (Vercel PWA)    │
                                  │ (React 18, Vite, Tailwind CSS)   │
                                  │ Android • iOS • Windows • macOS  │
                                  └────────────────┬─────────────────┘
                                                   │ HTTP / REST / Bearer
                                  ┌────────────────▼─────────────────┐
                                  │       Flask Application API      │
                                  │    (Authentication, ORM, CORS)   │
                                  └────────┬─────────────────┬───────┘
                                           │                 │
                  ┌────────────────────────▼──┐           ┌──▼──────────────────────────┐
                  │    Supabase PostgreSQL    │           │    Groq Cloud AI Engine     │
                  │  - Users & Google OAuth   │           │  - LLaMA 3.3 70B Versatile  │
                  │  - Income & Expense Logs  │           │  - Whisper Large v3 Turbo   │
                  │  - Monthly Budget Caps    │           │  - BYOK Client Key Vault    │
                  │  - Multi-Currency Stores  │           │  - Sub-140ms NLP Parsing    │
                  └───────────────────────────┘           └─────────────────────────────┘
```

---

## ✨ Core Features

### 1. 🎙️ Acoustic Voice Ledger (&lt; 140ms Parsing)
* **Dual Pipeline:** Combines **Groq Whisper Large v3 Turbo** for instant speech transcription with **Groq LLaMA 3.3** for structured entity extraction.
* **Continuous Recognition:** Speech recognition waits patiently without premature timeouts during natural speech pauses.
* **Automatic Schema Extraction:** Quantifies quantum amount, spending category, payment rail (`UPI`, `Card`, `Cash`, `Bank Transfer`), and transaction date.
* **Foreign Currency Spoken Conversion:** Speaking *"Spent 20 dollars"* while in INR automatically converts the value to ₹ and preserves the original currency notation in the transaction notes.

### 2. 🤖 Spark Financial AI Copilot (BYOK Ready)
* **Context-Aware Conversational Intelligence:** Directly queries the user's real transaction history and budget usage to answer complex queries:
  * *"Can I afford a ₹3,000 dinner tonight?"*
  * *"What were my highest expenses this week?"*
  * *"Am I exceeding my dining envelope?"*
* **Bring Your Own Key (BYOK):** Users can enter their personal free Groq Cloud API key in their profile or directly inside the chat dialog with auto-prompting and one-click key entry.

### 3. 📱 True Native Cross-Platform PWA Experience
* **Android:** Native WebAPK installation with bottom tab bar navigation, Material Design 3 ergonomics, and portrait lock.
* **iOS (iPhone & iPad):** Standalone full-bleed display via Safari *Add to Home Screen* with safe-area notch and home indicator padding.
* **Windows 10/11:** Native 1-tap desktop installation into the Windows Start Menu, Taskbar, and Apps list via Microsoft Edge / Chrome.
* **macOS:** Native standalone window with macOS Dock and Launchpad integration.

### 4. 💱 Multi-Currency Global Telemetry
* Instant switching between 8 global currencies (`INR`, `USD`, `EUR`, `GBP`, `JPY`, `CAD`, `AUD`, `AED`).
* Permanent base currency setting in user profile that governs all dashboard balances, charts, and budget metrics.
* Per-transaction currency dropdown selector inside the Add Transaction modal.

### 5. 📊 Category Budget Health Envelopes
* Real-time progress bars with color-coded alerts (`< 80%` on track, `80% - 100%` near limit, `> 100%` exceeded).
* 12-month historical dual telemetry charts comparing gross inflow, burn rate, and net retained savings velocity.

### 6. 🛡️ Sovereign Authentication & Profile Sync
* Secure sign-in via **Google OAuth 2.0** or email/password.
* Direct profile synchronization with verified Google avatars without risky device file uploads.
* Permanent account deletion (Danger Zone) that cleans all associated transactions, budgets, and tokens.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router v6, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, Flask 3.0, Flask-SQLAlchemy, Gunicorn WSGI |
| **Database & Auth** | Supabase Cloud (PostgreSQL 15), Row-Level Security (RLS), Google OAuth 2.0 |
| **AI Inference** | Groq Cloud LPU (LLaMA 3.3 70B Versatile, LLaMA 3.1 8B Instant, Whisper Large v3 Turbo) |
| **PWA & Offline** | Stale-While-Revalidate Service Worker, Web App Manifest, Cache API |
| **DevOps / Hosting** | Vercel Edge Network (Frontend), Render Cloud (Backend API), GitHub Actions CI |

---

## 📂 Project Structure

```
ExpenseTracker/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       # Issue template for bugs
│   │   └── feature_request.md  # Issue template for feature proposals
│   ├── PULL_REQUEST_TEMPLATE.md# Pull request guidelines
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI automated build & syntax pipeline
├── app/
│   ├── __init__.py             # Flask application factory, DB, & CORS setup
│   ├── config.py               # Flask configuration & environment loader
│   ├── models/                 # SQLAlchemy database models
│   │   ├── user.py             # User account & Supabase identity mapping
│   │   ├── transaction.py      # Income & expense ledger records
│   │   ├── category.py         # Default & custom user categories
│   │   └── budget.py           # Monthly category spending limits
│   ├── routes/
│   │   ├── api/                # RESTful API Blueprints
│   │   │   ├── auth_api.py     # Auth, Google login, & profile settings
│   │   │   ├── dashboard_api.py# Financial summary & 12-month analytics
│   │   │   ├── transaction_api.py # CRUD transaction ledger endpoints
│   │   │   ├── budget_api.py   # Category budget caps & usage calculations
│   │   │   ├── category_api.py # Income & expense categories
│   │   │   └── ai_api.py       # Insights, Whisper transcription, voice parse & chat
│   │   ├── export_routes.py    # Multi-currency CSV & PDF export generators
│   │   └── home_routes.py      # Health checks & SPA fallback routes
│   └── utils/
│       └── groq_api.py         # Groq AI prompt engine, Whisper audio & currency conversion
├── frontend/
│   ├── public/                 # PWA icons, manifest.json, sw.js, offline.html
│   ├── src/
│   │   ├── components/         # UI components (Navbar, AssistantWidget, VoiceModal, etc.)
│   │   ├── context/            # React context (AuthContext, CurrencyContext, KeyContext)
│   │   ├── pages/              # Views (Landing, Dashboard, Transactions, Budgets, Insights, Profile)
│   │   └── lib/                # API client, PWA helpers & Supabase init
│   ├── index.html              # HTML entrypoint with PWA meta tags
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind CSS theme configuration
│   ├── vercel.json             # Frontend client-side SPA routing rewrite rules
│   └── vite.config.js          # Vite build config with backend API proxy
├── run.py                      # Flask API entrypoint (port 5001)
├── init_db.py                  # Database schema initialiser & category seeder
├── requirements.txt            # Python dependencies
├── Procfile                    # Render / Gunicorn WSGI start command
├── vercel.json                 # Root deployment config
├── CONTRIBUTING.md              # Open-source contribution guidelines
├── CODE_OF_CONDUCT.md          # Contributor Covenant Code of Conduct
├── DEPLOYMENT.md               # Detailed multi-cloud deployment instructions
├── LICENSE                     # MIT License (Sai081 and ChKarthik0)
└── SECURITY.md                 # Security and vulnerability reporting policy
```

---

## ⚡ Getting Started Locally

### Prerequisites
* Python 3.10, 3.11, or 3.12 installed on your machine.
* Node.js 18+ and npm installed.
* A free Supabase project and Groq Cloud account.

### 1. Clone the Repository
```bash
git clone https://github.com/Sai081/ExpenseTracker.git
cd ExpenseTracker
```

### 2. Backend Setup (Flask API)
```bash
# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate    # macOS / Linux
# .venv\Scripts\activate     # Windows

# Install backend dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, SUPABASE credentials, and GROQ_API_KEY

# Initialize database schema and categories
python init_db.py

# Run development server
python run.py
```
*The backend runs at `http://127.0.0.1:5001` (port 5001 avoids macOS AirPlay conflicts).*

### 3. Frontend Setup (React + Vite)
In a **second terminal window**:
```bash
cd frontend

# Install Node dependencies
npm install

# Configure frontend environment
cp .env.example .env
# Ensure VITE_API_BASE_URL=/api

# Start Vite dev server
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

## ⚙️ Environment Variables

### Backend (`.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI (Supabase IPv4 Pooler on port 6543) |
| `SECRET_KEY` | **Yes** | — | Flask session signing key |
| `GROQ_API_KEY` | Optional | None | Server-side fallback key for AI Copilot & Whisper transcription |
| `SUPABASE_URL` | **Yes** | — | Supabase project URL for JWT token validation |
| `SUPABASE_ANON_KEY` | **Yes** | — | Supabase anonymous API key |
| `PORT` | No | `5001` | Port to bind the Flask server |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS origin for credentials |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | — | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | — | Public Supabase anonymous client key |
| `VITE_API_BASE_URL` | **Yes** | `/api` | Base URL for API requests (`https://your-backend.onrender.com/api` in production) |

---

## 📱 PWA & Native Device Installation

| Device | Installation Steps |
| :--- | :--- |
| **Android** | Open [expense-trackercom.vercel.app](https://expense-trackercom.vercel.app/) in Chrome → Tap **"Install App"** on the landing card or browser menu (⋮) → **Add to Home screen**. |
| **iOS / iPad** | Open in Safari → Tap the **Share** button (square with upward arrow) → Scroll down and tap **"Add to Home Screen"** → **Add**. |
| **Windows 10/11** | Open in Microsoft Edge or Chrome → Click the **Install App (⊕)** icon in the address bar → Launches standalone in Start Menu & Taskbar. |
| **macOS** | In Chrome/Edge, click the address bar **Install (⊕)** icon. In Safari (macOS Sonoma+), select **File > Add to Dock**. |

---

## 🔌 API Reference

### 1. Acoustic Voice Parser
* **Endpoint**: `POST /api/ai/voice-parse`
* **Headers**: `Authorization: Bearer <token>`, `X-Groq-Api-Key: <key>`, `X-Currency: INR`
* **Body**: `{"text": "Spent 450 rupees for lunch with team via UPI"}`
* **Response**:
```json
{
  "success": true,
  "data": {
    "amount": 450.0,
    "type": "expense",
    "category": "Food & Dining",
    "category_id": 1,
    "description": "Spent 450 rupees for lunch with team via UPI",
    "payment_method": "upi",
    "date": "2026-09-11"
  },
  "message": "Voice transcript parsed successfully"
}
```

### 2. Conversational Financial Copilot
* **Endpoint**: `POST /api/ai/chat`
* **Headers**: `Authorization: Bearer <token>`, `X-Groq-Api-Key: <key>`, `X-Currency: INR`
* **Body**: `{"message": "Can I afford a ₹3,000 dinner tonight?", "history": []}`
* **Response**:
```json
{
  "success": true,
  "data": {
    "reply": "Based on your current September burn rate, you have ₹18,400 remaining in your Food & Dining budget envelope...",
    "transaction_created": false
  }
}
```

### 3. Financial Dashboard Telemetry Summary
* **Endpoint**: `GET /api/dashboard/summary?month=2026-09`
* **Headers**: `Authorization: Bearer <token>`, `X-Currency: INR`
* **Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "monthly_income": 85000.0,
      "monthly_expenses": 34250.0,
      "net_savings": 50750.0,
      "today_expenses": 450.0
    },
    "category_breakdown": [
      { "category": "Housing & Rent", "amount": 18400.0 },
      { "category": "Food & Dining", "amount": 10200.0 }
    ]
  }
}
```

---

## ☁️ 100% Free Cloud Deployment

> 🌐 **Live Production App:** [https://expense-trackercom.vercel.app/](https://expense-trackercom.vercel.app/)

Detailed step-by-step instructions are available in [DEPLOYMENT.md](DEPLOYMENT.md).

### 1. Frontend on Vercel
1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build` | Output Directory: `dist`.
4. Configure environment variable `VITE_API_BASE_URL` pointing to your Render backend API.
5. Deploy.

### 2. Backend API on Render
1. In [Render.com](https://render.com), create a new **Web Service** connected to your repository.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `gunicorn run:app`
4. Add environment variables (`DATABASE_URL`, `SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GROQ_API_KEY`).
5. Deploy.

---

## 🛡 Security & Sovereignty

* **In-Memory Audio Processing:** Voice audio data sent for transcription is processed strictly in volatile server RAM and immediately discarded. No audio is ever written to disk.
* **Client-Side BYOK:** Custom Groq Cloud API keys are stored exclusively in your browser's encrypted local vault and transmitted directly over secure TLS headers.
* **Row-Level Security (RLS):** All financial records are isolated to the authenticated user's unique identity.
* **Account Sovereignty:** Permanent account deletion completely purges all transactions, budgets, categories, and account records.

---

## 👥 Respectful Owners & Co-Creators

This platform is proudly co-created, architected, and maintained by:

<div align="center">

| Co-Creator | GitHub Profile | Responsibilities |
| :--- | :--- | :--- |
| **Sai081** | [@Sai081](https://github.com/Sai081) | Co-Creator, Full-Stack Architecture, UI/UX & PWA Design |
| **ChKarthik0** | [@ChKarthik0](https://github.com/ChKarthik0) | Co-Creator, Backend API, Cloud Infrastructure & AI Pipeline |

</div>

---

## 🤝 Contributing & License

* Contributions, feedback, and pull requests are warmly welcomed! Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
* Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
* Copyright (c) 2026 **Sai081** and **ChKarthik0**. All rights reserved.

<div align="center">
  <sub>Built with precision for sovereign, private, and effortless personal finance.</sub>
</div>
