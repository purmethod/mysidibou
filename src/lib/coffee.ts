/** Public coffee price data. The signed token is verified on the server. */
export type CoffeeFallbackReason = "unknown_region" | "unsupported_currency" | "rate_unavailable" | null;

/** Fixed coffee price in euro cents, shared by quoting and display code. */
export const COFFEE_BASE_AMOUNT = 300 as const;

export interface CoffeePrice {
  amount: number;
  currency: string;
  baseAmount: typeof COFFEE_BASE_AMOUNT;
  baseCurrency: "eur";
  fallbackReason: CoffeeFallbackReason;
}

export interface CoffeeQuote extends CoffeePrice {
  token: string;
  /** Epoch milliseconds. Refresh before opening a wallet after this time. */
  expiresAt: number;
}

// A conservative set of Stripe card presentment currencies. A phone language
// alone does not establish the user's country or currency.
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
    // Do not maximize the locale: that would guess a country from a language.
    const region = new Intl.Locale(locale).region;
    if (!region) return { currency: "eur", fallbackReason: "unknown_region" };
    const currency = REGION_CURRENCY[region];
    return currency
      ? { currency, fallbackReason: null }
      : { currency: "eur", fallbackReason: "unsupported_currency" };
  } catch {
    return { currency: "eur", fallbackReason: "unknown_region" };
  }
}

export function formatCoffeePrice(price: Pick<CoffeePrice, "amount" | "currency">, locale?: string): string {
  const digits = COFFEE_CURRENCIES[price.currency] ?? 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: price.currency.toUpperCase(),
    }).format(price.amount / 10 ** digits);
  } catch {
    return `${(price.amount / 10 ** digits).toFixed(digits)} ${price.currency.toUpperCase()}`;
  }
}
