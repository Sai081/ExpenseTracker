import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Trash2, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Download,
  Calendar,
  X,
  Check,
  CreditCard,
  Layers,
  Database
} from 'lucide-react';
import { api, getApiBaseUrl } from '../lib/api';
import { useDemoWorkspace } from '../context/DemoWorkspaceContext';
import { useCurrency } from '../context/CurrencyContext';

export function Transactions() {
  const { currency } = useCurrency();
  const demoWorkspace = useDemoWorkspace() || {};
  const { isDemo = false, transactions: demoTransactions = [], removeTransaction = () => {}, updateTransaction = () => {} } = demoWorkspace;
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Edit Modal State
  const [editingTxn, setEditingTxn] = useState(null);
  const [editForm, setEditForm] = useState({
    type: 'expense',
    amount: '',
    category_id: '',
    description: '',
    payment_method: 'upi',
    date: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');

  const fetchTransactions = async () => {
    if (isDemo) {
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const filtered = demoTransactions.filter((transaction) => {
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesSearch = !normalizedSearch || `${transaction.description} ${transaction.category} ${transaction.payment_method}`.toLowerCase().includes(normalizedSearch);
        return matchesType && matchesSearch;
      });
      setTransactions(filtered);
      setTotalPages(1);
      setTotalCount(filtered.length);
      setLoading(false);
      setError('');
      return;
    }
    try {
      setLoading(true);
      const res = await api.getTransactions({
        page,
        per_page: 15,
        type: typeFilter === 'all' ? '' : typeFilter,
        search: searchQuery
      });
      setTransactions(res.transactions || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.total_count || 0);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [demoTransactions, isDemo, page, typeFilter]);

  useEffect(() => {
    if (isDemo) {
      setCategories(demoTransactions.map((transaction, index) => ({ id: index + 1, name: transaction.category })));
      return;
    }
    api.getCategories().then(res => setCategories(res || [])).catch(() => {});
  }, [demoTransactions, isDemo]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isDemo, demoTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ledger entry permanently?')) return;
    setDeletingId(id);
    try {
      if (isDemo) {
        removeTransaction(id);
        setTransactions((current) => current.filter((transaction) => transaction.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        return;
      }
      await api.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenEdit = (txn) => {
    setEditingTxn(txn);
    setEditForm({
      type: txn.type || 'expense',
      amount: txn.amount?.toString() || '',
      category_id: txn.category_id || (categories.find(c => c.name === txn.category)?.id || ''),
      description: txn.description || '',
      payment_method: txn.payment_method || 'upi',
      date: txn.date || new Date().toISOString().split('T')[0]
    });
    setEditSuccess('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTxn || !editForm.amount || parseFloat(editForm.amount) <= 0) return;

    setEditSubmitting(true);
    try {
      if (isDemo) {
        const matchedCat = categories.find(c => c.id === parseInt(editForm.category_id));
        updateTransaction(editingTxn.id, {
          type: editForm.type,
          amount: parseFloat(editForm.amount),
          category: matchedCat?.name || editingTxn.category,
          description: editForm.description,
          payment_method: editForm.payment_method,
          date: editForm.date,
        });
        setTransactions((current) => current.map((transaction) => transaction.id === editingTxn.id ? {
          ...transaction,
          type: editForm.type,
          amount: parseFloat(editForm.amount),
          category: matchedCat?.name || transaction.category,
          description: editForm.description,
          payment_method: editForm.payment_method,
          date: editForm.date,
        } : transaction));
        setEditSuccess('Transaction updated.');
        setTimeout(() => setEditingTxn(null), 700);
        return;
      }
      await api.updateTransaction(editingTxn.id, {
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        category_id: editForm.category_id ? parseInt(editForm.category_id) : null,
        description: editForm.description,
        payment_method: editForm.payment_method,
        date: editForm.date
      });

      const matchedCat = categories.find(c => c.id === parseInt(editForm.category_id));
      setTransactions(transactions.map(t => t.id === editingTxn.id ? {
        ...t,
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        category_id: editForm.category_id,
        category: matchedCat ? matchedCat.name : t.category,
        description: editForm.description,
        payment_method: editForm.payment_method,
        date: editForm.date
      } : t));

      setEditSuccess('Ledger entry updated successfully!');
      setTimeout(() => {
        setEditingTxn(null);
        setEditSuccess('');
      }, 900);
    } catch (err) {
      alert(err.message || 'Failed to update transaction');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="finance-workspace space-y-6 animate-fade-in pb-20 font-['Space_Grotesk',sans-serif]">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
              ALL ACTIVITY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif] mt-0.5">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Every income and expense, in one calm, searchable timeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={`${getApiBaseUrl()}/report/export_csv?currency=${currency.code}&currency_symbol=${encodeURIComponent(currency.symbol)}`}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-xl apple-glass-pill border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition shadow-sm magnetic-btn"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV ({currency.code})</span>
          </a>
          <a
            href={`${getApiBaseUrl()}/report/export_pdf?currency=${currency.code}&currency_symbol=${encodeURIComponent(currency.symbol)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-xl apple-glass-pill border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 transition shadow-sm magnetic-btn"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Export PDF ({currency.code})</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search descriptions, tags, merchants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition font-mono"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/[0.06] w-full md:w-auto">
          {['all', 'expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                setPage(1);
              }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                typeFilter === t
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Ledger Card */}
      <div className="p-6 sm:p-7 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-52 text-slate-400 gap-3 font-mono">
            <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
            <span className="text-xs">Querying PostgreSQL schema...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400 text-xs flex items-center justify-center gap-2 font-mono">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No entries found in this ledger query.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {transactions.map((txn) => {
              const isExpense = txn.type === 'expense';
              return (
                <div
                  key={txn.id}
                  className="py-4 px-3 rounded-2xl transition group hover:bg-white/[0.02] min-w-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isExpense
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {isExpense ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                          {txn.description || txn.category || 'Transaction'}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{txn.date}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 truncate max-w-[120px]">
                            {txn.category || 'Uncategorized'}
                          </span>
                          {txn.payment_method && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 capitalize">{txn.payment_method}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center shrink-0 text-right pl-2">
                      <p
                        className={`font-mono text-xs sm:text-sm font-bold ${
                          isExpense ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}{currency.symbol}{txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>

                      <div className="flex items-center justify-end gap-1.5 mt-2 sm:mt-1">
                        <button
                          onClick={() => handleOpenEdit(txn)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition magnetic-btn"
                          title="Edit ledger record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(txn.id)}
                          disabled={deletingId === txn.id}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-xl transition magnetic-btn"
                          title="Delete ledger record"
                        >
                          {deletingId === txn.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/[0.06] text-xs font-mono text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3.5 py-1.5 rounded-xl apple-glass-pill hover:text-white disabled:opacity-30 transition magnetic-btn"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3.5 py-1.5 rounded-xl apple-glass-pill hover:text-white disabled:opacity-30 transition magnetic-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 apple-glass-card rounded-3xl shadow-2xl text-white border border-violet-500/30">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-violet-400" />
                <span>Edit Ledger Entry</span>
              </h3>
              <button
                onClick={() => setEditingTxn(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editSuccess && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <Check className="w-4 h-4" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Type</label>
                <div className="flex items-center p-1 bg-black/50 border border-white/10 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'expense' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      editForm.type === 'expense'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'income' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      editForm.type === 'income'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Amount ({currency.symbol})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-xs">{currency.symbol}</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Classification</label>
                <select
                  value={editForm.category_id}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b0914] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="e.g. Lunch with team"
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Rail / Channel</label>
                <select
                  value={editForm.payment_method}
                  onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 cursor-pointer capitalize"
                >
                  <option value="upi" className="bg-[#0b0914] text-white">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="card" className="bg-[#0b0914] text-white">Debit / Credit Card</option>
                  <option value="cash" className="bg-[#0b0914] text-white">Cash</option>
                  <option value="bank_transfer" className="bg-[#0b0914] text-white">Bank Transfer / NEFT</option>
                  <option value="other" className="bg-[#0b0914] text-white">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Timestamp</label>
                <input
                  type="date"
                  required
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTxn(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn-sheen flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-violet-600/25 magnetic-btn"
                >
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Commit Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
