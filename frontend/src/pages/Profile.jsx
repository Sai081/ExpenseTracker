import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2, 
  Camera,
  Lock,
  ExternalLink,
  Trash2,
  Cpu,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBYOK } from '../context/KeyContext';
import { api } from '../lib/api';

export function Profile() {
  const { user, updateLocalUser } = useAuth();
  const { groqKey, saveKey, clearKey, hasKey } = useBYOK();

  // Profile Edit State
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
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

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  useEffect(() => {
    setInputKey(groqKey || '');
  }, [groqKey]);

  // Handle avatar file upload
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose a valid image file (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
      setProfileError('');
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes (Username & Avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const updated = await api.updateProfile({
        username: username.trim(),
        avatar_url: avatarUrl
      });
      if (updated) {
        if (updated.avatar_url) setAvatarUrl(updated.avatar_url);
        if (updateLocalUser) updateLocalUser(updated);
      }
      setProfileSuccess('Profile picture and details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
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
          Manage your telemetry profile, avatar, credentials, and client-side Groq LLaMA keys
        </p>
      </div>

      {/* Personal Info & Avatar Card */}
      <div className="p-6 sm:p-8 rounded-3xl apple-glass-card border border-white/[0.08] shadow-xl relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Identity Parameters</span>
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
            {/* Avatar Preview */}
            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username || 'Profile'}
                  className="w-full h-full rounded-3xl object-cover border-2 border-violet-500/40 shadow-xl"
                />
              ) : (
                <div className="w-full h-full rounded-3xl bg-black/60 border-2 border-violet-500/30 flex items-center justify-center text-3xl font-extrabold text-violet-400 shadow-xl font-mono">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 rounded-3xl bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white text-xs gap-1 backdrop-blur-xs font-semibold"
              >
                <Camera className="w-5 h-5" />
                <span>Upload</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2 flex-1">
              <label 
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl apple-glass-pill text-xs font-semibold text-white cursor-pointer hover:border-violet-500/40 transition shadow-sm magnetic-btn"
              >
                <Upload className="w-3.5 h-3.5 text-violet-400" />
                <span>Upload Device Image</span>
              </label>
              <p className="text-xs text-slate-400 font-mono">
                Click preview or button to upload your picture (PNG, JPG, WebP max 2MB).
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
    </div>
  );
}
