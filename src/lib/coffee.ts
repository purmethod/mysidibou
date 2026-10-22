/** Public coffee price data. The signed token is verified on the server. */
export type CoffeeFallbackReason = "unknown_region" | "unsupported_currency" | "rate_unavailable" | null;

/** Fixed coffee price in Tunisian millimes (5 TND). */
export const COFFEE_BASE_AMOUNT = 5000 as const;

export interface CoffeePrice {
  amount: number;
  currency: string;
  baseAmount: typeof COFFEE_BASE_AMOUNT;
  baseCurrency: "tnd";
  fallbackReason: CoffeeFallbackReason;
}

export interface CoffeeQuote extends CoffeePrice {
  token: string;
  /** Epoch milliseconds. Refresh before opening a wallet after this time. */
  expiresAt: number;
}

// A conservative set of Stripe card presentment currencies.
export const COFFEE_CURRENCIES: Readonly<Record<string, number>> = {
  eur: 2, usd: 2, gbp: 2, chf: 2, cad: 2, aud: 2, nzd: 2,
  jpy: 0, krw: 0, sek: 2, nok: 2, dkk: 2, pln: 2, czk: 2,
  huf: 2, ron: 2, sgd: 2, hkd: 2, aed: 2, sar: 2,
  inr: 2, brl: 2, mxn: 2, zar: 2, mad: 2, try: 2,
  ils: 2, myr: 2, php: 2, thb: 2, idr: 2, cny: 2,
};

const REGION_CURRENCY: Readonly<Record<string, string>> = {
  AT: "eur", BE: "eur", BG: "eur", CY: "eur", DE: "eur", EE: "eur",
  ES: "eur", FI: "eur", FR: "eur", GR: "eur", HR: "eur", IE: "eur",
  IT: "eur", LT: "eur", LU: "eur", LV: "eur", MT: "eur", NL: "eur",
  PT: "eur", SI: "eur", SK: "eur", AD: "eur", MC: "eur", SM: "eur", VA: "eur",
  US: "usd", GB: "gbp", CH: "chf", LI: "chf", CA: "cad", AU: "aud", NZ: "nzd",
  JP: "jpy", KR: "krw", SE: "sek", NO: "nok", DK: "dkk", PL: "pln",
  CZ: "czk", HU: "huf", RO: "ron", SG: "sgd", HK: "hkd", AE: "aed", SA: "sar",
  IN: "inr", BR: "brl", MX: "mxn", ZA: "zar", MA: "mad", TR: "try",
  IL: "ils", MY: "myr", PH: "php", TH: "thb", ID: "idr", CN: "cny",
};

export function coffeeCurrencyForLocale(locale: unknown): {
  currency: string;
  fallbackReason: CoffeeFallbackReason;
} {
  if (typeof locale !== "string" || locale.length > 80) {
    return { currency: "eur", fallbackReason: "unknown_region" };
  }
  try {
    const parsed = new Intl.Locale(locale);
    // An explicit device region takes priority. Japanese/Korean device language
    // tags are often regionless; use their conventional currencies, not geolocation.
    // Do not maximize other languages into an arbitrary country (e.g. English→US).
    const region = parsed.region ?? ({ ja: "JP", ko: "KR" } as Record<string, string>)[parsed.language];
    if (!region) return { currency: "eur", fallbackReason: "unknown_region" };
    const currency = REGION_CURRENCY[region];
    return currency
      ? { currency, fallbackReason: null }
      : { currency: "eur", fallbackReason: "unsupported_currency" };
  } catch {
    return { currency: "eur", fallbackReason: "unknown_region" };
  }
}

/** Round upward to a whole unit of the charged currency, returned in minor units. */
export function roundUpCurrencyAmount(majorAmount: number, currency: string): number {
  if (!Number.isFinite(majorAmount) || majorAmount <= 0 || !Object.hasOwn(COFFEE_CURRENCIES, currency)) {
    throw new RangeError("invalid_currency_amount");
  }
  // Avoid charging an extra whole unit for binary noise such as 4.000000000000001.
  const whole = Math.ceil(majorAmount - Number.EPSILON * Math.max(1, Math.abs(majorAmount)));
  return whole * 10 ** COFFEE_CURRENCIES[currency];
}

export function formatCoffeePrice(price: Pick<CoffeePrice, "amount" | "currency">, locale?: string): string {
  const digits = COFFEE_CURRENCIES[price.currency] ?? 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: price.currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(price.amount / 10 ** digits);
  } catch {
    const value = price.amount / 10 ** digits;
    return `${value.toFixed(Number.isInteger(value) ? 0 : digits)} ${price.currency.toUpperCase()}`;
  }
}
