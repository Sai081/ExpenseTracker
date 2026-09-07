import React, { useState, useEffect } from 'react';
import { X, Loader2, PlusCircle } from 'lucide-react';
import { api } from '../lib/api';

export function AddTransactionModal({ isOpen, onClose, onTransactionCreated }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getCategories()
        .then((cats) => {
          setCategories(cats || []);
          if (cats && cats.length > 0 && !categoryId) {
            setCategoryId(cats[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createTransaction({
        type,
        amount: parseFloat(amount),
        category_id: categoryId ? parseInt(categoryId) : null,
        description,
        date,
        payment_method: paymentMethod
      });
      if (onTransactionCreated) {
        onTransactionCreated();
      }
      // Reset
      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md p-6 sm:p-7 bg-[#0b0f19]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl text-white overflow-hidden">
        {/* Ambient glow, tinted to the selected transaction type */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-16 -right-10 w-56 h-56 rounded-full blur-[90px] transition-colors duration-500 ${
              type === 'expense' ? 'bg-rose-500/20' : 'bg-emerald-500/20'
            }`}
          />
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-4">Add New Transaction</h3>

        {error && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: Expense=Rose, Income=Emerald */}
          <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-base font-bold focus:outline-none transition ${
                  type === 'expense' ? 'text-rose-400 focus:border-rose-500' : 'text-emerald-400 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="">Select a Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Swiggy lunch, Monthly Rent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition text-xs cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition text-xs cursor-pointer capitalize"
              >
                <option value="upi" className="bg-slate-900 text-white">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card" className="bg-slate-900 text-white">Card (Debit / Credit)</option>
                <option value="cash" className="bg-slate-900 text-white">Cash</option>
                <option value="bank_transfer" className="bg-slate-900 text-white">Bank Transfer / Net Banking</option>
                <option value="other" className="bg-slate-900 text-white">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Save Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
