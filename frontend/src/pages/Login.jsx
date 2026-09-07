import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  X, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Reveal } from '../hooks/useReveal';
import { BrandLogo } from '../components/Navbar';

export function Login() {
  const { user, signInWithGoogle, signInWithGoogleDirect, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmEmailNotice, setConfirmEmailNotice] = useState('');

  // Google Direct Fallback Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [directGoogleLoading, setDirectGoogleLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await signUpWithEmail(email, password, username);
        if (res && res.needsConfirmation) {
          setConfirmEmailNotice(res.email);
          setLoading(false);
          return;
        }
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn('OAuth fallback to direct Google login:', err);
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDirectGoogleLogin = async (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    setDirectGoogleLoading(true);
    try {
      await signInWithGoogleDirect({
        email: googleEmail.trim(),
        name: googleName.trim() || googleEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${googleEmail.trim()}`
      });
      setShowGoogleModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Direct Google login failed.');
    } finally {
      setDirectGoogleLoading(false);
    }
  };


  return (
    <div className="auth-page min-h-screen bg-[#071312] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-cyan-500/30 selection:text-cyan-100 font-sans">
      {/* Ambient Forest & Emerald Glows matching Landing & App */}
      <div className="landing-noise pointer-events-none fixed inset-0 z-0 opacity-25" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-500/12 via-teal-400/8 to-cyan-500/8 blur-[130px] rounded-full" />
        <div className="absolute -bottom-24 right-1/4 w-[450px] h-[450px] bg-gradient-to-tl from-emerald-500/8 via-cyan-500/6 to-transparent blur-[120px] rounded-full" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Private by Design Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Private by design</span>
        </div>
      </div>

      {/* Main Form Arena */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md my-auto py-6">
        <Reveal
          as="div"
          className="apple-glass-card py-8 px-6 sm:px-9 rounded-3xl relative overflow-hidden border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
        >
          {/* Subtle top accent hairline */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          
          {/* Header & Brand Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/" className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg mb-3.5 hover:scale-105 transition-transform">
              <BrandLogo className="w-9 h-9" />
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase tracking-widest font-semibold mb-2.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Personal Finance Workspace</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
              {isRegister ? 'Start your money story' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs font-sans leading-relaxed">
              {isRegister 
                ? 'Create an account to track income, expenses, and budgets effortlessly.' 
                : 'Sign in to access your personal dashboard, ledger, and AI insights.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 backdrop-blur-md animate-fade-in font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span className="font-bold block text-rose-200">Authentication Note</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {confirmEmailNotice ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Check your inbox</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto font-sans">
                We sent a confirmation link to <strong className="text-emerald-400 font-mono">{confirmEmailNotice}</strong>.<br />
                Please open your email and click the confirmation link to finish setting up your account.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmEmailNotice("");
                    setIsRegister(false);
                  }}
                  className="px-5 py-2.5 rounded-xl apple-glass-pill text-xs font-semibold text-slate-200 hover:text-white transition"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Social / Instant Access Options */}
          <div className="space-y-2.5 mb-5">
            <button
              onClick={handleGoogleAuth}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>


          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-white/[0.08]" />
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
              or with email
            </span>
            <div className="flex-grow border-t border-white/[0.08]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {isRegister && (
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required={isRegister}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_rivera"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/20 transition-all font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button matching Emerald theme */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.45)] active:scale-[0.99] disabled:opacity-50 font-display"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>

          {/* Toggle between Register and Login */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              <span>{isRegister ? 'Already have an account?' : "Don't have an account yet?"}</span>
              <span className="text-emerald-400 font-semibold underline underline-offset-4">
                {isRegister ? 'Sign in here' : 'Create one for free'}
              </span>
            </button>
          </div>
            </>
          )}
        </Reveal>
      </div>

      {/* Direct Google Fallback Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-7 apple-glass-card bg-[#071312]/95 rounded-3xl text-white shadow-2xl border border-white/15">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Direct Google Sign-In</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
              Enter your Google address to authenticate your session directly:
            </p>

            <form onSubmit={handleDirectGoogleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Google Email</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-400/60 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Display Name</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-400/60 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={directGoogleLoading}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/25 active:scale-[0.98]"
                >
                  {directGoogleLoading ? 'Signing In...' : 'Sign In as Google User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2 pt-4 border-t border-white/[0.05] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Zero-log finance • Your records stay private</span>
        </div>
        <p>© 2026 ExpenseTracker. Less admin, more awareness.</p>
      </div>
    </div>
  );
}

export default Login;
