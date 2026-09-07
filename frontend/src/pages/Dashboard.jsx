import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { useCurrency } from '../context/CurrencyContext';

export function Dashboard() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { dashboard: demoDashboard, voiceHistory: demoVoiceHistory } = useDemoWorkspace();
  const isDemo = user?.id === 2 || user?.email === 'demo@expensetracker.local';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate past 12 months for selector
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.val || '');

  const fetchSummary = async (monthToFetch = selectedMonth) => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary(monthToFetch);
      setData(res);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemo) {
      setData(demoDashboard);
      setError('');
      setLoading(false);
      return;
    }
    fetchSummary(selectedMonth);
  }, [demoDashboard, isDemo, selectedMonth]);

  const handlePrevMonth = () => {
    const currentIndex = monthOptions.findIndex((m) => m.val === selectedMonth);
    if (currentIndex < monthOptions.length - 1) {
      setSelectedMonth(monthOptions[currentIndex + 1].val);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = monthOptions.findIndex((m) => m.val === selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(monthOptions[currentIndex - 1].val);
    }
  };

  const isEarliestMonth = selectedMonth === monthOptions[monthOptions.length - 1]?.val;
  const isLatestMonth = selectedMonth === monthOptions[0]?.val;
  const monthName = data?.selected_month_name || monthOptions.find((m) => m.val === selectedMonth)?.label || 'Current Month';

  const summary = data?.summary || {};
  const budgets = data?.budgets || [];
  const categoryBreakdown = data?.category_breakdown || [];
  const recentTxns = data?.recent_transactions || [];
  const totalCatAmount = categoryBreakdown.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400 font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs uppercase tracking-widest text-violet-300">Synchronizing Ledger Telemetry...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10 rounded-3xl apple-glass-card border border-rose-500/30 text-rose-300 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 shrink-0 text-rose-400" />
        <div>
          <p className="font-bold text-white">Telemetry Synchronization Failure</p>
          <p className="text-xs text-rose-400 mt-0.5">{error}</p>
          <button 
            onClick={() => fetchSummary(selectedMonth)}
            className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition magnetic-btn"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome back';
  };

  const getAmountFontSize = (val) => {
    const absVal = Math.abs(Number(val) || 0);
    if (absVal >= 1000000000) return 'text-lg sm:text-xl';
    if (absVal >= 10000000) return 'text-xl sm:text-2xl';
    return 'text-2xl sm:text-3xl';
  };

  return (
    <div className="finance-workspace space-y-8 animate-fade-in pb-20 font-['Space_Grotesk',sans-serif]">
      {/* Top Banner with Telemetry Header and Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                YOUR MONEY, AT A GLANCE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif] mt-0.5">
            {getGreeting()}, here is your money story.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            A clear view of what came in, what went out, and what you can do next for <strong className="text-white font-semibold">{monthName}</strong>
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1.5 p-1 apple-glass-pill rounded-2xl shadow-xl self-start sm:self-auto border border-white/10">
          <button
            onClick={handlePrevMonth}
            disabled={isEarliestMonth || loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition magnetic-btn"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs font-mono font-bold px-2 py-1.5 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              {monthOptions.map((opt) => (
                <option key={opt.val} value={opt.val} className="bg-[#0b0914] text-white font-mono">
                  {opt.label}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-violet-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleNextMonth}
            disabled={isLatestMonth || loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition magnetic-btn"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Past Month Notice */}
      {!isLatestMonth && (
        <div className="p-3.5 rounded-2xl apple-glass border border-violet-500/30 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            <span>Viewing historical ledger telemetry for: <strong className="text-white">{monthName}</strong></span>
          </div>
          <button
            onClick={() => setSelectedMonth(monthOptions[0].val)}
            className="text-cyan-400 hover:underline font-bold"
          >
            Back to Current Month →
          </button>
        </div>
      )}

      {/* 4 Metric Cockpit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Inflow */}
        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] min-w-0 overflow-hidden hover:border-violet-500/40 transition-all hover-lift space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              GROSS INFLOW (MONTHLY)
            </span>
            <div className="p-1.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <p 
            className={`${getAmountFontSize(summary.monthly_income)} font-extrabold text-white font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis`}
            title={`+${currency.symbol}${summary.monthly_income?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          >
            +{currency.symbol}{summary.monthly_income?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-mono">↑ Earned in {monthName.split(' ')[0]}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 w-[82%] rounded-full" />
          </div>
        </div>

        {/* Burn Rate */}
        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] min-w-0 overflow-hidden hover:border-rose-500/40 transition-all hover-lift space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              BURN RATE (MONTHLY)
            </span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <p 
            className={`${getAmountFontSize(summary.monthly_expenses)} font-extrabold text-rose-400 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis`}
            title={`-${currency.symbol}${summary.monthly_expenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          >
            -{currency.symbol}{summary.monthly_expenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-400 font-mono">↓ Outflow for {monthName.split(' ')[0]}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (summary.monthly_expenses / (summary.monthly_income || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Net Savings Velocity */}
        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] min-w-0 overflow-hidden hover:border-cyan-500/40 transition-all hover-lift space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              NET SAVINGS VELOCITY
            </span>
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <p 
            className={`${getAmountFontSize(summary.net_savings)} font-extrabold font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${
              (summary.net_savings || 0) >= 0 ? 'text-white' : 'text-rose-400'
            }`}
            title={`${(summary.net_savings || 0) >= 0 ? '+' : ''}${currency.symbol}${summary.net_savings?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          >
            {(summary.net_savings || 0) >= 0 ? '+' : ''}{currency.symbol}{summary.net_savings?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-400 font-mono">✓ Net wealth retained</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-[65%] rounded-full" />
          </div>
        </div>

        {/* Daily Mean Burn */}
        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] min-w-0 overflow-hidden hover:border-violet-500/40 transition-all hover-lift space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              DAILY MEAN BURN
            </span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p 
            className={`${getAmountFontSize(summary.today_expenses)} font-extrabold text-white font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis`}
            title={`${currency.symbol}${summary.today_expenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })} /day`}
          >
            {currency.symbol}{summary.today_expenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-400 font-sans"> /day</span>
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">
              Across {summary.today_count || 0} transaction{summary.today_count === 1 ? '' : 's'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-violet-400 w-[55%] rounded-full" />
          </div>
        </div>

      </div>

      {isDemo && (
        <section className="finance-voice-panel p-6 sm:p-7 rounded-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-indigo-300 font-semibold">VOICE COPILOT HISTORY</span>
              <h3 className="mt-2 text-xl font-bold text-white">Your recent entries, already understood.</h3>
            </div>
            <span className="text-xs text-slate-500">3 entries processed today</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {demoVoiceHistory.map((entry) => (
              <div key={entry.id} className="finance-voice-item p-4 rounded-2xl">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,.8)]" />
                  <span className="text-[10px] text-slate-500 font-mono">{entry.time}</span>
                </div>
                <p className="mt-4 text-sm leading-5 text-slate-200">“{entry.transcript}”</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[11px]">
                  <span className="text-slate-500">{entry.category}</span>
                  <span className="text-emerald-300">{entry.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Middle Section: Category Velocity Envelopes & Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Velocity Envelopes (1 col) */}
        <div className="p-6 sm:p-7 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-violet-400 tracking-wider font-bold block">
                  CAP ENVELOPES
                </span>
                <h3 className="font-bold text-lg text-white">Budget Health</h3>
              </div>
              <Link to="/budgets" className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition">
                Manage →
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {summary.budget_usage_percent || 0}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currency.symbol}{summary.total_spent?.toLocaleString('en-US')} / {currency.symbol}{summary.total_budget?.toLocaleString('en-US')}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (summary.budget_usage_percent || 0) > 100
                      ? 'bg-rose-500'
                      : (summary.budget_usage_percent || 0) > 80
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(summary.budget_usage_percent || 0, 100)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                {(summary.budget_usage_percent || 0) > 100
                  ? '⚠️ Exceeded budgeted threshold for this month.'
                  : (summary.budget_usage_percent || 0) > 80
                  ? '⚡ Approaching allocation limits.'
                  : '✨ Disciplined allocation; velocity is within targets.'}
              </p>
            </div>
          </div>

          {/* Sub envelopes */}
          <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold block">
              Active Category Allocations
            </span>
            {budgets.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No allocations configured for this month.</p>
            ) : (
              budgets.slice(0, 3).map((b) => (
                <div key={b.id} className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[150px]">{b.category_name}</span>
                    <span className={`font-mono font-bold ${b.usage_percent >= 100 ? 'text-rose-400' : 'text-violet-300'}`}>
                      {b.usage_percent}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.usage_percent >= 100 ? 'bg-rose-500' : 'bg-violet-500'}`}
                      style={{ width: `${Math.min(b.usage_percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-violet-400 tracking-wider font-bold block">
                DOMAIN ALLOCATION
              </span>
              <h3 className="font-bold text-lg text-white">Spending by Category</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{monthName}</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-slate-500 text-xs font-mono">
              <p>No expenses recorded in {monthName}.</p>
              <p className="text-slate-600 mt-1">Speak into copilot or log a new transaction.</p>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {categoryBreakdown.map((item, idx) => {
                const pct = totalCatAmount > 0 ? Math.round((item.amount / totalCatAmount) * 100) : 0;
                const colors = [
                  'from-violet-600 to-fuchsia-500',
                  'from-cyan-500 to-blue-500',
                  'from-fuchsia-500 to-pink-500',
                  'from-indigo-500 to-violet-600',
                  'from-amber-400 to-orange-500'
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-200">{item.category}</span>
                      <span className="text-slate-400 font-mono font-bold">
                        {currency.symbol}{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.04]">
                      <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <div className="p-6 sm:p-7 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-violet-400 tracking-wider font-bold block">
              REAL-TIME LEDGER LOG
            </span>
            <h3 className="font-bold text-lg text-white">Transactions ({monthName})</h3>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>Full Ledger →</span>
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No entries recorded in {monthName}.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentTxns.map((txn) => {
              const isExpense = txn.type === 'expense';
              return (
                <div key={txn.id} className="py-3.5 flex items-center justify-between group hover:bg-white/[0.02] px-3 rounded-2xl transition">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${
                      isExpense 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {txn.description || txn.category || 'Transaction'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono text-[11px]">
                        <span>{txn.date}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300">
                          {txn.category || 'Uncategorized'}
                        </span>
                        {txn.payment_method && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{txn.payment_method}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-base font-extrabold font-mono ${
                      isExpense ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {isExpense ? '-' : '+'}{currency.symbol}{txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
