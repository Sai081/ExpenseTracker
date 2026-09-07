import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Target,
  Zap,
  Sliders
} from 'lucide-react';
import { api } from '../lib/api';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';

export function Budgets() {
  const { isDemo, budgets: demoBudgets, addBudget, updateBudget, removeBudget } = useDemoWorkspace();
  const [budgetData, setBudgetData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        const totalBudget = demoBudgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalSpent = demoBudgets.reduce((sum, budget) => sum + (budget.amount * budget.usage_percent / 100), 0);
        setBudgetData({
          budgets: demoBudgets.map((budget) => ({ ...budget, spent: budget.amount * budget.usage_percent / 100, remaining: budget.amount * (1 - budget.usage_percent / 100) })),
          total_budget: totalBudget,
          total_spent: totalSpent,
          overall_usage_percent: totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0,
        });
        setCategories(demoBudgets.map((budget, index) => ({ id: index + 1, name: budget.category_name })));
        setLoading(false);
        setError('');
        return;
      }
      const [bRes, cRes] = await Promise.all([
        api.getBudgets(),
        api.getCategories('expense')
      ]);
      setBudgetData(bRes);
      setCategories(cRes || []);
      if (cRes && cRes.length > 0 && !selectedCatId) {
        setSelectedCatId(cRes[0].id);
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch budget envelopes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [demoBudgets, isDemo]);

  const openAddModal = () => {
    setEditingBudgetId(null);
    setAmount('');
    if (categories.length > 0) setSelectedCatId(categories[0].id);
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setEditingBudgetId(b.id);
    setSelectedCatId(b.category_id);
    setAmount(b.amount.toString());
    setShowModal(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    try {
      if (isDemo) {
        if (editingBudgetId) updateBudget(editingBudgetId, { amount: parseFloat(amount) });
        else addBudget({ id: `demo-budget-${Date.now()}`, category_name: categories.find((category) => category.id === parseInt(selectedCatId))?.name || 'New category', amount: parseFloat(amount), usage_percent: 0 });
        setShowModal(false);
        setAmount('');
        setEditingBudgetId(null);
        return;
      }
      if (editingBudgetId) {
        await api.updateBudget(editingBudgetId, {
          amount: parseFloat(amount)
        });
      } else {
        await api.createBudget({
          category_id: parseInt(selectedCatId),
          amount: parseFloat(amount)
        });
      }
      setShowModal(false);
      setAmount('');
      setEditingBudgetId(null);
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to save budget envelope');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this category allocation envelope?')) return;
    try {
      if (isDemo) {
        removeBudget(id);
        return;
      }
      await api.deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget envelope');
    }
  };

  const budgets = budgetData?.budgets || [];
  const totalBudget = budgetData?.total_budget || 0;
  const totalSpent = budgetData?.total_spent || 0;
  const overallUsage = budgetData?.overall_usage_percent || 0;

  return (
    <div className="finance-workspace space-y-6 animate-fade-in pb-20 font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
              SPENDING PLAN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif] mt-0.5">
            Budgets that keep your priorities visible.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Set a monthly limit for the things you care about, then see how you are tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-sheen flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white transition shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 self-start sm:self-auto magnetic-btn"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Budget Limit</span>
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] hover-lift">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            TOTAL CEILING
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            ₹{totalBudget.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">Monthly allocated capital limit</span>
        </div>

        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] hover-lift">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            RECORDED OUTFLOW
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-2 font-mono">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">Across active budgeted envelopes</span>
        </div>

        <div className="p-6 rounded-3xl apple-glass-card border border-white/[0.08] hover-lift">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            CAPACITY CONSUMED
          </span>
          <p className={`text-2xl sm:text-3xl font-extrabold mt-2 font-mono ${
            overallUsage > 100 ? 'text-rose-500' : overallUsage > 80 ? 'text-amber-400' : 'text-violet-400'
          }`}>
            {overallUsage}%
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {overallUsage > 100 ? 'Warning: Ceiling breached' : 'Operating within safe parameters'}
          </span>
        </div>
      </div>

      {/* Budgets List Card */}
      <div className="p-6 sm:p-7 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h3 className="font-bold text-base text-white">Active Category Spending Caps</h3>
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
            {budgets.length} ACTIVE ENVELOPES
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-44 text-slate-400 gap-3 font-mono">
            <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
            <span className="text-xs">Loading allocations...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 text-xs text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20 font-mono">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            <p>No budget envelopes configured.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-violet-400 hover:underline font-bold"
            >
              + Create first spending envelope
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const isExceeded = b.usage_percent > 100;
              const isWarning = b.usage_percent > 80 && !isExceeded;
              const progressColor = isExceeded
                ? 'bg-rose-500'
                : isWarning
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400';

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-violet-500/40 transition shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">{b.category_name}</span>
                      <p className="text-[11px] text-slate-500 font-mono">Cap: ₹{b.amount.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        isExceeded
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                      }`}>
                        {b.usage_percent}%
                      </span>

                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition magnetic-btn"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteBudget(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition magnetic-btn"
                        title="Delete limit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(b.usage_percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-0.5">
                    <span>Spent: ₹{b.spent.toLocaleString('en-IN')}</span>
                    <span className={b.remaining < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {b.remaining < 0 ? `Over by ₹${Math.abs(b.remaining).toLocaleString('en-IN')}` : `Available: ₹${b.remaining.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 apple-glass-card border border-violet-500/30 rounded-3xl shadow-2xl text-white">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                <span>{editingBudgetId ? 'Edit Velocity Envelope' : 'Configure New Envelope'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {!editingBudgetId && (
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Target Domain
                  </label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0b0914] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                  Monthly Cap (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-sheen flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-violet-600/25 magnetic-btn"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingBudgetId ? 'Update Envelope' : 'Commit Cap'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
