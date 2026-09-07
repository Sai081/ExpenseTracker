# 💻 ExpenseTracker Frontend

> **React 18 Single-Page Application (SPA) powered by Vite, Tailwind CSS, Lucide Icons, and Apple Glassmorphic styling.**

---

## 🛠️ Architecture & Core Modules

* **Framework:** React 18 with Vite 5 bundler
* **Routing:** `react-router-dom` v6 with client-side SPA route rewrites (`vercel.json`)
* **Styling:** Tailwind CSS with custom glassmorphism utilities:
  * `.apple-glass`: Translucent header & modal backdrop blur
  * `.apple-glass-card`: Frosted glass dashboard and transaction cards
  * `.apple-glass-pill`: Pill badges & action buttons
  * `.glass-input`: Focus-reactive input fields
* **State Management (React Contexts):**
  * `AuthContext`: Supabase session management, Google OAuth & token persistence
  * `CurrencyContext`: Active display currency (USD, EUR, INR, GBP, JPY, CAD, AUD, AED) & real-time conversion
  * `KeyContext`: Sovereign BYOK client-side Groq key storage
  * `DemoWorkspaceContext`: Pre-seeded in-memory workspace data
* **Clean Markdown Engine:** `CleanMarkdown.jsx` visual parser that renders AI reports and copilot replies cleanly without asterisk markdown symbols or raw hashes.

---

## 🚀 Scripts

```bash
# Start local development server on http://localhost:5173
npm run dev

# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Component Tree

```text
frontend/src/
├── components/
│   ├── Navbar.jsx              # Fixed glassmorphic navigation bar with currency switcher
│   ├── CleanMarkdown.jsx       # Visual markdown parser (no asterisk symbols)
│   ├── AddTransactionModal.jsx # Manual income/expense creation modal
│   ├── VoiceModal.jsx          # Speech ingestion with Groq Whisper & LLaMA 3.1
│   ├── AssistantWidget.jsx     # Floating financial copilot drawer
│   ├── BYOKModal.jsx           # Bring Your Own Key modal prompt
│   ├── CustomCursor.jsx        # Cybernetic tracking cursor
│   └── ProtectedRoute.jsx      # Auth guard for private routes
├── context/
│   ├── AuthContext.jsx         # User identity & Supabase OAuth
│   ├── CurrencyContext.jsx     # Multi-currency state & exchange calculation
│   ├── KeyContext.jsx          # LocalStorage Groq key manager
│   └── DemoWorkspaceContext.jsx# Offline demo environment state
├── pages/
│   ├── Landing.jsx             # Public marketing page with fixed glass navbar
│   ├── Login.jsx               # Google OAuth & email authentication
│   ├── Dashboard.jsx           # Real-time metrics with time-based dynamic greeting
│   ├── Transactions.jsx        # Searchable, filterable ledger with CSV/PDF export
│   ├── Budgets.jsx             # Category caps & warning progress bars
│   ├── Insights.jsx            # Financial health score & clean AI synthesis
│   ├── Docs.jsx                # Interactive guide & voice command cheatsheet
│   ├── Profile.jsx             # Avatar, credentials, Danger Zone (delete account) & bottom logout
│   ├── Settings.jsx            # Display currency picker & BYOK Groq management
│   └── Chat.jsx                # Fullscreen AI Copilot conversation
└── lib/
    ├── api.js                  # Axios/Fetch API wrapper (injects Bearer & Currency headers)
    └── supabase.js             # Supabase client initialization & session detection
```

---

## 🔑 Environment Configuration

Create a `.env` file in the `frontend/` directory (see `.env.example`):

```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
VITE_API_BASE_URL=/api
```
