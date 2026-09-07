# 💰 ExpenseTracker AI

> **A calmer, clearer personal finance workspace powered by voice-driven bookkeeping, real-time multi-currency conversion, and Groq Cloud AI.**

[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Python Flask](https://img.shields.io/badge/Backend-Flask%203.0%20%2B%20Gunicorn-000000?logo=flask)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/AI%20Engine-Groq%20LLaMA%203.1%20%26%20Whisper%20v3-f55036)](https://groq.com/)

---

## 🌟 Key Features

### 🎙️ Acoustic Ledger (Voice-Powered Entry)
* **Under 200ms Parsing:** Speak natural transactions (e.g. *"Spent 450 rupees for lunch with team via UPI"* or *"Paid 50 dollars for groceries on Visa"*).
* **Dual Pipeline:** Uses **Groq Whisper v3** for low-latency speech transcription and **Groq LLaMA 3.1** to extract amounts, categories, dates, and payment channels into editable fields before saving.
* **In-Memory Privacy:** Audio recordings are processed in volatile memory and immediately discarded. No voice files are stored on disk.

### 💱 Multi-Currency System & Dynamic Conversion
* **8 Global Currencies:** Instant switching between **USD ($)**, **EUR (€)**, **INR (₹)**, **GBP (£)**, **JPY (¥)**, **CAD (C$)**, **AUD (A$)**, and **AED**.
* **Intelligent Spoken Conversion:** If you speak or type a transaction in a foreign currency (e.g., you say *"Spent 20 dollars"* while your workspace is in INR), the system automatically converts the amount to your active currency using embedded exchange rates and records the original currency in the transaction notes.
* **Persistent Preference:** Currency preference persists in browser storage and dynamically updates all dashboards, ledgers, charts, and budget limits.

### 🧠 AI Financial Copilot & Clean Insights
* **Real-Time Data Grounding:** The AI Copilot directly queries your actual income, expenses, and category budgets to answer questions (*"Can I afford dinner out tonight?"*, *"How much did I spend on dining this week?"*).
* **Clean Insights View:** Synthesizes monthly financial health scores, cash flow diagnostics, and high-impact action items rendered into clean, elegant UI cards—free of unparsed markdown asterisks or raw symbols.

### 📊 Comprehensive Financial Diagnostics
* **Dynamic Time-Based Greetings:** Contextual dashboard greeting that changes throughout the day (*Good morning*, *Good afternoon*, *Good evening*, *Welcome back*).
* **Budget Health Envelopes:** Real-time progress bars with color-coded alerts (`< 80%` on track, `80% - 100%` near limit, `> 100%` exceeded).
* **12-Month Dual Telemetry:** Outflow versus net retained savings trends over the past 12 months with interactive month filtering.

### 🛡️ Authentication & Sovereign Privacy
* **Supabase Authentication:** Seamless sign-in via Google OAuth 2.0 or secure email/password sessions.
* **Client-Side BYOK (Bring Your Own Key):** Users can optionally provide their own personal Groq Cloud API key. Keys are kept strictly in local browser storage (`localStorage`) and sent via headers for their own requests.
* **Account Sovereignty & Danger Zone:** Permanent account deletion in Profile that completely deletes all transactions, budgets, categories, and account records.
* **Bottom Sign Out:** Clean, accessible log out options in both the top navigation and the footer.

### 📤 Multi-Currency Report Export
* **CSV Export:** Download all transaction activity formatted with current currency indicators.
* **Printable PDF Summaries:** Formatted PDF reports generated dynamically in your currently selected currency.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router v6 | High-speed Single Page Application (SPA) |
| **Styling** | Tailwind CSS, Lucide Icons, Glassmorphic CSS | Apple-inspired obsidian & emerald dark theme |
| **Backend API** | Python 3.12, Flask 3.0, Gunicorn 21.2 | Lightweight, multi-threaded RESTful API |
| **ORM & Database** | Flask-SQLAlchemy, PostgreSQL (Supabase) | Relational persistence with connection pooling |
| **Authentication** | Supabase Auth (Google OAuth 2.0 + Email) | Token-based bearer session management |
| **AI & Voice** | Groq Cloud (LLaMA 3.1, Whisper v3) | Fast transaction parsing & financial intelligence |

---

## 📂 Project Structure

```text
ExpenseTracker/
├── app/
│   ├── __init__.py           # Flask factory, DB, LoginManager & CORS setup
│   ├── config.py             # Flask configuration
│   ├── models/               # SQLAlchemy models
│   │   ├── user.py           # User account & Supabase identity mapping
│   │   ├── transaction.py    # Income & Expense records
│   │   ├── category.py       # Default & user-defined categories
│   │   └── budget.py         # Monthly category spending limits
│   ├── routes/
│   │   ├── api/              # RESTful API Blueprints
│   │   │   ├── auth_api.py         # Login, register, Google auth, profile & delete account
│   │   │   ├── dashboard_api.py    # Monthly financial summary & metrics
│   │   │   ├── transaction_api.py  # CRUD transaction endpoints
│   │   │   ├── budget_api.py       # Budget caps & progress calculations
│   │   │   ├── category_api.py     # Income & expense categories
│   │   │   └── ai_api.py           # Insights, Whisper transcription, voice parse & chat
│   │   ├── export_routes.py  # CSV & PDF report generators (currency-aware)
│   │   └── home_routes.py    # Health check & SPA fallback routes
│   └── utils/
│       └── groq_api.py       # Groq AI prompt engine, Whisper audio & exchange converter
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, VoiceModal, CleanMarkdown, AddTransactionModal, etc.)
│   │   ├── context/          # Context providers (AuthContext, CurrencyContext, KeyContext)
│   │   ├── pages/            # Views (Landing, Login, Dashboard, Transactions, Budgets, Insights, Docs, Profile, Settings)
│   │   ├── lib/              # API request client & Supabase initialization
│   │   └── styles/           # Theme effects & glassmorphism CSS
│   ├── vercel.json           # Client-side SPA routing rewrite rules
│   ├── vite.config.js        # Vite config with backend proxy to port 5001
│   └── package.json          # Frontend dependencies & scripts
├── run.py                    # Local development server entrypoint (port 5001)
├── init_db.py                # Database initialization & category seeder
├── requirements.txt          # Python dependencies
├── Procfile                  # Production start command (Gunicorn)
├── vercel.json               # Root SPA rewrite rules
├── DEPLOYMENT.md             # Complete production deployment guide (Vercel + Render)
├── .env.example              # Backend environment template
└── frontend/.env.example     # Frontend environment template
```

---

## ⚙️ Quickstart (Local Development)

### 1. Prerequisites
* **Python**: 3.10, 3.11, or 3.12
* **Node.js**: 18+ and npm
* **PostgreSQL / Supabase**: Project URL and credentials
* **Groq Cloud API Key**: Free key from [console.groq.com](https://console.groq.com)

---

### 2. Backend Setup (Flask API)

1. Clone the repository and navigate into the root directory:
   ```bash
   cd ExpenseTracker
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate    # Linux / macOS
   # .venv\Scripts\activate     # Windows
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase PostgreSQL credentials, Supabase Anon Key, and Groq API key:
   ```ini
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres
   SECRET_KEY=your-random-secret-key
   GROQ_API_KEY=gsk_your_groq_api_key
   SUPABASE_URL=https://[REF].supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5001
   FRONTEND_URL=http://localhost:5173
   ```

5. Initialize database tables and seed default categories:
   ```bash
   python init_db.py
   ```

6. Start the Flask API server:
   ```bash
   python run.py
   ```
   *The backend starts at `http://127.0.0.1:5001` (port 5001 avoids macOS AirPlay port 5000 conflicts).*

---

### 3. Frontend Setup (React SPA)

In a **second terminal window**:

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment:
   Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure it contains:
   ```ini
   VITE_SUPABASE_URL=https://[REF].supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs at `http://localhost:5173` and automatically proxies `/api/*` calls to the Flask backend on port 5001.*

---

## 🔑 Environment Variables Reference

### Backend (`.env`)
| Variable | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Supabase IPv4 Pooler on port 6543) |
| `SECRET_KEY` | **Yes** | Flask session security key |
| `GROQ_API_KEY` | **Yes** | Default server key for AI insights, Whisper transcription & chat |
| `SUPABASE_URL` | **Yes** | Supabase project URL for JWT token validation |
| `SUPABASE_ANON_KEY` | **Yes** | Supabase anon key for API authentication |
| `PORT` | No | Server port (Default: `5001`) |
| `FRONTEND_URL` | No | Allowed CORS origins for credentialed requests |
| `FLASK_DEBUG` | No | `true` for development, `false` for production |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | **Yes** | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Public Supabase anonymous client JWT |
| `VITE_API_BASE_URL` | **Yes** | `/api` in local development; `https://your-backend.onrender.com/api` in production |

---

## ☁️ Production Deployment

The application is architected for decoupled cloud deployment:
* **Frontend**: Deploy to **Vercel** with the included [`vercel.json`](./frontend/vercel.json) rewrite rule for client-side single-page routing.
* **Backend**: Deploy to **Render** or **Railway** using the included [`Procfile`](./Procfile) and Gunicorn WSGI.
* **Database & Auth**: Hosted on **Supabase** with IPv4 connection pooling on port 6543.

For complete, step-by-step instructions with screenshot guidance and configuration settings, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 🛡️ Security & Privacy Architecture

* **Zero Data Broker Selling:** Your financial data is private to your authenticated user ID.
* **Volatile Audio Pipeline:** Spoken audio sent to the Whisper transcription endpoint is held strictly in temporary RAM buffers and discarded upon transcription.
* **Client-Side BYOK:** Custom Groq API keys remain inside your local browser's storage and are transmitted directly over TLS headers for inference.
* **Account Deletion:** Users can permanently delete their account, transactions, and categories at any time from the Profile page.

---

## 📜 License

Distributed under the **MIT License**. Free to use, modify, and distribute for personal or commercial projects.
