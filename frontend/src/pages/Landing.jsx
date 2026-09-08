import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, CheckCheck, ChevronRight,
  Copy, CreditCard, Lock, Mic, MoreHorizontal, Play, Plus, Sparkles, Wallet, X, Menu,
  Download, Laptop, Monitor, Smartphone, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/Navbar';

const voiceDemos = [
  { phrase: 'Spent 450 rupees for lunch with team via UPI', amount: '-₹450', category: 'Food & Dining', rail: 'UPI', icon: CreditCard },
  { phrase: 'Received 85,000 consulting credit via NEFT', amount: '+₹85,000', category: 'Consulting income', rail: 'NEFT', icon: Wallet },
  { phrase: 'Paid 1,450 groceries on Visa card', amount: '-₹1,450', category: 'Household', rail: 'Visa', icon: CreditCard },
];

const spendRows = [
  { label: 'Housing', value: '₹18,400', percent: 74, tone: 'bg-white' },
  { label: 'Food & dining', value: '₹10,200', percent: 48, tone: 'bg-indigo-400' },
  { label: 'Transport', value: '₹4,850', percent: 26, tone: 'bg-neutral-500' },
];

export function Landing() {
  const navigate = useNavigate();
  const { user = null, signInDemo = async () => {} } = useAuth() || {};
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect if running inside an installed PWA or standalone window
    const checkPWA = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://') ||
        new URLSearchParams(window.location.search).get('source') === 'pwa';
      setIsPWA(isStandalone);
    };
    checkPWA();
  }, []);

  const copyPayload = async () => {
    await navigator.clipboard?.writeText(JSON.stringify({ amount: 450, category: 'Food & Dining', payment_method: 'UPI' }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selected = voiceDemos[activeDemo];

  return (
    <div className="landing-page relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#071312] text-white selection:bg-cyan-500/30 selection:text-cyan-100">
      <div className="landing-noise pointer-events-none fixed inset-0 z-0" />
      <div className="landing-glow pointer-events-none fixed left-1/2 top-[-20rem] z-0 h-[32rem] sm:h-[42rem] w-[90vw] max-w-[50rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[120px] your-money-glow" />

      {/* Pinned Responsive Navbar */}
      <header
        className={`navbar fixed top-0 left-0 right-0 z-[1000] w-full transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? 'apple-glass border-b border-white/[0.08] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.7)]'
            : 'bg-[#071312]/85 backdrop-blur-md border-b border-white/[0.06]'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-white/10 pointer-events-none" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link to={user ? "/dashboard" : "/"} className="group flex items-center gap-2.5 sm:gap-3" aria-label="ExpenseTracker home">
            <div className="relative p-1 rounded-2xl bg-white/[0.03] border border-white/[0.1] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <BrandLogo className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight font-display">
                  Expense<span className="text-slate-400">Tracker</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-cyan-500/10 text-cyan-200 border border-cyan-400/25 uppercase tracking-widest font-mono">
                  AI
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
                Personal finance, made clear
              </span>
            </div>
          </Link>

          {/* Desktop / Tablet Navigation Links */}
          <nav className="hidden items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md md:flex" aria-label="Marketing navigation">
            <button
              onClick={(e) => scrollToSection(e, 'product')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Product
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              How it works
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'voice-ledger')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Voice Ledger
            </button>
            {!isPWA && (
              <button
                onClick={(e) => scrollToSection(e, 'downloads')}
                className="pwa-hide px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                Apps
              </button>
            )}
            <Link
              to="/docs"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-all duration-200"
            >
              Docs
            </Link>
            <button
              onClick={(e) => scrollToSection(e, 'privacy')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Privacy
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <Link
              to={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.45)] transition-all active:scale-[0.98]"
            >
              <span>{user ? "Go to Dashboard" : "Get Started"}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl apple-glass-pill text-slate-300 hover:text-white border border-white/10 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t border-white/[0.06] bg-[#071312]/95 backdrop-blur-2xl space-y-1 animate-fade-in">
            <button
              onClick={(e) => scrollToSection(e, 'product')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
            >
              Product
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
            >
              How it works
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'voice-ledger')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
            >
              Voice Ledger
            </button>
            {!isPWA && (
              <button
                onClick={(e) => scrollToSection(e, 'downloads')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
              >
                Apps & Downloads
              </button>
            )}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10 transition"
            >
              Docs & Documentation
            </Link>
            <button
              onClick={(e) => scrollToSection(e, 'privacy')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition"
            >
              Privacy & Sovereignty
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 sm:pb-24 w-full">
        {/* Hero Section */}
        <section className="grid items-center gap-10 sm:gap-14 pb-16 pt-8 sm:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pb-24 lg:pt-20" id="product">
          <div className="landing-reveal max-w-xl mx-auto lg:mx-0 text-center lg:text-left" style={{ '--reveal-delay': '100ms' }}>
            <div className="landing-eyebrow mb-4 sm:mb-6 justify-center lg:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" /> 
              Your money, made clear
            </div>
            
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] sm:leading-[0.96] tracking-tight text-white">
              See the shape of your <span className="text-neutral-500">money.</span>
            </h1>

            <p className="mt-5 sm:mt-7 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed text-neutral-400">
              ExpenseTracker turns everyday spending into a calm, useful picture of your life. Add a transaction by voice, stay on top of your plan, and make better decisions with less effort.
            </p>

            <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link to={user ? "/dashboard" : "/login"} className="landing-button landing-button-primary w-full sm:w-auto px-5 py-3 text-sm">
                <Sparkles className="h-4 w-4" /> {user ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="h-4 w-4" />
              </Link>
              <a 
                href="#how-it-works" 
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="group flex items-center gap-2 px-4 py-3 text-sm text-neutral-400 transition hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <Play className="h-3 w-3 fill-current" />
                </span> 
                See how it works
              </a>
            </div>

            <div className="mt-8 sm:mt-9 flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-[11px] text-neutral-500 font-mono">
              <span className="h-px w-6 sm:w-8 bg-white/10" /> 
              Private by design 
              <span className="h-1 w-1 rounded-full bg-neutral-700" /> 
              Built for everyday life
            </div>
          </div>

          {/* Interactive Window Preview */}
          <div className="landing-reveal relative w-full max-w-2xl mx-auto lg:mx-0 lg:translate-y-2" style={{ '--reveal-delay': '220ms' }}>
            <div className="landing-window overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#111113]/90 shadow-[0_35px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 sm:px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Live Workspace Overview</span>
                <MoreHorizontal className="h-4 w-4 text-neutral-600" />
              </div>

              <div className="grid gap-4 sm:gap-5 p-4 sm:p-7">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Available this month</p>
                    <p className="mt-1 font-display text-2xl sm:text-4xl font-semibold tracking-[-0.04em]">
                      ₹50,750
                      <span className="ml-2 text-xs sm:text-sm font-normal tracking-normal text-emerald-400 font-mono">+14.2%</span>
                    </p>
                  </div>
                  <Link to="/login" className="rounded-full border border-white/10 bg-white/[0.05] p-2 sm:p-2.5 text-neutral-300 transition hover:bg-white/10" title="Add Transaction">
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <Metric label="Income" value="₹85,000" icon={ArrowDownLeft} />
                  <Metric label="Spent" value="₹34,250" icon={ArrowUpRight} />
                  <Metric label="Savings rate" value="59.7%" icon={BarChart3} />
                </div>

                <div className="grid gap-5 border-t border-white/[0.08] pt-5 sm:grid-cols-[1fr_0.85fr]">
                  <div>
                    <div className="mb-3 sm:mb-4 flex items-center justify-between">
                      <p className="text-xs font-medium text-neutral-300">Spending by category</p>
                      <span className="text-[10px] text-neutral-500 font-mono">This month</span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {spendRows.map((row) => (
                        <div key={row.label}>
                          <div className="mb-1.5 flex justify-between text-[11px]">
                            <span className="text-neutral-400">{row.label}</span>
                            <span className="text-neutral-300 font-mono">{row.value}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.08]">
                            <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${row.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 sm:p-4">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between">
                      <p className="text-xs font-medium text-neutral-300">Recent activity</p>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                    </div>
                    <div className="space-y-3">
                      <Activity label="Salary" value="+₹85,000" tone="text-emerald-400" />
                      <Activity label="Lunch with team" value="-₹450" tone="text-neutral-300" />
                      <Activity label="Groceries" value="-₹1,450" tone="text-neutral-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safe relative floating pill */}
            <div className="mt-4 lg:absolute lg:-bottom-6 lg:left-4 w-full sm:w-60 rounded-2xl border border-white/[0.1] bg-[#151517]/95 p-3.5 shadow-2xl backdrop-blur-xl">
              <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-neutral-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> 
                Voice Ingestion
              </div>
              <p className="text-xs leading-5 text-neutral-200">“Spent 450 rupees for lunch with team.”</p>
              <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.08] pt-2 text-[11px] font-mono">
                <span className="text-neutral-400">Food & Dining</span>
                <span className="text-rose-400">-₹450</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Step Proof Banner */}
        <section className="landing-reveal border-y border-white/[0.08] py-8 sm:py-10 my-10" id="how-it-works" style={{ '--reveal-delay': '120ms' }}>
          <div className="grid gap-8 sm:gap-6 text-center text-sm text-neutral-500 grid-cols-1 sm:grid-cols-3">
            <Proof number="01" title="Say it naturally" text="Log an expense in the words you already use every day." />
            <Proof number="02" title="It finds the meaning" text="Smart AI categories keep your financial records clean." />
            <Proof number="03" title="Know what to do next" text="Real-time multi-currency telemetry turns history into direction." />
          </div>
        </section>

        {/* Voice Ledger Interactive Showcase */}
        <section className="landing-reveal py-16 sm:py-24" id="voice-ledger" style={{ '--reveal-delay': '180ms' }}>
          <div className="mb-8 sm:mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="landing-label">The Voice Ledger</p>
              <h2 className="mt-2.5 max-w-2xl font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Your thoughts, organized.
              </h2>
            </div>
            <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-neutral-400">
              A natural way to keep your financial life current, without making it another tedious chore.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-2.5">
              {voiceDemos.map((demo, index) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.phrase}
                    onClick={() => setActiveDemo(index)}
                    className={`landing-list-row w-full text-left ${activeDemo === index ? 'landing-list-row-active' : ''}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs sm:text-sm text-neutral-200">{demo.phrase}</span>
                      <span className="mt-0.5 block text-[10px] sm:text-[11px] text-neutral-500 font-mono">{demo.category} · {demo.rail}</span>
                    </span>
                    <span className={`font-mono text-xs font-bold ${demo.amount.startsWith('+') ? 'text-emerald-400' : 'text-neutral-300'}`}>
                      {demo.amount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="landing-panel relative overflow-hidden p-5 sm:p-7 rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 sm:pb-5">
                <div>
                  <p className="landing-label">Structured automatically</p>
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-300 leading-relaxed">{selected.phrase}</p>
                </div>
                <button
                  onClick={copyPayload}
                  className="rounded-xl border border-white/10 p-2 text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
                  title="Copy transaction payload"
                >
                  {copied ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 sm:py-6">
                <DataPoint label="Amount" value={selected.amount} />
                <DataPoint label="Category" value={selected.category} />
                <DataPoint label="Payment" value={selected.rail} />
                <DataPoint label="Status" value="Ready" />
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 font-mono text-[11px] leading-6 text-neutral-400 overflow-x-auto">
                <span className="text-neutral-600">{'{'}</span><br />
                <span className="pl-4 text-cyan-300">"amount"</span>: <span className="text-neutral-200">450</span>,<br />
                <span className="pl-4 text-cyan-300">"category"</span>: <span className="text-emerald-300">"Food & Dining"</span>,<br />
                <span className="pl-4 text-cyan-300">"payment_method"</span>: <span className="text-emerald-300">"UPI"</span><br />
                <span className="text-neutral-600">{'}'}</span>
              </div>

              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" /> 
                  Private to your personal workspace
                </span>
                <Link to="/login" className="text-cyan-400 hover:underline transition font-sans font-semibold">
                  Sign in to track <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Native Downloads & Apps Section (Shown only on web, hidden inside installed PWA) */}
        {!isPWA && (
          <section className="pwa-hide landing-reveal py-16 sm:py-24 border-t border-white/[0.08]" id="downloads" style={{ '--reveal-delay': '200ms' }}>
            <div className="mb-10 sm:mb-12 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="landing-label">Multi-Platform Ecosystem</p>
                <h2 className="mt-2.5 max-w-2xl font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                  Available everywhere you work.
                </h2>
              </div>
              <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-neutral-400">
                Install as a high-performance desktop or mobile application with offline support and zero browser overhead.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* macOS */}
              <div className="landing-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Laptop className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-display font-bold text-base text-white">macOS App</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">macOS</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Double-clickable standalone desktop app bundle with native macOS Dock telemetry icon.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">12 KB .zip</span>
                  <a
                    href="/downloads/ExpenseTracker-macOS.zip"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-cyan-500/20 text-white hover:text-cyan-200 border border-white/10 hover:border-cyan-400/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Windows */}
              <div className="landing-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Monitor className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-display font-bold text-base text-white">Windows 10/11</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">MSIX / PC</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Hosted Windows application package with AppxManifest and one-click PowerShell installer.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">22 KB .zip</span>
                  <a
                    href="/downloads/ExpenseTracker-Windows.zip"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-emerald-500/20 text-white hover:text-emerald-200 border border-white/10 hover:border-emerald-400/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Android */}
              <div className="landing-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6 text-teal-300" />
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-display font-bold text-base text-white">Android App</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">TWA / APK</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Trusted Web Activity project with Digital Asset Links and Android Studio build files.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">7 KB .zip</span>
                  <a
                    href="/downloads/ExpenseTracker-Android-TWA.zip"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-teal-500/20 text-white hover:text-teal-200 border border-white/10 hover:border-teal-400/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Universal Bundle */}
              <div className="landing-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between group border-cyan-400/20">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-400/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Package className="w-6 h-6 text-cyan-200" />
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-display font-bold text-base text-white">Universal Bundle</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200">All Platforms</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Complete multi-platform distribution containing macOS app, Windows MSIX, Android TWA, and iOS wrapper.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">41 KB .zip</span>
                  <a
                    href="/downloads/ExpenseTracker-Installable-Packages.zip"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download All</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Privacy & Sovereignty Section */}
        <section className="landing-reveal landing-panel flex flex-col items-start justify-between gap-6 sm:gap-7 p-6 sm:p-10 rounded-3xl sm:flex-row sm:items-center" id="privacy" style={{ '--reveal-delay': '240ms' }}>
          <div>
            <p className="landing-label">Quiet Confidence</p>
            <h2 className="mt-2.5 max-w-xl font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              The best finance tool is the one you keep using.
            </h2>
            <p className="mt-2.5 max-w-lg text-xs sm:text-sm leading-relaxed text-neutral-400">
              No judgment, no noise, no financial theater. Just a private workspace that helps you stay in the loop.
            </p>
          </div>
          <Link to={user ? "/dashboard" : "/login"} className="landing-button landing-button-primary shrink-0 w-full sm:w-auto px-5 py-3 text-sm">
            {user ? "Go to Dashboard" : "Start with a clean slate"} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[0.08] px-4 sm:px-6 lg:px-8 py-8 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display font-semibold text-neutral-300">ExpenseTracker AI</span>
        <span>Less admin. More awareness.</span>
        <Link to="/docs" className="text-neutral-400 hover:text-white underline underline-offset-4 transition">
          Docs & API Guide
        </Link>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-emerald-400" /> 
          Your data stays yours.
        </span>
      </footer>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
        <span>{label}</span>
        <Icon className="h-3 w-3 text-slate-400" />
      </div>
      <p className="mt-1.5 font-mono text-xs sm:text-sm font-bold text-neutral-200">{value}</p>
    </div>
  );
}

function Activity({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className={`font-mono font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

function DataPoint({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-500 font-mono">{label}</p>
      <p className="mt-1.5 truncate text-xs sm:text-sm font-bold text-neutral-200 font-mono">{value}</p>
    </div>
  );
}

function Proof({ number, title, text }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-xs font-bold text-cyan-400">{number}</span>
      <strong className="font-display text-sm sm:text-base text-neutral-200">{title}</strong>
      <span className="max-w-[220px] text-xs leading-relaxed text-neutral-400">{text}</span>
    </div>
  );
}
