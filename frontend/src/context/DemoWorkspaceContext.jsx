import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { demoDashboardData, demoVoiceHistory } from '../lib/demoData';

const DemoWorkspaceContext = createContext(null);

function cloneDemoTransactions() {
  return demoDashboardData.recent_transactions.map((transaction) => ({ ...transaction }));
}

function cloneDemoBudgets() {
  return demoDashboardData.budgets.map((budget) => ({ ...budget }));
}

export function DemoWorkspaceProvider({ children }) {
  const { user } = useAuth();
  const isDemo = user?.id === 2 || user?.email === 'demo@expensetracker.local';
  const [transactions, setTransactions] = useState(cloneDemoTransactions);
  const [budgets, setBudgets] = useState(cloneDemoBudgets);

  useEffect(() => {
    if (isDemo) {
      setTransactions(cloneDemoTransactions());
      setBudgets(cloneDemoBudgets());
    }
  }, [isDemo]);

  const value = useMemo(() => ({
    isDemo,
    transactions,
    budgets,
    voiceHistory: demoVoiceHistory,
    dashboard: {
      ...demoDashboardData,
      transactions,
      recent_transactions: transactions,
      budgets,
    },
    removeTransaction: (id) => setTransactions((current) => current.filter((transaction) => transaction.id !== id)),
    updateTransaction: (id, changes) => setTransactions((current) => current.map((transaction) => (
      transaction.id === id ? { ...transaction, ...changes } : transaction
    ))),
    addBudget: (budget) => setBudgets((current) => [...current, budget]),
    updateBudget: (id, changes) => setBudgets((current) => current.map((budget) => (
      budget.id === id ? { ...budget, ...changes } : budget
    ))),
    removeBudget: (id) => setBudgets((current) => current.filter((budget) => budget.id !== id)),
  }), [budgets, isDemo, transactions]);

  return <DemoWorkspaceContext.Provider value={value}>{children}</DemoWorkspaceContext.Provider>;
}

export function useDemoWorkspace() {
  const context = useContext(DemoWorkspaceContext);
  if (!context) {
    return {
      isDemo: false,
      transactions: [],
      budgets: [],
      voiceHistory: [],
      dashboard: {
        summary: {},
        recent_transactions: [],
        budgets: [],
        category_breakdown: []
      },
      removeTransaction: () => {},
      updateTransaction: () => {},
      addBudget: () => {},
      updateBudget: () => {},
      removeBudget: () => {},
    };
  }
  return context;
}
