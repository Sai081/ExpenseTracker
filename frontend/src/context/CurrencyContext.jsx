import React, { createContext, useContext, useState } from 'react';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' }
];

export const EXCHANGE_RATES_TO_USD = {
  USD: 1.0,
  INR: 87.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 152.0,
  CAD: 1.38,
  AUD: 1.52,
  AED: 3.67
};

export const CURRENCY_ALIASES = {
  rupee: 'INR', rupees: 'INR', rs: 'INR', inr: 'INR', '₹': 'INR',
  dollar: 'USD', dollars: 'USD', usd: 'USD', '$': 'USD', bucks: 'USD',
  euro: 'EUR', euros: 'EUR', eur: 'EUR', '€': 'EUR',
  pound: 'GBP', pounds: 'GBP', gbp: 'GBP', '£': 'GBP',
  yen: 'JPY', jpy: 'JPY', '¥': 'JPY',
  dirham: 'AED', dirhams: 'AED', aed: 'AED',
  cad: 'CAD', aud: 'AUD'
};

export function convertAmount(amount, fromCode, toCode) {
  const from = (fromCode || 'USD').toUpperCase();
  const to = (toCode || 'USD').toUpperCase();
  if (from === to) return Number(amount) || 0;
  const rateFrom = EXCHANGE_RATES_TO_USD[from] || 1.0;
  const rateTo = EXCHANGE_RATES_TO_USD[to] || 1.0;
  const inUSD = Number(amount) / rateFrom;
  return Number((inUSD * rateTo).toFixed(2));
}

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('expense_tracker_currency') || 'INR';
  });

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const updateCurrency = (code) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyCode(found.code);
      localStorage.setItem('expense_tracker_currency', found.code);
    }
  };

  const formatAmount = (val, options = {}) => {
    const num = Number(val) || 0;
    const formattedNum = num.toLocaleString('en-US', {
      minimumFractionDigits: options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 2,
      maximumFractionDigits: options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2
    });
    return `${currency.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyCode: currency.code,
        currencies: CURRENCIES,
        setCurrency: updateCurrency,
        formatAmount,
        convertAmount: (amt, from, to = currency.code) => convertAmount(amt, from, to),
        exchangeRates: EXCHANGE_RATES_TO_USD
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: CURRENCIES[0],
      currencyCode: 'INR',
      currencies: CURRENCIES,
      setCurrency: () => {},
      formatAmount: (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      convertAmount: (amt, from, to = 'INR') => convertAmount(amt, from, to),
      exchangeRates: EXCHANGE_RATES_TO_USD
    };
  }
  return context;
}
