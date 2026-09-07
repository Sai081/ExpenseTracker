import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  KeyRound, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Target, 
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  Zap,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useBYOK } from '../context/KeyContext';
import { useAuth } from '../context/AuthContext';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';

export function Insights() {
  const { user } = useAuth();
  const { isDemo, dashboard: demoDashboard } = useDemoWorkspace();
  const { hasKey } = useBYOK();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [extraSaveGoal, setExtraSaveGoal] = useState(3000);
  const [yearlyViewFilter, setYearlyViewFilter] = useState('all'); // 'all', 'savings', 'expenses'

  // Generate list of past 12 months for selector
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

  const fetchInsights = async (monthToFetch = selectedMonth) => {
    try {
      setLoading(true);
      if (isDemo) {
        const summary = demoDashboard.summary;
        const savingsRateValue = Math.round((summary.net_savings / summary.monthly_income) * 100);
        const yearlyTrendValue = Array.from({ length: 12 }, (_, index) => {
          const factor = 0.78 + (index * 0.025);
          const income = Math.round(summary.monthly_income * factor);
          const expense = Math.round(summary.monthly_expenses * (0.92 + ((index % 4) * 0.025)));
          return { month: `2024-${String(index + 6).padStart(2, '0')}`, label: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'][index], income, expense, savings: income - expense };
        });
        setData({
          health_score: 86,
          score_rating: 'On track',
          savings_rate: savingsRateValue,
          monthly_income: summary.monthly_income,
          monthly_expenses: summary.monthly_expenses,
          net_savings: summary.net_savings,
          budgets_analyzed: demoDashboard.budgets.map((budget) => ({ ...budget, status: budget.usage_percent < 80 ? 'on_track' : 'watch' })),
          actionable_tips: [
            'Housing is your largest fixed cost. Keep the next month focused on flexible categories.',
            'Your current savings rate gives you room to build a three-month cash buffer.',
            'Food and transport together are below plan. Keep the current weekly rhythm.',
          ],
          yearly_trend: yearlyTrendValue,
          insights_text: 'Your cash flow is healthy this month. You retained more than half of your income while keeping flexible spending inside plan. The clearest next move is to protect that savings rate and review housing at renewal time.',
          selected_month_name: demoDashboard.selected_month_name,
        });
        setError('');
        setLoading(false);
        return;
      }
      const res = await api.getInsights(monthToFetch);
      setData(res);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(selectedMonth);
  }, [isDemo, selectedMonth, demoDashboard, user]);

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

  const handleRegenerate = async () => {
    if (isDemo) {
      await fetchInsights(selectedMonth);
      return;
    }
    setRegenerating(true);
    try {
      const res = await api.generateInsights(selectedMonth);
      setData(res.insights || res);
      setRegenerating(false);
    } catch (err) {
      alert(err.message || 'Failed to regenerate diagnostics');
    } finally {
      setRegenerating(false);
    }
  };

  const insightsObj = data?.insights || data || {};
  const healthScore = insightsObj.health_score ?? 75;
  const scoreRating = insightsObj.score_rating ?? 'Disciplined';
  const savingsRate = insightsObj.savings_rate ?? 0;
  const monthlyIncome = insightsObj.monthly_income ?? data?.summary?.monthly_income ?? 0;
  const monthlyExpenses = insightsObj.monthly_expenses ?? data?.summary?.monthly_expense ?? 0;
  const netSavings = insightsObj.net_savings ?? (monthlyIncome - monthlyExpenses);
  const budgets = insightsObj.budgets_analyzed ?? [];
  const tips = insightsObj.actionable_tips ?? [];
  const yearlyTrend = insightsObj.yearly_trend ?? [];
  const narrativeText = insightsObj.insights_text || (typeof insightsObj === 'string' ? insightsObj : '');
  const monthName = insightsObj.selected_month_name || monthOptions.find((m) => m.val === selectedMonth)?.label || 'Current Month';

  // Compute 12-Month totals
  const totalYearIncome = yearlyTrend.reduce((acc, curr) => acc + (curr.income || 0), 0);
  const totalYearExpense = yearlyTrend.reduce((acc, curr) => acc + (curr.expense || 0), 0);
  const totalYearSavings = totalYearIncome - totalYearExpense;
  const yearSavingsRate = totalYearIncome > 0 ? ((totalYearSavings / totalYearIncome) * 100).toFixed(1) : 0;

  const maxChartVal = Math.max(
    ...yearlyTrend.map((m) => Math.max(m.income || 0, m.expense || 0, m.savings || 0)),
    50000
  );

  const isEarliestMonth = selectedMonth === monthOptions[monthOptions.length - 1]?.val;
  const isLatestMonth = selectedMonth === monthOptions[0]?.val;

  return (
    <div className="finance-workspace space-y-8 max-w-5xl mx-auto animate-fade-in pb-20 font-['Space_Grotesk',sans-serif]">
      {/* Header & Month Navigator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
              YOUR FINANCIAL PATTERNS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif] mt-0.5">
            Insights you can act on.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Gentle, useful guidance built from the way your money actually moves.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Navigator Controls */}
          <div className="flex items-center gap-1.5 p-1 apple-glass-pill rounded-2xl shadow-xl border border-white/10">
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

          <button
            onClick={handleRegenerate}
            disabled={regenerating || loading}
            className="btn-sheen flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 disabled:opacity-50 text-white transition shadow-lg shadow-violet-600/30 magnetic-btn"
          >
            {regenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{regenerating ? 'Synthesizing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Month Context Banner */}
      <div className="p-3.5 rounded-2xl apple-glass border border-violet-500/25 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-400" />
          <span>Active diagnostic target: <strong className="text-white font-semibold">{monthName}</strong></span>
        </div>
        {!isLatestMonth && (
          <button
            onClick={() => setSelectedMonth(monthOptions[0].val)}
            className="text-cyan-400 hover:underline font-bold"
          >
            Back to Current Month →
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-3 p-8 rounded-3xl apple-glass-card font-mono">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-xs uppercase tracking-widest text-violet-300">Synthesizing telemetry for {monthName}...</p>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 p-6 rounded-3xl apple-glass-card border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white">Diagnostics Offline</p>
            <p className="text-xs text-rose-400 mt-1">{error}</p>
            <button
              onClick={() => fetchInsights(selectedMonth)}
              className="mt-3 px-3 py-1 text-xs font-mono font-semibold rounded-xl apple-glass-pill hover:text-white transition"
            >
              Re-query
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Row: Diagnostics for Selected Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Score Card */}
            <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] flex flex-col justify-between hover-lift">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  HEALTH SCORE ({monthName.split(' ')[0]})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-violet-500/10 border-violet-500/30 text-violet-300">
                  {scoreRating}
                </span>
              </div>

              <div className="flex items-baseline gap-2 my-2">
                <span className="text-5xl font-black text-white font-mono">{healthScore}</span>
                <span className="text-sm font-semibold text-slate-500 font-mono">/ 100</span>
              </div>

              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden my-3 border border-white/[0.06]">
                <div 
                  className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${healthScore}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Savings rate: {savingsRate}% • {budgets.filter(b => b.status === 'on_track').length} envelopes on target.
              </p>
            </div>

            {/* Monthly Cash Flow Card */}
            <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] flex flex-col justify-between hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  NET RETAINED ALPHA
                </span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>

              <div>
                <p className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">
                  +₹{netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-cyan-300 font-bold">
                    {savingsRate}% Retained
                  </span>
                  <span>of ₹{monthlyIncome.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-white/[0.06] text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">Inflow:</span>
                  <p className="font-semibold text-white">₹{monthlyIncome.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Outflow:</span>
                  <p className="font-semibold text-rose-400">₹{monthlyExpenses.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Run-Rate Card */}
            <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] flex flex-col justify-between hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  DAILY MEAN BURN
                </span>
                <Target className="w-4 h-4 text-violet-400" />
              </div>

              <div>
                <p className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">
                  ₹{((monthlyExpenses / 30) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  <span className="text-xs font-normal text-slate-400 font-sans"> / day</span>
                </p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Daily capital velocity during {monthName}.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs text-violet-300 font-mono">
                <ShieldCheck className="w-4 h-4 shrink-0 text-violet-400" />
                <span>Operating within safe limits</span>
              </div>
            </div>
          </div>

          {/* 12-MONTH HISTORICAL GRAPH */}
          <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold block">
                  12-MONTH DUAL TELEMETRY
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1 font-['Syne',sans-serif]">
                  Outflow vs Net Retained Alpha
                </h2>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-black/50 border border-white/10 rounded-xl text-xs font-semibold">
                {['all', 'savings', 'expenses'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setYearlyViewFilter(view)}
                    className={`px-3 py-1 rounded-lg font-mono capitalize transition ${
                      yearlyViewFilter === view
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {view === 'all' ? 'All Telemetry' : view === 'savings' ? 'Savings Alpha' : 'Burn Outflow'}
                  </button>
                ))}
              </div>
            </div>

            {/* Annual 12-Month Summary Stat Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-slate-500">12-Month Total Inflow</span>
                <p className="text-base font-bold text-white mt-0.5">₹{totalYearIncome.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500">12-Month Total Outflow</span>
                <p className="text-base font-bold text-rose-400 mt-0.5">₹{totalYearExpense.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500">12-Month Net Wealth Saved</span>
                <p className="text-base font-bold text-cyan-400 mt-0.5">
                  +₹{totalYearSavings.toLocaleString('en-IN')} <span className="text-slate-400 text-xs">({yearSavingsRate}%)</span>
                </p>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-64 flex items-end gap-2 sm:gap-4 justify-between pt-6 px-2 border-b border-white/[0.06]">
                {yearlyTrend.map((m, idx) => {
                  const expenseHeight = maxChartVal > 0 ? (m.expense / maxChartVal) * 100 : 0;
                  const savingsHeight = maxChartVal > 0 ? (Math.max(0, m.savings) / maxChartVal) * 100 : 0;
                  const isCurrentSelection = m.month === selectedMonth;

                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedMonth(m.month)}
                      className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer p-1 rounded-xl transition ${
                        isCurrentSelection ? 'bg-violet-500/10 ring-1 ring-violet-500/40' : 'hover:bg-white/[0.02]'
                      }`}
                      title={`${m.label}: Income ₹${m.income.toLocaleString()} | Outflow ₹${m.expense.toLocaleString()} | Savings ₹${m.savings.toLocaleString()}`}
                    >
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-48">
                        {/* Expense Bar */}
                        {(yearlyViewFilter === 'all' || yearlyViewFilter === 'expenses') && (
                          <div 
                            className="w-full max-w-[12px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-500 group-hover:brightness-125"
                            style={{ height: `${Math.max(6, expenseHeight)}%` }}
                          />
                        )}

                        {/* Savings Bar */}
                        {(yearlyViewFilter === 'all' || yearlyViewFilter === 'savings') && (
                          <div 
                            className="w-full max-w-[12px] bg-gradient-to-t from-violet-600 via-purple-500 to-fuchsia-400 rounded-t-sm transition-all duration-500 group-hover:brightness-125 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                            style={{ height: `${Math.max(6, savingsHeight)}%` }}
                          />
                        )}
                      </div>

                      <span className={`text-[10px] mt-2 font-mono ${
                        isCurrentSelection ? 'text-violet-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                      }`}>
                        {m.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-violet-600 to-fuchsia-400" />
                  <span>Retained Wealth (Electric Violet)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span>Burn Outflows (Crimson)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Groq LLaMA Narrative Report */}
          {narrativeText && (
            <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Groq LLaMA 3.1 Synthesis ({monthName})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Autonomous Edge Analysis</span>
              </div>

              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {narrativeText}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
