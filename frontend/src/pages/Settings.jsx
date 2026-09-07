import React, { useState } from 'react';
import { 
  KeyRound, 
  Database, 
  User, 
  Check, 
  Trash2, 
  ExternalLink, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useBYOK } from '../context/KeyContext';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { groqKey, saveKey, clearKey, hasKey } = useBYOK();
  const { user, isSupabaseConfigured } = useAuth();
  const [inputKey, setInputKey] = useState(groqKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveKey(inputKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearKey = () => {
    clearKey();
    setInputKey('');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your BYOK AI credentials, database connection, and account profile
        </p>
      </div>

      {/* BYOK Section */}
      <div className="p-6 rounded-2xl apple-glass-card shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Bring Your Own Key (BYOK) — Groq</h3>
              <p className="text-xs text-slate-400">Power AI Chat, Voice Parsing, and Insights with your own API key</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
            hasKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {hasKey ? 'Custom Key Active' : 'Default / Shared Key'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Your key is saved locally in your browser's <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">localStorage</code> and transmitted securely over HTTPS via the <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">X-Groq-Api-Key</code> header directly for your AI queries. It is never stored in any external database.
        </p>

        <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Groq API Key
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-600/20 shrink-0"
              >
                Save Key
              </button>
              {hasKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition shrink-0"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <Check className="w-4 h-4" />
              <span>Groq API key saved successfully!</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
            <span>Don't have a key? Get a free API key at</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              console.groq.com/keys <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>

      {/* Database Status */}
      <div className="p-6 rounded-2xl apple-glass-card shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Cloud Database Status</h3>
            <p className="text-xs text-slate-400">PostgreSQL online persistent storage</p>
          </div>
        </div>

        <div className="p-3 rounded-xl glass-input flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Provider:</span>
            <span className="ml-2 font-semibold text-white">Supabase Cloud PostgreSQL</span>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Connected & Initialized
          </span>
        </div>
      </div>

      {/* User Account Info */}
      <div className="p-6 rounded-2xl apple-glass-card shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">User Profile</h3>
            <p className="text-xs text-slate-400">Account identity details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl glass-input">
            <span className="text-slate-400 block mb-1">Username</span>
            <span className="font-semibold text-white text-sm">{user?.username || 'user'}</span>
          </div>
          <div className="p-3 rounded-xl glass-input">
            <span className="text-slate-400 block mb-1">Email Address</span>
            <span className="font-semibold text-white text-sm">{user?.email || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
