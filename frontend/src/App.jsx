import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KeyProvider } from './context/KeyContext';
import { DemoWorkspaceProvider } from './context/DemoWorkspaceContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { AddTransactionModal } from './components/AddTransactionModal';
import { VoiceModal } from './components/VoiceModal';
import { AssistantWidget } from './components/AssistantWidget';
import { BYOKModal } from './components/BYOKModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CustomCursor } from './components/CustomCursor';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import { Docs } from './pages/Docs';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Insights } from './pages/Insights';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';

function AppLayout() {
  const auth = useAuth() || {};
  const { user = null } = auth;
  const location = useLocation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  // Standalone marketing and sign-in routes that render their own headers and full-bleed layout
  const isStandaloneView = location.pathname === '/landing' || location.pathname === '/login' || (!user && location.pathname === '/');

  return (
    <div className="min-h-screen bg-[#071312] text-slate-100 flex flex-col relative font-sans">
      {/* Custom Cybernetic Cursor Tracking Halo */}
      <CustomCursor />

      {/* Continuous ambient aurora field */}
      <div className="ambient-field">
        <div className="ambient-orb animate-drift-a w-[620px] h-[620px] -top-56 -left-40 bg-gradient-to-tr from-cyan-500/12 via-emerald-400/8 to-transparent" />
        <div className="ambient-orb animate-drift-b w-[560px] h-[560px] top-1/3 -right-52 bg-gradient-to-bl from-amber-400/8 via-cyan-500/8 to-transparent" />
        <div className="ambient-orb animate-drift-c w-[520px] h-[520px] -bottom-48 left-1/4 bg-gradient-to-tr from-emerald-500/8 via-cyan-500/6 to-transparent" />
      </div>

      {user && !isStandaloneView && (
        <Navbar onOpenAddModal={() => setIsAddOpen(true)} />
      )}

      <main className={`relative z-10 ${isStandaloneView ? "flex-1 w-full" : "flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-18 pb-28 sm:pt-24 sm:pb-8"}`}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard key={refreshKey} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions key={refreshKey} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets key={refreshKey} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {user && !isStandaloneView && (
        <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-white/[0.06] flex items-center justify-center text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ExpenseTracker AI • Sovereign Ledger</span>
          </div>
        </footer>
      )}

      {/* Global Modals & Floating Assistant */}
      {user && (
        <>
          <AddTransactionModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onTransactionCreated={handleTransactionCreated}
          />

          <VoiceModal
            isOpen={isVoiceOpen}
            onClose={() => setIsVoiceOpen(false)}
            onTransactionCreated={handleTransactionCreated}
          />

          {/* Initial BYOK Prompt Modal */}
          <BYOKModal />

          {/* Floating ExpenseTracker AI Assistant Widget */}
          <AssistantWidget onTransactionCreated={handleTransactionCreated} />
        </>
      )}

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoWorkspaceProvider>
          <KeyProvider>
            <CurrencyProvider>
              <ErrorBoundary><AppLayout /></ErrorBoundary>
            </CurrencyProvider>
          </KeyProvider>
        </DemoWorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
