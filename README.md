<div align="center">

# ⚡ ExpenseTracker AI
### *Next-Gen Personal Finance Telemetry & Intelligent Sovereign Ledger*

[![Live Production](https://img.shields.io/badge/Live%20App-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://expense-trackercom.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Co--Creator](https://img.shields.io/badge/Co--Creator-Sai081-10B981?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Sai081)
[![Co--Creator](https://img.shields.io/badge/Co--Creator-ChKarthik0-06B6D4?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ChKarthik0)

<br/>

<!-- Animated Typing SVG Header Banner -->
<a href="https://expense-trackercom.vercel.app/">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=2800&pause=1000&color=2DD4BF&center=true&vCenter=true&multiline=false&width=650&height=46&lines=Know+where+your+money+goes.;Acoustic+Voice+Ledger+powered+by+Groq+Whisper;Conversational+Financial+AI+Copilot;Multi-Currency+Telemetry+across+8+Global+Rails;Installable+PWA+on+Android%2C+iOS%2C+Windows%2C+%26+macOS" alt="ExpenseTracker AI Typing Banner" />
</a>

<p align="center">
  <b>A clearer, calmer, and faster way to understand your everyday money.</b><br/>
  Log transactions by voice in under 140ms, chat with your personal AI financial copilot, track category budget health, and enjoy seamless offline installation across all your mobile and desktop devices.
</p>

[🌐 **Launch Live Web App**](https://expense-trackercom.vercel.app/) • [📖 **Interactive Documentation**](https://expense-trackercom.vercel.app/docs) • [🐛 **Report Bug**](https://github.com/Sai081/ExpenseTracker/issues) • [✨ **Request Feature**](https://github.com/Sai081/ExpenseTracker/issues)

</div>

---

## 🚀 Live Production Deployments

| Component | Platform | Live URL / Connection | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web & PWA** | **Vercel Edge Network** | [https://expense-trackercom.vercel.app/](https://expense-trackercom.vercel.app/) | ![Operational](https://img.shields.io/badge/Operational-10B981?style=flat-square) |
| **REST & Telemetry API** | **Render Cloud** | Deployed Gunicorn WSGI Python API | ![Operational](https://img.shields.io/badge/Operational-10B981?style=flat-square) |
| **Database & Auth** | **Supabase Cloud** | PostgreSQL 15 + Row-Level Security (RLS) | ![Connected](https://img.shields.io/badge/Connected-3ECF8E?style=flat-square) |
| **AI Inference & Whisper** | **Groq LPU Cloud** | LLaMA 3.3 70B & Whisper Large v3 Turbo | ![Sub--140ms](https://img.shields.io/badge/Sub--140ms-F05A28?style=flat-square) |

---

## 🌟 Core Superpowers

### 🎙️ 1. Acoustic Voice Ledger (< 140ms Parsing)
Speak your spending naturally:
> *"Spent 450 rupees for lunch with team via UPI"*  
> *"Received 85,000 consulting credit via NEFT"*  
> *"Paid 50 dollars groceries on Visa card"*

* **Intelligent Entity Extraction:** Automatically detects quantum amounts, spending categories, payment rails (`UPI`, `Card`, `Cash`, `Bank Transfer`), and transaction dates.
* **Continuous Listening Engine:** Features continuous speech recognition with automatic silence-detection debouncing—waiting patiently for speech without premature timeouts.
* **Dynamic Multi-Currency Conversion:** If a foreign currency is spoken (e.g., *"Spent $20"* while your workspace is in INR), ExpenseTracker automatically converts it to your base currency and tags the original amount in the record notes.

### 🤖 2. Spark Financial AI Copilot (BYOK Ready)
* **Context-Aware Conversational Intelligence:** Answers questions grounded directly in your live transactions and budget envelopes:
  * *"Can I afford a ₹3,000 dinner tonight?"*
  * *"What were my top spending categories this month?"*
  * *"Am I exceeding my dining envelope?"*
* **BYOK (Bring Your Own Key):** Secure client-side Groq key vault. Users can enter their free Groq API key with one click, accompanied by in-chat key prompting and setup assistance.

### 📱 3. True Native Cross-Platform PWA Experience
No browser tabs, no app store hurdles, instant 1-tap installation:
* **Android:** Native WebAPK installation with bottom tab bar navigation, Material Design 3 ergonomics, and locked portrait orientation.
* **iOS (iPhone & iPad):** Standalone full-bleed display via Safari *Add to Home Screen* with safe-area notch and home indicator padding.
* **Windows 10/11:** Native 1-tap desktop installation into the Windows Start Menu, Taskbar, and Apps list via Microsoft Edge / Chrome.
* **macOS:** Native standalone window with macOS Dock and Launchpad integration.

### 💱 4. Multi-Currency Global Telemetry
* **8 Supported World Currencies:** `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `JPY (¥)`, `CAD (C$)`, `AUD (A$)`, and `AED`.
* **Permanent Base Currency Setting:** Saved directly in user profiles to govern all dashboard balances and charts.
* **In-Modal Currency Selection:** Overrides currency per transaction directly in the Add Transaction modal.

### 🔒 5. Sovereign Privacy & Google Account Sync
* Seamless sign-in with **Google OAuth 2.0** or email/password.
* Direct profile synchronization with verified Google avatars (no insecure device file uploads).
* Complete data sovereignty with zero third-party tracking.

---

## 🏗️ Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Vercel Edge & PWA)"]
        UI["React 18 + Vite + Tailwind CSS"]
        SW["Service Worker (Offline Caching & Fallback)"]
        Speech["Web Speech API & Groq Whisper Client"]
        Vault["BYOK Groq Key Vault (localStorage)"]
    end

    subgraph Backend ["API Gateway (Render Cloud)"]
        Flask["Flask 3.0 + Gunicorn WSGI"]
        AuthHandler["Supabase JWT & Bearer Auth"]
        GroqEngine["Groq AI Engine (LLaMA 3.3 / 3.1)"]
        ORM["SQLAlchemy ORM Models"]
    end

    subgraph Storage ["Cloud Persistence (Supabase)"]
        Postgres[("PostgreSQL 15 Database")]
        RLS["Row-Level Security Policies"]
    end

    UI <-->|HTTPS / REST API| Flask
    UI <-->|PWA Manifest & Cache| SW
    Speech -->|Audio Stream| GroqEngine
    Flask <--> AuthHandler
    Flask <--> GroqEngine
    Flask <--> ORM
    ORM <--> RLS <--> Postgres
```

---

## 📦 Tech Stack

### Frontend
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F05A28?style=flat-square&logo=feather&logoColor=white)](https://lucide.dev/)
[![PWA](https://img.shields.io/badge/Progressive_Web_App-5A67D8?style=flat-square&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

### Backend & Cloud
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask_3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Gunicorn](https://img.shields.io/badge/Gunicorn_WSGI-499848?style=flat-square&logo=gunicorn&logoColor=white)](https://gunicorn.org/)
[![Supabase](https://img.shields.io/badge/Supabase_Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq_Cloud_LPU-F05A28?style=flat-square&logo=fastapi&logoColor=white)](https://groq.com/)

---

## ⚙️ Quickstart (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Sai081/ExpenseTracker.git
cd ExpenseTracker
```

### 2. Backend Setup
```bash
# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate    # macOS / Linux
# .venv\Scripts\activate     # Windows

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, SUPABASE credentials, and GROQ_API_KEY

# Initialize database schema and categories
python init_db.py

# Launch development server
python run.py
```
*The API runs at `http://127.0.0.1:5001` (port 5001 avoids macOS AirPlay port 5000 conflicts).*

### 3. Frontend Setup
In a second terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Configure frontend environment
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5001/api

# Launch Vite development server
npm run dev
```
*Frontend runs at `http://localhost:5173` with automatic API proxying.*

---

## 🔑 Environment Variables

### Backend (`.env`)
```ini
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres
SECRET_KEY=your-random-secret-key
GROQ_API_KEY=gsk_your_groq_api_key
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5001
FRONTEND_URL=https://expense-trackercom.vercel.app
```

### Frontend (`frontend/.env`)
```ini
VITE_SUPABASE_URL=https://[REF].supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=/api
```

---

## 📱 PWA Installation Guide

| Platform | How to Install |
| :--- | :--- |
| **Android** | Open [expense-trackercom.vercel.app](https://expense-trackercom.vercel.app/) in Chrome → Tap **"Install App"** on the landing card or browser menu (⋮) → **Add to Home screen**. |
| **iOS (iPhone & iPad)** | Open [expense-trackercom.vercel.app](https://expense-trackercom.vercel.app/) in Safari → Tap the **Share** icon (square with upward arrow) → Tap **"Add to Home Screen"** → **Add**. |
| **Windows 10/11** | Open in Microsoft Edge or Chrome → Click the **Install App (⊕)** icon in the address bar → Launches standalone in Start Menu & Taskbar. |
| **macOS** | In Chrome/Edge/Brave, click the address bar **Install (⊕)** icon. In Safari (macOS Sonoma+), select **File > Add to Dock**. |

---

## 👥 Respectful Owners & Co-Creators

This project is proudly co-created, designed, and maintained by:

<div align="center">

| Co-Creator | GitHub Profile | Role |
| :--- | :--- | :--- |
| **Sai081** | [@Sai081](https://github.com/Sai081) | Co-Creator, Full-Stack Architecture, UI/UX & PWA Design |
| **ChKarthik0** | [@ChKarthik0](https://github.com/ChKarthik0) | Co-Creator, Backend API, Cloud Infrastructure & AI Pipeline |

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 **Sai081** and **ChKarthik0**. All rights reserved.

<div align="center">
  <sub>Built with ❤️ for sovereign, private, and effortless personal finance.</sub>
</div>
