import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  KeyRound,
  Bot,
  PieChart,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  BookOpen,
  CreditCard,
  Wallet,
  Calendar,
  Layers,
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/Navbar';

export function Docs() {
  const auth = useAuth() || {};
  const user = auth.user;
  const [activeTab, setActiveTab] = useState('voice');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const voiceExamples = [
    {
      phrase: "Spent 450 rupees for team lunch via UPI",
      type: "Expense",
      category: "Food & Dining",
      method: "UPI",
      explanation: "Extracts amount (₹450), assigns Food & Dining domain, and sets payment rail to UPI."
    },
    {
      phrase: "Received 85,000 monthly consulting credit via NEFT",
      type: "Income",
      category: "Professional Yield",
      method: "Bank Transfer",
      explanation: "Identifies inflow (+₹85,000), maps category to consulting yield, and records rail as NEFT."
    },
    {
      phrase: "Paid 1,450 for weekly supermarket groceries on card yesterday",
      type: "Expense",
      category: "Household Groceries",
      method: "Card",
      explanation: "Detects relative timestamp (yesterday), category, and card payment channel."
    },
    {
      phrase: "Paid 1,899 high-speed fiber broadband bill on GPay",
      type: "Expense",
      category: "Utilities & Bills",
      method: "UPI",
      explanation: "Maps recurring telecom/internet utility with UPI rail."
    },
    {
      phrase: "350 rupees auto rickshaw ride cash",
      type: "Expense",
      category: "Transportation",
      method: "Cash",
      explanation: "Colloquial transit phrasing parsed directly into Transportation and Cash rail."
    }
  ];

  const copilotPrompts = [
    "Am I over budget on Food & Dining this month?",
    "How much did I spend on groceries in the last 7 days?",
    "Spent 650 on dinner with friends via UPI",
    "Compare my savings velocity to last month",
    "What is my highest burn rate category this cycle?"
  ];

  const tabs = [
    { id: 'voice', label: 'Voice Ledger Guide', icon: Mic },
    { id: 'quickstart', label: '3-Step Quickstart', icon: Zap },
    { id: 'copilot', label: 'AI Copilot & Chat', icon: Bot },
    { id: 'byok', label: 'BYOK Groq Setup', icon: KeyRound },
    { id: 'budgets', label: 'Budgets & Limits', icon: PieChart },
    { id: 'privacy', label: 'Security & Privacy', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-[#071312] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 pb-24 relative overflow-hidden">
      {/* Ambient Forest & Emerald Glows matching Landing & App */}
      <div className="landing-noise pointer-events-none fixed inset-0 z-0 opacity-25" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-500/12 via-teal-400/8 to-cyan-500/8 blur-[130px] rounded-full" />
        <div className="absolute -bottom-24 right-1/4 w-[450px] h-[450px] bg-gradient-to-tl from-emerald-500/8 via-cyan-500/6 to-transparent blur-[120px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="navbar fixed top-0 left-0 right-0 z-[1000] isolate w-full apple-glass border-b border-white/[0.08] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.7)] transition-all">
        <div className="absolute inset-x-0 top-0 h-px bg-white/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={user ? "/dashboard" : "/"}
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm magnetic-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>{user ? "Back to Dashboard" : "Back to Home"}</span>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-white/[0.03] border border-white/[0.1] shadow-lg hidden sm:flex">
                <BrandLogo className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-white tracking-tight font-display">
                  Expense<span className="text-slate-400">Tracker</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-cyan-500/10 text-cyan-200 border border-cyan-400/25 uppercase tracking-widest font-mono">
                  Docs
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/25 active:scale-[0.98]"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/25 active:scale-[0.98]"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Title Banner */}
        <div className="mb-10 text-center sm:text-left animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono uppercase tracking-wider font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Documentation & Reference</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            How to use ExpenseTracker AI
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2.5 max-w-2xl font-sans leading-relaxed">
            Everything you need to master voice-driven expense tracking, AI budgeting, and zero-log private sovereign finance.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/[0.08] no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 magnetic-btn ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Voice Ledger Guide */}
        {activeTab === 'voice' && (
          <div className="mt-8 space-y-8 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-sm">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">How Spoken Bookkeeping Works</h2>
                  <p className="text-xs text-slate-400 font-mono">Speak naturally without rigid commands or syntax.</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                ExpenseTracker AI uses <strong className="text-white">Groq Whisper v3</strong> for high-velocity transcription and <strong className="text-white">Groq LLaMA 3.1</strong> to extract quantum amounts, payment rails, categories, and dates in under 200ms. You can speak colloquial Indian rupee expressions, mention UPI, debit cards, cash, or time qualifiers like &quot;yesterday&quot;.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <span className="text-emerald-400 font-bold block mb-1">01. Tap & Speak</span>
                  <span className="text-slate-400">Click the microphone icon in the floating assistant or modal.</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <span className="text-cyan-400 font-bold block mb-1">02. Instant Review</span>
                  <span className="text-slate-400">Amounts, categories, and payment rails are decomposed into editable fields.</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <span className="text-teal-300 font-bold block mb-1">03. Auto-Saved</span>
                  <span className="text-slate-400">Committed directly to Supabase PostgreSQL and updates budget health bars.</span>
                </div>
              </div>
            </div>

            {/* Clickable Cheat Sheet Prompts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Voice Command Cheatsheet</h3>
                  <p className="text-xs text-slate-400 font-mono">Click any card to copy the phrase to your clipboard:</p>
                </div>
                <span className="text-xs text-emerald-400 font-mono">Click to Copy</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voiceExamples.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(item.phrase, idx)}
                    className="p-5 rounded-2xl apple-glass-card border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group relative shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        &quot;{item.phrase}&quot;
                      </p>
                      <button className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-400 group-hover:text-white shrink-0">
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.type === "Expense" ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{item.category}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-400 font-semibold">{item.method}</span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 3-Step Quickstart */}
        {activeTab === 'quickstart' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl apple-glass-card border border-white/10 space-y-3 shadow-xl">
                <span className="text-3xl font-black text-emerald-400 font-mono">01</span>
                <h3 className="text-base font-bold text-white font-display">Sign In via Google or Email</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Sign in instantly with your Google account or create a sovereign account with your personal email and password.
                </p>
              </div>

              <div className="p-6 rounded-3xl apple-glass-card border border-white/10 space-y-3 shadow-xl">
                <span className="text-3xl font-black text-cyan-400 font-mono">02</span>
                <h3 className="text-base font-bold text-white font-display">Log Your First Transaction</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Tap the microphone or plus icon. Speak an expression like <em>&quot;Spent 350 for lunch via UPI&quot;</em>. All fields decompose automatically.
                </p>
              </div>

              <div className="p-6 rounded-3xl apple-glass-card border border-white/10 space-y-3 shadow-xl">
                <span className="text-3xl font-black text-teal-300 font-mono">03</span>
                <h3 className="text-base font-bold text-white font-display">Monitor Budget Health</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Visit the <strong>Budgets</strong> and <strong>Insights</strong> pages to view category caps, warning progress bars, and net savings trajectories.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Copilot & Chat */}
        {activeTab === 'copilot' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Conversational Financial Copilot</h2>
                  <p className="text-xs text-slate-400 font-mono">Available through the floating assistant widget at the bottom right.</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                The AI Copilot understands your live financial context—your current month balances, historical spending patterns, and category limits. You can query your finances or ask for budget optimization advice.
              </p>

              <div className="mt-6 space-y-2.5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">Sample Questions to Ask:</span>
                {copilotPrompts.map((prompt, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs text-slate-200">
                    <span>&quot;{prompt}&quot;</span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded">Prompt</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: BYOK Groq Setup */}
        {activeTab === 'byok' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-sm">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Bring Your Own Key (BYOK) Architecture</h2>
                  <p className="text-xs text-slate-400 font-mono">Zero-log sovereign edge inference with your own free Groq API key.</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                To guarantee maximum velocity (&gt;800 tokens/sec) and zero rate limits, you can provide your own free Groq API key. Keys are stored <strong className="text-white">strictly on your local device</strong> (in browser localStorage) and sent directly to the Groq API header.
              </p>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-white block text-sm mb-1">Create Free Groq Account</strong>
                    <span className="text-slate-400">Visit </span>
                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-1 font-semibold">
                      console.groq.com/keys <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-400"> and sign in with Google or GitHub.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-white block text-sm mb-1">Generate an API Key</strong>
                    <span className="text-slate-400">Click &quot;Create API Key&quot;, name it &quot;ExpenseTracker&quot;, and copy the secret key starting with <code className="text-emerald-300 bg-white/5 px-1 rounded">gsk_...</code>.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-white block text-sm mb-1">Paste into Settings</strong>
                    <span className="text-slate-400">In ExpenseTracker, navigate to Profile / Settings, paste your key into the Groq API Key field, and click Save.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Budgets & Limits */}
        {activeTab === 'budgets' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Budgets, Categories & Warning Thresholds</h2>
                  <p className="text-xs text-slate-400 font-mono">Proactive visual feedback before overspending happens.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <span className="font-bold text-emerald-400 text-sm block mb-1">&lt; 80% Used (On Track)</span>
                  <p className="text-slate-300 leading-relaxed">Spending is disciplined and comfortably within your monthly target.</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                  <span className="font-bold text-amber-400 text-sm block mb-1">80% – 100% (Near Limit)</span>
                  <p className="text-slate-300 leading-relaxed">Approaching threshold. The dashboard flags category allocation limits.</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                  <span className="font-bold text-rose-400 text-sm block mb-1">&gt; 100% (Exceeded)</span>
                  <p className="text-slate-300 leading-relaxed">Exceeded budget limit. Highlights negative variance and savings impact.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Security & Privacy */}
        {activeTab === 'privacy' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Private By Design</h2>
                  <p className="text-xs text-slate-400 font-mono">Zero data broker selling. Your financial life belongs to you.</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-2">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Row-Level Protection:</strong> Your financial data is securely partitioned in Supabase PostgreSQL and accessible only to your authenticated account.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Zero Audio Storage:</strong> Spoken audio is processed in volatile memory and immediately discarded. No audio clips are ever stored on disk.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Sovereign Keys:</strong> Your Groq API key is stored strictly in your own browser localStorage and never transmitted to our backend database.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 p-8 rounded-3xl apple-glass-card border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-2xl">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Ready to start tracking with voice?</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Experience zero-friction personal financial intelligence today.</p>
          </div>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Docs;
