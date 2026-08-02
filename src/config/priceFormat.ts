import type { PriceCurrency } from '@/infrastructure/http/serviceService';

const SYMBOLS: Record<PriceCurrency, string> = {
  ARS: 'AR$',
  USD: 'U$S',
};

export interface FormatPriceOptions {
  /** Agrega el sufijo ".-" usado en los flujos de tattoo. Default: false */
  dashSuffix?: boolean;
}

/**
 * Formatea un monto con su símbolo de moneda.
 * Ej: formatPrice(88000, 'ARS') => "AR$ 88.000"
 *     formatPrice(650, 'USD', { dashSuffix: true }) => "U$S 650.-"
 */
export function formatPrice(
  amount: number,
  currency: PriceCurrency = 'ARS',
  options: FormatPriceOptions = {}
): string {
  const symbol = SYMBOLS[currency] ?? SYMBOLS.ARS;
  const formatted = Math.round(amount).toLocaleString('es-AR');
  return `${symbol} ${formatted}${options.dashSuffix ? '.-' : ''}`;
}

interface PricedService {
  listPrice: number | null;
  effectivePrice: number | null;
  price: number;
  listCurrency: PriceCurrency;
}

/**
 * Construye los strings de precio (lista / efectivo / seña) de una opción a partir
 * del servicio del backend. Sólo devuelve el campo si el backend tiene el dato; el
 * caller usa spread para caer al valor hardcodeado (fallback seguro pre-seed).
 * La seña sólo se incluye si la opción ya mostraba una (hadDepositValue).
 */
export function backendPriceStrings(
  service: PricedService | undefined,
  hadDepositValue: boolean
): { priceValue?: string; priceEffective?: string; depositValue?: string } {
  if (!service) return {};
  const currency = service.listCurrency ?? 'ARS';
  const out: { priceValue?: string; priceEffective?: string; depositValue?: string } = {};
  if (service.listPrice != null) {
    out.priceValue = formatPrice(service.listPrice, currency, { dashSuffix: true });
  }
  if (service.effectivePrice != null) {
    out.priceEffective = formatPrice(service.effectivePrice, currency, { dashSuffix: true });
  }
  if (hadDepositValue && service.price != null) {
    out.depositValue = formatPrice(service.price, 'ARS', { dashSuffix: true });
  }
  return out;
}
