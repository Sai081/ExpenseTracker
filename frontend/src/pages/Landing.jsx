import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, CheckCheck, ChevronRight,
  Copy, CreditCard, Lock, Mic, MoreHorizontal, Play, Plus, Sparkles, Wallet, X
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
  const { signInDemo } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [copied, setCopied] = useState(false);


  const handleDemoLaunch = async () => {
    setDemoLoading(true);
    try {
      if (signInDemo) await signInDemo();
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  const copyPayload = async () => {
    await navigator.clipboard?.writeText(JSON.stringify({ amount: 450, category: 'Food & Dining', payment_method: 'UPI' }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selected = voiceDemos[activeDemo];

  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-[#071312] text-white selection:bg-cyan-500/30 selection:text-cyan-100">
      <div className="landing-noise pointer-events-none fixed inset-0 z-0" />
      <div className="landing-glow pointer-events-none fixed left-1/2 top-[-24rem] z-0 h-[42rem] w-[52rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[130px]" />

      <header
        className={`navbar fixed top-0 left-0 right-0 z-[1000] w-full transition-all duration-300 ${
          isScrolled
            ? 'apple-glass border-b border-white/[0.08] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.7)]'
            : 'bg-[#071312]/80 backdrop-blur-md border-b border-white/[0.06]'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-white/10 pointer-events-none" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link to="/" className="group flex items-center gap-3" aria-label="ExpenseTracker home">
            <div className="relative p-1 rounded-2xl bg-white/[0.03] border border-white/[0.1] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <BrandLogo className="h-8 w-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight font-display">
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

          <nav className="hidden items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md md:flex" aria-label="Marketing navigation">
            <button
              onClick={(e) => scrollToSection(e, 'product')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Product
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              How it works
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'voice-ledger')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Voice Ledger
            </button>
            <Link
              to="/docs"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-all duration-200"
            >
              Docs
            </Link>
            <button
              onClick={(e) => scrollToSection(e, 'privacy')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Privacy
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.45)] transition-all active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pt-24 pb-24 sm:px-8 lg:px-10">
        <section className="grid min-h-[650px] items-center gap-14 pb-20 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:pb-28 lg:pt-28" id="product">
          <div className="landing-reveal max-w-xl" style={{ '--reveal-delay': '100ms' }}>
            <div className="landing-eyebrow mb-6"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_12px_#818cf8]" /> Your money, made clear</div>
            <h1 className="font-display text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-white">See the shape of your <span className="text-neutral-500">money.</span></h1>
            <p className="mt-7 max-w-md text-[16px] leading-7 text-neutral-400">ExpenseTracker turns everyday spending into a calm, useful picture of your life. Add a transaction by voice, stay on top of your plan, and make better decisions with less effort.</p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link to="/login" className="landing-button landing-button-primary px-5 py-3 text-sm"><Sparkles className="h-4 w-4" /> Get Started Free <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how-it-works" className="group flex items-center gap-2 px-3 py-3 text-sm text-neutral-400 transition hover:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"><Play className="h-3 w-3 fill-current" /></span> See how it works</a>
            </div>
            <div className="mt-9 flex items-center gap-4 text-[11px] text-neutral-600"><span className="h-px w-8 bg-white/10" /> Private by design <span className="h-1 w-1 rounded-full bg-neutral-700" /> Built for everyday life</div>
          </div>

          <div className="landing-reveal relative lg:translate-y-4" style={{ '--reveal-delay': '220ms' }}>
            <div className="landing-window overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#111113]/90 shadow-[0_35px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400/80" /><span className="h-2 w-2 rounded-full bg-amber-300/80" /><span className="h-2 w-2 rounded-full bg-emerald-400/80" /></div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">Overview / May 2025</span><MoreHorizontal className="h-4 w-4 text-neutral-600" /></div>
              <div className="grid gap-5 p-5 sm:p-7">
                <div className="flex items-end justify-between"><div><p className="text-xs text-neutral-500">Available this month</p><p className="mt-1 font-display text-4xl font-semibold tracking-[-0.06em]">₹50,750<span className="ml-2 text-sm font-normal tracking-normal text-emerald-400">+14.2%</span></p></div><Link to="/login" className="rounded-full border border-white/10 bg-white/[0.05] p-2.5 text-neutral-300 transition hover:bg-white/10"><Plus className="h-4 w-4" /></Link></div>
                <div className="grid gap-3 sm:grid-cols-3"><Metric label="Income" value="₹85,000" icon={ArrowDownLeft} /><Metric label="Spent" value="₹34,250" icon={ArrowUpRight} /><Metric label="Savings rate" value="59.7%" icon={BarChart3} /></div>
                <div className="grid gap-5 border-t border-white/[0.08] pt-5 sm:grid-cols-[1fr_0.85fr]">
                  <div><div className="mb-4 flex items-center justify-between"><p className="text-xs font-medium text-neutral-300">Spending by category</p><span className="text-[10px] text-neutral-600">This month</span></div><div className="space-y-4">{spendRows.map((row) => <div key={row.label}><div className="mb-1.5 flex justify-between text-[11px]"><span className="text-neutral-400">{row.label}</span><span className="text-neutral-300">{row.value}</span></div><div className="h-1 rounded-full bg-white/[0.08]"><div className={`h-full rounded-full ${row.tone}`} style={{ width: `${row.percent}%` }} /></div></div>)}</div></div>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><div className="mb-5 flex items-center justify-between"><p className="text-xs font-medium text-neutral-300">Recent activity</p><ChevronRight className="h-3.5 w-3.5 text-neutral-600" /></div><div className="space-y-4"><Activity label="Salary" value="+₹85,000" tone="text-emerald-400" /><Activity label="Lunch with team" value="-₹450" tone="text-neutral-300" /><Activity label="Groceries" value="-₹1,450" tone="text-neutral-300" /></div></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden w-52 rounded-2xl border border-white/[0.1] bg-[#151517]/90 p-4 shadow-2xl backdrop-blur-xl sm:block"><div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-neutral-500"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Voice entry</div><p className="text-xs leading-5 text-neutral-300">“Spent 450 rupees for lunch with team.”</p><div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[11px]"><span className="text-neutral-500">Food & Dining</span><span className="text-white">-₹450</span></div></div>
          </div>
        </section>

        <section className="landing-reveal border-y border-white/[0.08] py-7" id="how-it-works" style={{ '--reveal-delay': '120ms' }}><div className="grid gap-6 text-center text-sm text-neutral-500 sm:grid-cols-3"><Proof number="01" title="Say it naturally" text="Log an expense in the words you already use." /><Proof number="02" title="It finds the meaning" text="Smart categories keep your records clean." /><Proof number="03" title="Know what to do next" text="Simple insights turn history into direction." /></div></section>

        <section className="landing-reveal py-24 lg:py-32" id="voice-ledger" style={{ '--reveal-delay': '180ms' }}><div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="landing-label">The voice ledger</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Your thoughts, organized.</h2></div><p className="max-w-xs text-sm leading-6 text-neutral-500">A natural way to keep your financial life current, without making it another chore.</p></div><div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]"><div className="space-y-3">{voiceDemos.map((demo, index) => { const Icon = demo.icon; return <button key={demo.phrase} onClick={() => setActiveDemo(index)} className={`landing-list-row w-full text-left ${activeDemo === index ? 'landing-list-row-active' : ''}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-400"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm text-neutral-200">{demo.phrase}</span><span className="mt-1 block text-[11px] text-neutral-600">{demo.category} · {demo.rail}</span></span><span className={`font-mono text-xs ${demo.amount.startsWith('+') ? 'text-emerald-400' : 'text-neutral-400'}`}>{demo.amount}</span></button>; })}</div><div className="landing-panel relative overflow-hidden p-5 sm:p-7"><div className="flex items-center justify-between border-b border-white/[0.08] pb-5"><div><p className="landing-label">Structured automatically</p><p className="mt-2 text-sm text-neutral-300">{selected.phrase}</p></div><button onClick={copyPayload} className="rounded-lg border border-white/10 p-2 text-neutral-500 transition hover:bg-white/[0.06] hover:text-white" title="Copy transaction payload">{copied ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button></div><div className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-4"><DataPoint label="Amount" value={selected.amount} /><DataPoint label="Category" value={selected.category} /><DataPoint label="Payment" value={selected.rail} /><DataPoint label="Status" value="Ready" /></div><div className="rounded-xl border border-white/[0.08] bg-black/30 p-4 font-mono text-[11px] leading-6 text-neutral-500"><span className="text-neutral-700">{'{'}</span><br /><span className="pl-4 text-indigo-300">"amount"</span>: <span className="text-neutral-300">450</span>,<br /><span className="pl-4 text-indigo-300">"category"</span>: <span className="text-emerald-300">"Food & Dining"</span>,<br /><span className="pl-4 text-indigo-300">"payment_method"</span>: <span className="text-emerald-300">"UPI"</span><br /><span className="text-neutral-700">{'}'}</span></div><div className="mt-5 flex items-center justify-between text-[11px] text-neutral-600"><span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Private to your workspace</span><Link to="/login" className="text-neutral-300 transition hover:text-white">Sign in to track <ArrowRight className="ml-1 inline h-3 w-3" /></Link></div></div></div></section>

        <section className="landing-reveal landing-panel flex flex-col items-start justify-between gap-7 p-7 sm:flex-row sm:items-center sm:p-10" id="privacy" style={{ '--reveal-delay': '240ms' }}><div><p className="landing-label">Quiet confidence</p><h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">The best finance tool is the one you keep using.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-neutral-500">No judgment, no noise, no financial theater. Just a private workspace that helps you stay in the loop.</p></div><Link to="/login" className="landing-button landing-button-primary shrink-0 px-5 py-3 text-sm">Start with a clean slate <ArrowRight className="h-4 w-4" /></Link></section>
      </main>


      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[0.08] px-5 py-8 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span className="font-display font-semibold text-neutral-300">ExpenseTracker</span><span>Less admin. More awareness.</span><Link to="/docs" className="text-neutral-400 hover:text-white underline underline-offset-4 transition">Docs</Link><span className="flex items-center gap-2"><Lock className="h-3 w-3" /> Your data stays yours.</span></footer>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) { return <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3"><div className="flex items-center justify-between text-[10px] text-neutral-600"><span>{label}</span><Icon className="h-3 w-3" /></div><p className="mt-2 font-mono text-sm text-neutral-200">{value}</p></div>; }
function Activity({ label, value, tone }) { return <div className="flex items-center justify-between text-xs"><span className="text-neutral-500">{label}</span><span className={tone}>{value}</span></div>; }
function DataPoint({ label, value }) { return <div><p className="text-[10px] uppercase tracking-[0.12em] text-neutral-600">{label}</p><p className="mt-2 truncate text-xs text-neutral-200">{value}</p></div>; }
function Proof({ number, title, text }) { return <div className="flex flex-col items-center gap-2"><span className="font-mono text-[10px] text-indigo-300">{number}</span><strong className="font-display text-sm text-neutral-300">{title}</strong><span className="max-w-[190px] text-xs leading-5 text-neutral-600">{text}</span></div>; }
