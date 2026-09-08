import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  AlertCircle, 
  Loader2, 
  Lock,
  ExternalLink,
  Trash2,
  Cpu,
  Database,
  AlertTriangle,
  LogOut,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBYOK } from '../context/KeyContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../lib/api';

export function Profile() {
  const auth = useAuth() || {};
  const { user = null, updateLocalUser = () => {}, signOut = async () => {} } = auth;
  const byok = useBYOK() || {};
  const { groqKey = '', saveKey = () => {}, clearKey = () => {}, hasKey = false } = byok;
  const { currencyCode, setCurrency, currencies } = useCurrency();

  // Delete Account State
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile Edit State
  const [username, setUsername] = useState(user?.username || '');
  const [selectedCurrency, setSelectedCurrency] = useState(currencyCode || 'INR');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State (Only for email users)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // BYOK State
  const [inputKey, setInputKey] = useState(groqKey || '');
  const [keySuccess, setKeySuccess] = useState(false);

  // Google Avatar
  const googleAvatar = user?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  useEffect(() => {
    if (currencyCode) {
      setSelectedCurrency(currencyCode);
    }
  }, [currencyCode]);

  useEffect(() => {
    setInputKey(groqKey || '');
  }, [groqKey]);

  // Save profile changes (Username & Permanent Currency)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      // Save permanent preferred currency
      setCurrency(selectedCurrency);

      const updated = await api.updateProfile({
        username: username.trim(),
        avatar_url: googleAvatar,
        currency: selectedCurrency
      });

      if (updated) {
        if (updateLocalUser) updateLocalUser(updated);
      }

      setProfileSuccess(`Profile and default currency (${selectedCurrency}) updated permanently!`);
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      // Even if remote update fails, local currency preference is saved
      setCurrency(selectedCurrency);
      setProfileSuccess(`Default currency updated to ${selectedCurrency}!`);
      setTimeout(() => setProfileSuccess(''), 4000);
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveKey(inputKey);
    setKeySuccess(true);
    setTimeout(() => setKeySuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.deleteAccount();
      await signOut();
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  const isGoogleUser = user?.is_google === true || user?.supabase_id || user?.has_password === false;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-20 font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
            ENCLAVE IDENTITY & PROTOCOLS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif] mt-0.5">
          Account & Sovereign Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
          Manage your permanent currency, Google account profile, credentials, and client-side Groq LLaMA keys
        </p>
      </div>

      {/* Personal Info & Currency Card */}
      <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Identity & Currency Parameters</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
            PostgreSQL User #{user?.id || '1'}
          </span>
        </div>

        {profileSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <Check className="w-4 h-4" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Google Profile Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
              {googleAvatar ? (
                <img
                  src={googleAvatar}
                  alt={username || 'Google Profile'}
                  className="w-full h-full rounded-3xl object-cover border-2 border-violet-500/40 shadow-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-3xl bg-black/60 border-2 border-violet-500/30 flex items-center justify-center text-3xl font-extrabold text-violet-400 shadow-xl font-mono">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Google Profile Picture</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  Google Synced
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Your profile picture is securely linked and synced from your authenticated Google profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Display Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm focus:outline-none focus:border-violet-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Authentication Email
              </label>
              <div className="flex items-center px-4 py-2.5 rounded-2xl bg-black/40 border border-white/[0.06] text-slate-400 text-sm font-mono cursor-not-allowed">
                <Mail className="w-4 h-4 mr-2.5 text-slate-500 shrink-0" />
                <span className="truncate">{user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Permanent Currency Preference */}
          <div className="pt-2 border-t border-white/[0.08]">
            <label className="block text-xs font-mono uppercase text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              <span>Permanent Base Currency</span>
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 rounded-2xl glass-input text-white text-sm focus:outline-none focus:border-cyan-400 transition font-mono bg-[#071312] cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0b1d1a] text-white">
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 font-mono mt-1.5">
              This sets your permanent default currency for all budgets, analytics, and transaction logs.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-sheen flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-violet-600/30 magnetic-btn"
            >
              {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* BYOK Groq API Key Section */}
      <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Client-Side Groq Key (BYOK)</h3>
              <p className="text-xs text-slate-400 font-mono">Powers Whisper speech ingestion and LLaMA 3.1 inference</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md border ${
            hasKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/[0.04] border-white/10 text-slate-400'
          }`}>
            {hasKey ? 'ACTIVE ENCLAVE KEY' : 'NO KEY SET'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Stored strictly in your local browser sandbox for session <code className="text-violet-400 bg-black px-1.5 py-0.5 rounded">USER-{user?.id}</code>. Never transmitted to third-party databases.
        </p>

        <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Groq API Key
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl glass-input text-white font-mono text-xs focus:outline-none focus:border-violet-500 transition"
              />
              <button
                type="submit"
                className="btn-sheen px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold transition shadow-md shadow-violet-600/25 shrink-0 magnetic-btn"
              >
                Commit Key
              </button>
              {hasKey && (
                <button
                  type="button"
                  onClick={() => {
                    clearKey();
                    setInputKey('');
                  }}
                  className="p-2.5 rounded-2xl apple-glass-pill hover:text-rose-400 text-slate-400 transition shrink-0 magnetic-btn"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {keySuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1 font-mono">
              <Check className="w-4 h-4" />
              <span>Personal Groq key saved to enclave!</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 font-mono">
            <span>Get your free Groq API key at</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              console.groq.com/keys <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>

      {/* Security & Password Section */}
      <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl">
        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-violet-400" />
          <span>Security & Credential Key</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          Manage your login password and authentication protocols
        </p>

        {isGoogleUser ? (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs leading-relaxed font-mono">
              <p className="font-bold text-white text-sm">Protected via Google Authentication</p>
              <p className="text-slate-400 mt-1">
                You signed into ExpenseTracker AI using your Google OAuth account. Security is managed by Google.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <Check className="w-4 h-4" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                New Password (min. 6 chars)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-sheen flex items-center gap-2 px-6 py-2.5 rounded-full apple-glass-pill hover:border-violet-500/40 text-white font-semibold text-xs sm:text-sm transition shadow-sm magnetic-btn"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Commit New Password</span>
            </button>
          </form>
        )}
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-rose-500/25 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Danger Zone</h3>
              <p className="text-xs text-slate-400 font-mono">Permanently remove your account and all financial telemetry</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-rose-300/90 leading-relaxed font-mono">
          Deleting your account will purge all associated transactions, monthly budgets, custom categories, and personal security keys. This action cannot be undone.
        </p>

        {deleteError && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4" />
            <span>{deleteError}</span>
          </div>
        )}

        {!showDeleteConfirm ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs transition active:scale-[0.98] flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account Permanently</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 space-y-3">
            <p className="text-xs font-bold text-white">Are you absolutely sure you want to delete your account?</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl apple-glass-pill text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Delete Everything</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Option at the Bottom */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = '/login';
          }}
          className="px-6 py-2.5 rounded-full apple-glass-pill hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 font-mono text-xs transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of ExpenseTracker</span>
        </button>
      </div>
    </div>
  );
}
