import { createHmac, timingSafeEqual } from "node:crypto";

import { COFFEE_BASE_AMOUNT, COFFEE_CURRENCIES, coffeeCurrencyForLocale, roundUpCurrencyAmount } from "./coffee.ts";
import type { CoffeePrice, CoffeeQuote } from "./coffee.ts";
import { getTndEurRate } from "./rate.server.ts";
import { PaymentInputError, StripeConfigError } from "./stripe.server.ts";

const RATE_TTL_MS = 6 * 60 * 60 * 1000;
export const COFFEE_QUOTE_TTL_MS = 30 * 60 * 1000;
let ratesCache: { rates: Record<string, number>; at: number } | null = null;

/** Only rates are sent to these public endpoints; never payment or visitor data. */
export async function getEuroRate(currency: string): Promise<number | null> {
  if (currency === "eur") return 1;
  if (ratesCache && Date.now() - ratesCache.at < RATE_TTL_MS) {
    return ratesCache.rates[currency] ?? null;
  }
  const sources = [
    { url: "https://open.er-api.com/v6/latest/EUR", key: "rates" },
    { url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json", key: "eur" },
  ];
  for (const source of sources) {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(1500) });
      if (!response.ok) continue;
      const data = await response.json();
      const publishedAt = source.key === "rates"
        ? Number(data.time_last_update_unix) * 1000
        : Date.parse(data.date);
      // Refuse stale or malformed source data rather than charging an old rate.
      if (!Number.isFinite(publishedAt) || Math.abs(Date.now() - publishedAt) > 3 * 24 * 60 * 60 * 1000) continue;
      const sourceRates = data[source.key];
      if (!sourceRates || typeof sourceRates !== "object") continue;
      const rates: Record<string, number> = { eur: 1 };
      for (const [code, value] of Object.entries(sourceRates)) {
        const normalized = code.toLowerCase();
        if (Object.hasOwn(COFFEE_CURRENCIES, normalized) && typeof value === "number" && value > 0.01 && value < 100000) {
          rates[normalized] = value;
        }
      }
      if (rates[currency]) {
        ratesCache = { rates, at: Date.now() };
        return rates[currency];
      }
    } catch {
      // Try the second source, then quote the coffee's euro equivalent explicitly.
    }
  }
  return null;
}

/** Shared by donations and coffee: convert first, then round UP once in the charge currency. */
export async function tndPriceForLocale(
  amountTnd: number,
  locale: unknown,
  rateLookup: (currency: string) => Promise<number | null> = getEuroRate,
  tndRateLookup: () => Promise<number> = getTndEurRate,
): Promise<Pick<CoffeePrice, "amount" | "currency" | "fallbackReason">> {
  const { currency, fallbackReason } = coffeeCurrencyForLocale(locale);
  const tndEurRate = await tndRateLookup();
  const euroMajor = amountTnd * tndEurRate;
  if (!Number.isFinite(euroMajor) || euroMajor <= 0) throw new PaymentInputError("exchange_rate_unavailable");
  const euroAmount = roundUpCurrencyAmount(euroMajor, "eur");
  if (!Number.isSafeInteger(euroAmount) || euroAmount <= 0 || euroAmount > 99999999) throw new PaymentInputError("exchange_rate_unavailable");
  if (currency === "eur") return { amount: euroAmount, currency, fallbackReason };
  const rate = await rateLookup(currency);
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0.01 || rate >= 100000) {
    return { amount: euroAmount, currency: "eur", fallbackReason: "rate_unavailable" };
  }
  const amount = roundUpCurrencyAmount(euroMajor * rate, currency);
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 99999999) {
    return { amount: euroAmount, currency: "eur", fallbackReason: "rate_unavailable" };
  }
  return { amount, currency, fallbackReason: null };
}

export async function coffeePriceForLocale(
  locale: unknown,
  rateLookup: (currency: string) => Promise<number | null> = getEuroRate,
  tndRateLookup: () => Promise<number> = getTndEurRate,
): Promise<CoffeePrice> {
  return {
    ...await tndPriceForLocale(COFFEE_BASE_AMOUNT / 1000, locale, rateLookup, tndRateLookup),
    baseAmount: COFFEE_BASE_AMOUNT,
    baseCurrency: "tnd",
  };
}

function signingKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeConfigError("STRIPE_SECRET_KEY is not set");
  return key;
}

function signature(payload: string, key: string): Buffer {
  return createHmac("sha256", key).update(`mysidibou:coffee:v2:${payload}`).digest();
}

/** Locks the displayed amount, including its FX rounding, for the wallet sheet. */
export function signCoffeeQuote(price: CoffeePrice, key = signingKey(), now = Date.now()): CoffeeQuote {
  if (price.baseAmount !== COFFEE_BASE_AMOUNT || price.baseCurrency !== "tnd" ||
      !Number.isSafeInteger(price.amount) || price.amount < 1 || price.amount > 99999999 ||
      !Object.hasOwn(COFFEE_CURRENCIES, price.currency) || price.amount % 10 ** COFFEE_CURRENCIES[price.currency] !== 0) {
    throw new PaymentInputError("invalid_coffee_quote");
  }
  const expiresAt = now + COFFEE_QUOTE_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ ...price, expiresAt })).toString("base64url");
  const token = `${payload}.${signature(payload, key).toString("base64url")}`;
  return { ...price, token, expiresAt };
}

export function verifyCoffeeQuote(token: unknown, key = signingKey(), now = Date.now()): CoffeePrice {
  if (typeof token !== "string" || token.length > 2048) throw new PaymentInputError("invalid_coffee_quote");
  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) {
    throw new PaymentInputError("invalid_coffee_quote");
  }
  const [payload, supplied] = parts;
  const expected = signature(payload, key);
  const received = Buffer.from(supplied, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new PaymentInputError("invalid_coffee_quote");
  }
  let price: CoffeePrice & { expiresAt: number };
  try {
    price = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new PaymentInputError("invalid_coffee_quote");
  }
  if (!price || !Number.isSafeInteger(price.amount) || price.amount < 1 || price.amount > 99999999 ||
      typeof price.currency !== "string" || !Object.hasOwn(COFFEE_CURRENCIES, price.currency) ||
      price.amount % 10 ** COFFEE_CURRENCIES[price.currency] !== 0 ||
      price.baseAmount !== COFFEE_BASE_AMOUNT || price.baseCurrency !== "tnd" || !Number.isFinite(price.expiresAt) ||
      price.expiresAt > now + COFFEE_QUOTE_TTL_MS) {
    throw new PaymentInputError("invalid_coffee_quote");
  }
  if (price.expiresAt <= now) throw new PaymentInputError("expired_coffee_quote");
  return { amount: price.amount, currency: price.currency, baseAmount: COFFEE_BASE_AMOUNT, baseCurrency: "tnd", fallbackReason: price.fallbackReason };
}

export async function getCoffeeQuote(locale: unknown): Promise<CoffeeQuote> {
  return signCoffeeQuote(await coffeePriceForLocale(locale));
}
