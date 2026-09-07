import React, { useState, useEffect } from "react";
import { X, Loader2, PlusCircle } from "lucide-react";
import { api } from "../lib/api";
import { useCurrency } from "../context/CurrencyContext";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Food & Dining" },
  { id: 2, name: "Household Groceries" },
  { id: 3, name: "Transportation" },
  { id: 4, name: "Housing & Rent" },
  { id: 5, name: "Utilities & Bills" },
  { id: 6, name: "Entertainment & Leisure" },
  { id: 7, name: "Healthcare & Fitness" },
  { id: 8, name: "Salary" },
  { id: 9, name: "Miscellaneous" }
];

export function AddTransactionModal({ isOpen, onClose, onTransactionCreated }) {
  const currencyContext = useCurrency();
  const currencySymbol = currencyContext?.currency?.symbol || "₹";

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      api.getCategories()
        .then((cats) => {
          if (Array.isArray(cats) && cats.length > 0) {
            setCategories(cats);
            if (!categoryId) setCategoryId(cats[0].id);
          } else if (cats && Array.isArray(cats.data) && cats.data.length > 0) {
            setCategories(cats.data);
            if (!categoryId) setCategoryId(cats.data[0].id);
          } else {
            setCategories(DEFAULT_CATEGORIES);
            if (!categoryId) setCategoryId(DEFAULT_CATEGORIES[0].id);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch remote categories, using defaults:", err);
          setCategories(DEFAULT_CATEGORIES);
          if (!categoryId) setCategoryId(DEFAULT_CATEGORIES[0].id);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.createTransaction({
        type,
        amount: numAmount,
        category_id: categoryId ? parseInt(categoryId) : null,
        description: description.trim() || (type === "expense" ? "Expense" : "Income"),
        date,
        payment_method: paymentMethod
      });
      if (onTransactionCreated) {
        onTransactionCreated();
      }
      setAmount("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryList = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md p-6 sm:p-7 apple-glass-card rounded-3xl shadow-2xl border border-white/15 text-white overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-16 -right-10 w-56 h-56 rounded-full blur-[90px] transition-colors duration-500 ${
              type === "expense" ? "bg-rose-500/20" : "bg-emerald-500/20"
            }`}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4">Add New Transaction</h3>

        {error && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: Expense=Rose, Income=Emerald */}
          <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === "expense"
                  ? "bg-rose-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">
              Amount ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm font-mono">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 rounded-2xl glass-input font-mono text-base font-bold focus:outline-none transition ${
                  type === "expense" ? "text-rose-400 focus:border-rose-500" : "text-emerald-400 focus:border-emerald-500"
                }`}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Classification</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              {categoryList.map((c, idx) => {
                const catId = typeof c === "object" && c !== null ? (c.id || idx + 1) : idx + 1;
                const catName = typeof c === "object" && c !== null ? (c.name || "Category") : String(c);
                return (
                  <option key={catId} value={catId} className="bg-[#0b1d1a] text-white">
                    {catName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Description</label>
            <input
              type="text"
              placeholder="e.g. Lunch with team, Groceries, Electricity bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl glass-input text-white focus:outline-none focus:border-cyan-500 transition text-xs cursor-pointer font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Payment Rail</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl glass-input text-white focus:outline-none focus:border-cyan-500 transition text-xs cursor-pointer capitalize font-mono"
              >
                <option value="upi" className="bg-[#0b1d1a] text-white">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card" className="bg-[#0b1d1a] text-white">Debit / Credit Card</option>
                <option value="cash" className="bg-[#0b1d1a] text-white">Cash</option>
                <option value="bank_transfer" className="bg-[#0b1d1a] text-white">Bank Transfer / NEFT</option>
                <option value="other" className="bg-[#0b1d1a] text-white">Other</option>
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
              className="btn-sheen flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Save to Ledger
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
