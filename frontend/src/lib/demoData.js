export const demoDashboardData = {
  selected_month_name: 'May 2025',
  summary: {
    monthly_income: 85000,
    monthly_expenses: 34250,
    net_savings: 50750,
    today_expenses: 1141.66,
    today_count: 3,
    budget_usage_percent: 68,
    total_spent: 34250,
    total_budget: 50500,
  },
  budgets: [
    { id: 'demo-food', category_name: 'Food & Dining', amount: 15000, usage_percent: 68 },
    { id: 'demo-home', category_name: 'Housing & Rent', amount: 20000, usage_percent: 92 },
    { id: 'demo-cloud', category_name: 'Cloud & Hardware', amount: 12500, usage_percent: 45 },
  ],
  category_breakdown: [
    { category: 'Housing & Rent', amount: 18400 },
    { category: 'Food & Dining', amount: 10200 },
    { category: 'Transport', amount: 3250 },
    { category: 'Subscriptions', amount: 2400 },
  ],
  recent_transactions: [
    { id: 'demo-1', type: 'income', amount: 85000, description: 'Consulting credit', category: 'Professional income', payment_method: 'NEFT', date: '2025-05-12' },
    { id: 'demo-2', type: 'expense', amount: 1450, description: 'Household groceries', category: 'Food & Dining', payment_method: 'Visa', date: '2025-05-12' },
    { id: 'demo-3', type: 'expense', amount: 450, description: 'Lunch with team', category: 'Food & Dining', payment_method: 'UPI', date: '2025-05-12' },
    { id: 'demo-4', type: 'expense', amount: 2100, description: 'Monthly software stack', category: 'Subscriptions', payment_method: 'Card', date: '2025-05-11' },
    { id: 'demo-5', type: 'expense', amount: 980, description: 'Airport transfer', category: 'Transport', payment_method: 'UPI', date: '2025-05-10' },
  ],
};

export const demoVoiceHistory = [
  { id: 'voice-1', transcript: 'Spent 450 rupees for lunch with team via UPI', category: 'Food & Dining', status: 'Categorized', time: '3 min ago' },
  { id: 'voice-2', transcript: 'Paid 1,450 groceries on Visa card', category: 'Household', status: 'Categorized', time: '2 hours ago' },
  { id: 'voice-3', transcript: 'Received 85,000 consulting credit via NEFT', category: 'Professional income', status: 'Matched', time: 'Today, 10:15' },
];
