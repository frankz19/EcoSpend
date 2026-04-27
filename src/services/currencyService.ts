import { Currency } from './accountService';
import * as SecureStore from 'expo-secure-store';

const RATES_KEY = 'eco_global_rates';

export interface ExchangeRate {
  rate: number;
  fetchedAt: string;
}

let _globalRates: Record<string, number> = {
  'VES': 1,
  'COP': 1,
  'EUR': 1
};

export const CurrencyService = {
  async loadRates(): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync(RATES_KEY);
      if (stored) {
        _globalRates = { ..._globalRates, ...JSON.parse(stored) };
      }
    } catch (error) {
    }
  },

  getRate(currency: string): number {
    return _globalRates[currency] || 1;
  },

  async setRate(currency: string, rate: number): Promise<void> {
    _globalRates[currency] = rate;
    try {
      await SecureStore.setItemAsync(RATES_KEY, JSON.stringify(_globalRates));
    } catch (error) {
    }
  },

  convert(amount: number, from: Currency, to: Currency, historicalRate?: number): number {
    if (from === to) return amount;
    
    if (from !== 'USD' && to === 'USD') {
        const rate = historicalRate || this.getRate(from);
        return parseFloat((amount / rate).toFixed(2));
    }

    if (from === 'USD' && to !== 'USD') {
        const rate = this.getRate(to);
        return parseFloat((amount * rate).toFixed(2));
    }

    return amount;
  },

  normalizeAmounts(entries: { amount: number; currency: Currency }[], targetCurrency: Currency): number {
    return entries.reduce((sum, e) => {
      const converted = this.convert(e.amount, e.currency, targetCurrency);
      return sum + converted;
    }, 0);
  },

  symbol(currency: Currency): string {
    const symbols: Record<string, string> = {
        'USD': '$',
        'VES': 'Bs.',
        'COP': 'COP$',
        'EUR': '€'
    };
    return symbols[currency] || '$';
  }
};