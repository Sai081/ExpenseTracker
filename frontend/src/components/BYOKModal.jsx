import React, { useState, useEffect } from 'react';
import { KeyRound, Sparkles, ExternalLink, X, Check, ShieldCheck } from 'lucide-react';
import { useBYOK } from '../context/KeyContext';

export function BYOKModal() {
  const { isModalOpen, closeModal, dismissModal, saveKey, groqKey } = useBYOK();
  const [inputVal, setInputVal] = useState(groqKey || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setInputVal(groqKey || '');
  }, [groqKey, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      setError('Please paste your Groq API key (starts with gsk_) or click Skip.');
      return;
    }
    if (!inputVal.trim().startsWith('gsk_')) {
      setError('A valid Groq API key typically starts with "gsk_". Please verify your key.');
      return;
    }
    setError('');
    saveKey(inputVal.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Ambient glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-float-reverse" />
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={dismissModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <KeyRound className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Connect Groq API Key</h3>
            <p className="text-xs text-slate-400">Bring Your Own Key (BYOK) for AI features</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          To enable voice transcription and <strong className="text-emerald-400">ExpenseTracker AI</strong>, provide your free personal Groq API key. Your key is stored strictly on your device in your browser's <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">localStorage</code> and is never shared across users.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Groq API Key
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Stored locally per user
            </span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Get free key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={dismissModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save & Enable AI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
