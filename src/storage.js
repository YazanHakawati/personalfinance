const KEYS = {
  income: 'pf_income',
  expenses: 'pf_expenses',
  loans: 'pf_loans',
  settings: 'pf_settings'
};

const DEFAULT_SETTINGS = {
  currency: '$',
  budget: { housing: 30, savings: 10, loans: 20, living: 40 }
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(KEYS[key], JSON.stringify(value));
}

export function loadAll() {
  return {
    income: load('income', []),
    expenses: load('expenses', []),
    loans: load('loans', []),
    settings: { ...DEFAULT_SETTINGS, ...load('settings', {}) }
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
