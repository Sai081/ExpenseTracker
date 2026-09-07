import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History,
  PieChart,
  Sparkles, 
  LogOut, 
  Plus,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Brand Logo Component with Telemetry Glow
export function BrandLogo({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="appleGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4"/>
          <stop offset="50%" stopColor="#2DD4BF"/>
          <stop offset="100%" stopColor="#FBBF24"/>
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="8" y="8" width="84" height="84" rx="24" fill="#0B211D" stroke="rgba(94, 234, 212, 0.4)" strokeWidth="2"/>
      <rect x="18" y="28" width="64" height="44" rx="14" fill="url(#appleGradLogo)" opacity="0.9" filter="url(#logoGlow)"/>
      <rect x="22" y="32" width="56" height="36" rx="10" fill="#061512" fillOpacity="0.85"/>
      <circle cx="58" cy="50" r="7" fill="url(#appleGradLogo)"/>
      <circle cx="58" cy="50" r="3" fill="#FFFFFF"/>
      <path d="M30 42H44M30 50H38M30 58H48" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function Navbar({ onOpenAddModal }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: History },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/insights', label: 'Insights', icon: Sparkles },
  ];

  return (
    <header
      className={`sticky top-0 z-50 isolate w-full apple-glass transition-shadow duration-300 ${
        isScrolled
          ? 'border-b border-white/[0.08] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.7)]'
          : 'border-b border-white/[0.06]'
      }`}
    >
      {/* Top Hairline Accent Line (telemetry neon glow effect) */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10 pointer-events-none" />
      <div
        className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none transition-opacity duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative p-1 rounded-2xl bg-white/[0.03] border border-white/[0.1] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <BrandLogo className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight font-display">
              Expense<span className="text-slate-400">Tracker</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-cyan-500/10 text-cyan-200 border border-cyan-400/25 uppercase tracking-widest font-mono">
                  AI
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">Personal finance, made clear</span>
            </div>
          </NavLink>

          {/* Telemetry Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full apple-glass-pill text-[10px] font-mono text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Workspace synced</span>
          </div>

          {/* Navigation Pill Container */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            {navItems.map((item) => {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-white/[0.09] text-white border border-white/15 shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Add, Profile & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Action */}
          <button
            onClick={onOpenAddModal}
            className="p-2 rounded-full apple-glass-pill text-slate-300 hover:text-white hover:border-white/25 transition-all magnetic-btn"
            title="Add Transaction Manually"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* User Profile Avatar Link */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 p-1.5 rounded-full transition-all ${
                    isActive 
                      ? 'bg-white/[0.09] text-white border border-white/15 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`
                }
                title="View Profile & Settings"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username || 'User'}
                    className="w-8 h-8 rounded-full border border-white/15 object-cover shadow-sm"
                  />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-white/[0.12] border border-white/15 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </NavLink>

              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-full hover:bg-white/[0.06] transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-around gap-1 px-3 pb-2 pt-1 border-t border-white/[0.06]" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition ${isActive ? 'text-cyan-200' : 'text-slate-500'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
