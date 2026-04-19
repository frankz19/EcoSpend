import { Currency } from './accountService';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ExchangeRateSource = 'manual' | 'bcv' | 'paralelo';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;          // cuántas unidades de `to` equivalen a 1 unidad de `from`
  source: ExchangeRateSource;
  fetchedAt: string;     // ISO timestamp
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: Currency;
  convertedAmount: number;
  targetCurrency: Currency;
  rateUsed: number;
  source: ExchangeRateSource;
}

// ---------------------------------------------------------------------------
// Tasa en memoria (fallback manual)
// ---------------------------------------------------------------------------

let _currentRate: ExchangeRate = {
  from: 'USD',
  to: 'VES',
  rate: 1,               // valor 1 como placeholder — debe actualizarse antes de usar
  source: 'manual',
  fetchedAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Gestión de tasas
// ---------------------------------------------------------------------------

export const CurrencyService = {

  /** Devuelve la tasa activa en memoria (USD → VES). */
  getCurrentRate(): ExchangeRate {
    return { ..._currentRate };
  },

  /** Establece una tasa manualmente (ej. el usuario ingresa el valor del día). */
  setManualRate(usdToVes: number): ExchangeRate {
    _currentRate = {
      from: 'USD',
      to: 'VES',
      rate: usdToVes,
      source: 'manual',
      fetchedAt: new Date().toISOString(),
    };
    return { ..._currentRate };
  },

  /**
   * PENDIENTE — Obtener tasa oficial del BCV (Banco Central de Venezuela).
   * Endpoint sugerido: https://ve.dolarapi.com/v1/dolares/oficial
   */
  async fetchBCVRate(): Promise<ExchangeRate | null> {
    // TODO: implementar fetch al endpoint del BCV o servicio intermediario
    return null;
  },

  /**
   * PENDIENTE — Obtener tasa del dólar paralelo/monitor dólar.
   * Endpoint sugerido: https://ve.dolarapi.com/v1/dolares/paralelo
   */
  async fetchParaleloRate(): Promise<ExchangeRate | null> {
    // TODO: implementar fetch a endpoint de tasa paralela
    return null;
  },

  // ---------------------------------------------------------------------------
  // Conversión
  // ---------------------------------------------------------------------------

  /**
   * Convierte un monto entre dos monedas usando la tasa en memoria.
   * Si from === to devuelve el monto sin cambios.
   */
  convert(amount: number, from: Currency, to: Currency): ConversionResult {
    if (from === to) {
      return {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount: amount,
        targetCurrency: to,
        rateUsed: 1,
        source: 'manual',
      };
    }

    const rate = _resolveRate(from, to);

    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount: parseFloat((amount * rate.rate).toFixed(2)),
      targetCurrency: to,
      rateUsed: rate.rate,
      source: rate.source,
    };
  },

  /**
   * Convierte una lista de montos a una moneda destino común.
   * Útil para reportes que agrupan cuentas de distintas monedas.
   */
  normalizeAmounts(
    entries: { amount: number; currency: Currency }[],
    targetCurrency: Currency
  ): number {
    return entries.reduce((sum, e) => {
      const result = CurrencyService.convert(e.amount, e.currency, targetCurrency);
      return sum + result.convertedAmount;
    }, 0);
  },

  /** Devuelve el símbolo de display para una moneda. */
  symbol(currency: Currency): string {
    return currency === 'VES' ? 'Bs.' : '$';
  },
};

// ---------------------------------------------------------------------------
// Helper interno
// ---------------------------------------------------------------------------

function _resolveRate(from: Currency, to: Currency): ExchangeRate {
  if (from === 'USD' && to === 'VES') return _currentRate;

  if (from === 'VES' && to === 'USD') {
    return {
      ..._currentRate,
      from: 'VES',
      to: 'USD',
      rate: _currentRate.rate > 0 ? 1 / _currentRate.rate : 0,
    };
  }

  return { from, to, rate: 1, source: 'manual', fetchedAt: new Date().toISOString() };
}
