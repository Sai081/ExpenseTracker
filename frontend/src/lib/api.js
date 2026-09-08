// Dynamic API Base URL resolution supporting environment variable and local override
export function getApiBaseUrl() {
  const custom = localStorage.getItem('custom_backend_api_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  return (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
}

export function setCustomApiBaseUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('custom_backend_api_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('custom_backend_api_url');
  }
}

// Current active user ID holder for API header injection
let _activeUserId = null;

export function setActiveUserId(userId) {
  _activeUserId = userId;
}

export function getStoredGroqKey(userId = _activeUserId) {
  // 1. Check user-specific key
  if (userId) {
    const userKey = localStorage.getItem(`byok_groq_key_${userId}`);
    if (userKey && userKey.trim()) return userKey.trim();
  }

  // 2. Check general byok_groq_key
  const globalKey = localStorage.getItem('byok_groq_key');
  if (globalKey && globalKey.trim()) return globalKey.trim();

  // 3. Check any matching byok_groq_key in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('byok_groq_key')) {
        const val = localStorage.getItem(k);
        if (val && val.trim()) return val.trim();
      }
    }
  } catch (e) {}

  return '';
}

export function setStoredGroqKey(userId = _activeUserId, key) {
  const trimmed = key ? key.trim() : '';
  if (userId) {
    if (trimmed) {
      localStorage.setItem(`byok_groq_key_${userId}`, trimmed);
    } else {
      localStorage.removeItem(`byok_groq_key_${userId}`);
    }
  }
  // Also sync to global byok_groq_key so requests never lose the key
  if (trimmed) {
    localStorage.setItem('byok_groq_key', trimmed);
  } else {
    localStorage.removeItem('byok_groq_key');
  }
}

export function isBYOKPromptDismissed(userId = _activeUserId) {
  if (!userId) return false;
  return localStorage.getItem(`byok_dismissed_${userId}`) === 'true';
}

export function setBYOKPromptDismissed(userId = _activeUserId) {
  if (!userId) return;
  localStorage.setItem(`byok_dismissed_${userId}`, 'true');
}

export function getStoredCurrency() {
  return localStorage.getItem('expense_tracker_currency') || 'INR';
}

export function getStoredCurrencySymbol() {
  const code = getStoredCurrency();
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', AED: 'AED' };
  return map[code] || '₹';
}

export function getStoredAuthToken() {
  return localStorage.getItem('supabase_auth_token') || '';
}

export function setStoredAuthToken(token) {
  if (token) {
    localStorage.setItem('supabase_auth_token', token);
  } else {
    localStorage.removeItem('supabase_auth_token');
  }
}

async function request(endpoint, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const authToken = getStoredAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const groqKey = getStoredGroqKey();
  if (groqKey) {
    headers['X-Groq-Api-Key'] = groqKey;
  }

  const currCode = getStoredCurrency();
  if (currCode) headers['X-Currency'] = currCode;

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  const res = await fetch(url, config);
  const contentType = res.headers.get('content-type') || '';
  let json = {};
  if (contentType.includes('application/json')) {
    json = await res.json().catch(() => ({}));
  } else {
    const text = await res.text().catch(() => '');
    if (text.includes('<!doctype html>') || text.includes('<html')) {
      throw new Error(
        `Backend API returned an HTML page instead of JSON from: ${url}. Please ensure your backend server is deployed and running, and VITE_API_BASE_URL (or the custom backend URL in Settings) points to your live API.`
      );
    }
  }

  if (!res.ok || json.success === false) {
    const errorMsg = json.error || json.message || `Request failed (${res.status})`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Connection Health Check
  checkHealth: async (customUrl = null) => {
    const base = customUrl ? customUrl.trim().replace(/\/+$/, '') : getApiBaseUrl();
    const candidateUrls = [
      `${base}/health`,
      `${base}/api/health`,
      base.endsWith('/api') ? `${base.replace(/\/api$/, '')}/health` : null
    ].filter(Boolean);

    for (const testUrl of candidateUrls) {
      try {
        const res = await fetch(testUrl, { method: 'GET' });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json().catch(() => ({}));
          return { ok: true, data: json, url: testUrl };
        }
      } catch (e) {}
    }
    return { ok: false, error: `Could not reach backend API at: ${base}` };
  },

  // Auth & Profile
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (email, password, username) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username })
  }),
  googleLogin: (data) => request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  demoLogin: () => request('/auth/demo', { method: 'POST' }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  changePassword: (data) => request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),

  // Dashboard
  getDashboardSummary: (month) => request(`/dashboard/summary${month ? `?month=${encodeURIComponent(month)}` : ''}`),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/transactions?${query.toString()}`);
  },
  getTransaction: (id) => request(`/transactions/${id}`),
  createTransaction: (data) => request('/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTransaction: (id, data) => request(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTransaction: (id) => request(`/transactions/${id}`, {
    method: 'DELETE'
  }),

  // Budgets & Categories
  getBudgets: (month) => request(`/budgets${month ? `?month=${month}` : ''}`),
  createBudget: (data) => request('/budgets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateBudget: (id, data) => request(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteBudget: (id) => request(`/budgets/${id}`, {
    method: 'DELETE'
  }),
  getCategories: (type) => request(`/categories${type ? `?type=${type}` : ''}`),
  createCategory: (data) => request('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // AI & Voice
  getInsights: (month) => request(`/ai/insights${month ? `?month=${month}` : ''}`),
  getYearlyInsights: () => request('/ai/insights/yearly'),
  generateInsights: (month) => request('/ai/insights/generate', {
    method: 'POST',
    body: JSON.stringify({ month })
  }),
  parseVoice: (text) => request('/ai/voice-parse', {
    method: 'POST',
    body: JSON.stringify({ text })
  }),
  transcribeAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    const base = getApiBaseUrl();
    const url = `${base}/ai/transcribe`;
    const headers = {};
    const authToken = getStoredAuthToken();
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const groqKey = getStoredGroqKey();
    if (groqKey) headers['X-Groq-Api-Key'] = groqKey;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Audio transcription failed');
    }
    return json.data?.text || '';
  },
  chat: (message, history = [], context = null) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history, context })
  })
};
