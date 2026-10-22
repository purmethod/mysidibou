import { createHmac, timingSafeEqual } from "node:crypto";

import { COFFEE_CURRENCIES, roundUpCurrencyAmount } from "./coffee.ts";
import { getEuroRate, tndPriceForLocale } from "./coffee.server.ts";
import { CUSTOM_MAX_TND, CUSTOM_MIN_TND, DONATION_TND_CHOICES, isDonationTndAmount } from "./donation.ts";
import type { DonationMenu, DonationPrice, DonationQuote } from "./donation.ts";
import { getTndEurRate } from "./rate.server.ts";
import { PaymentInputError, StripeConfigError } from "./stripe.server.ts";

export const DONATION_QUOTE_TTL_MS = 30 * 60 * 1000;

export async function donationPriceForLocale(
  locale: unknown,
  amountTnd: unknown,
  rateLookup: (currency: string) => Promise<number | null> = getEuroRate,
  tndRateLookup: () => Promise<number> = getTndEurRate,
): Promise<DonationPrice> {
  if (!isDonationTndAmount(amountTnd)) throw new PaymentInputError("invalid_donation_amount");
  return {
    ...await tndPriceForLocale(amountTnd, locale, rateLookup, tndRateLookup),
    baseAmount: amountTnd * 1000,
    baseCurrency: "tnd",
  };
}

/** Resolve one rate snapshot for a menu or custom bounds; never mix currencies. */
async function pricesFromOneRate(
  locale: unknown,
  amountsTnd: readonly number[],
  rateLookup: (currency: string) => Promise<number | null>,
  tndRateLookup: () => Promise<number>,
): Promise<DonationPrice[]> {
  const tndRate = await tndRateLookup();
  const targetRates = new Map<string, Promise<number | null>>();
  const fixedRateLookup = (currency: string) => {
    if (!targetRates.has(currency)) targetRates.set(currency, rateLookup(currency));
    return targetRates.get(currency)!;
  };
  const reference = await donationPriceForLocale(locale, amountsTnd[0], fixedRateLookup, async () => tndRate);
  const prices = await Promise.all(amountsTnd.map(async (amount, index) => {
    if (index === 0) return reference;
    if (amount === CUSTOM_MAX_TND) {
      // The custom ceiling is a limit, not a selectable preset. Cap it in the
      // established currency rather than letting an oversized conversion fall
      // back to EUR and invalidate an otherwise valid local-currency menu.
      const rate = reference.currency === "eur" ? 1 : await fixedRateLookup(reference.currency);
      if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) throw new PaymentInputError("exchange_rate_unavailable");
      const scale = 10 ** COFFEE_CURRENCIES[reference.currency];
      const maximumWholeAmount = Math.floor(99999999 / scale) * scale;
      return {
        ...reference,
        amount: Math.min(roundUpCurrencyAmount(amount * tndRate * rate, reference.currency), maximumWholeAmount),
        baseAmount: amount * 1000,
      };
    }
    return donationPriceForLocale(locale, amount, fixedRateLookup, async () => tndRate);
  }));
  if (prices.some((price) => price.currency !== prices[0].currency)) {
    throw new PaymentInputError("currency_changed");
  }
  return prices;
}

export async function getDonationMenu(
  locale: unknown,
  rateLookup: (currency: string) => Promise<number | null> = getEuroRate,
  tndRateLookup: () => Promise<number> = getTndEurRate,
): Promise<DonationMenu> {
  const prices = await pricesFromOneRate(
    locale, [...DONATION_TND_CHOICES, CUSTOM_MIN_TND, CUSTOM_MAX_TND], rateLookup, tndRateLookup,
  );
  const key = signingKey();
  const now = Date.now();
  return {
    choices: prices.slice(0, 4).map((price) => signDonationQuote(price, key, now)),
    customMax: prices[4].amount,
  };
}

/** Custom input is already local money; validate bounds, never reinterpret it as TND. */
export async function customDonationPriceForLocale(
  locale: unknown,
  amountLocal: unknown,
  currency: unknown,
  rateLookup: (currency: string) => Promise<number | null> = getEuroRate,
  tndRateLookup: () => Promise<number> = getTndEurRate,
): Promise<DonationPrice> {
  if (typeof amountLocal !== "number" || !Number.isSafeInteger(amountLocal) || amountLocal <= 0) {
    throw new PaymentInputError("invalid_donation_amount");
  }
  const [minimum, maximum] = await pricesFromOneRate(
    locale, [CUSTOM_MIN_TND, CUSTOM_MAX_TND], rateLookup, tndRateLookup,
  );
  if (currency !== minimum.currency) throw new PaymentInputError("currency_changed");
  const amount = amountLocal * 10 ** COFFEE_CURRENCIES[minimum.currency];
  if (!Number.isSafeInteger(amount) || amount < minimum.amount || amount > maximum.amount) {
    throw new PaymentInputError("invalid_donation_amount");
  }
  return {
    amount, currency: minimum.currency, baseAmount: amount, baseCurrency: minimum.currency,
    custom: true, fallbackReason: minimum.fallbackReason,
  };
}

function signingKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeConfigError("STRIPE_SECRET_KEY is not set");
  return key;
}

function signature(payload: string, key: string): Buffer {
  return createHmac("sha256", key).update(`mysidibou:donation:v1:${payload}`).digest();
}

function validPrice(price: DonationPrice): boolean {
  if (!price || !Number.isSafeInteger(price.amount) || price.amount <= 0 || price.amount > 99999999 ||
      typeof price.currency !== "string" || !Object.hasOwn(COFFEE_CURRENCIES, price.currency) ||
      price.amount % 10 ** COFFEE_CURRENCIES[price.currency] !== 0) return false;
  if (price.custom === true) {
    return price.baseCurrency === price.currency && price.baseAmount === price.amount;
  }
  return price.custom === undefined && Number.isSafeInteger(price.baseAmount) &&
    isDonationTndAmount(price.baseAmount / 1000) && price.baseCurrency === "tnd";
}

/** Locks the exact displayed local-currency total for 30 minutes. */
export function signDonationQuote(price: DonationPrice, key = signingKey(), now = Date.now()): DonationQuote {
  if (!validPrice(price)) throw new PaymentInputError("invalid_donation_quote");
  const expiresAt = now + DONATION_QUOTE_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ ...price, expiresAt })).toString("base64url");
  return { ...price, expiresAt, token: `${payload}.${signature(payload, key).toString("base64url")}` };
}

export function verifyDonationQuote(token: unknown, key = signingKey(), now = Date.now()): DonationPrice {
  if (typeof token !== "string" || token.length > 2048) throw new PaymentInputError("invalid_donation_quote");
  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) throw new PaymentInputError("invalid_donation_quote");
  const [payload, supplied] = parts;
  const expected = signature(payload, key);
  const received = Buffer.from(supplied, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new PaymentInputError("invalid_donation_quote");
  let price: DonationPrice & { expiresAt: number };
  try {
    price = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new PaymentInputError("invalid_donation_quote");
  }
  if (!validPrice(price) || !Number.isFinite(price.expiresAt) || price.expiresAt > now + DONATION_QUOTE_TTL_MS) {
    throw new PaymentInputError("invalid_donation_quote");
  }
  if (price.expiresAt <= now) throw new PaymentInputError("expired_donation_quote");
  return {
    amount: price.amount, currency: price.currency, baseAmount: price.baseAmount,
    baseCurrency: price.baseCurrency, fallbackReason: price.fallbackReason,
    ...(price.custom ? { custom: true as const } : {}),
  };
}

export async function getDonationQuote(locale: unknown, amountTnd: unknown): Promise<DonationQuote> {
  return signDonationQuote(await donationPriceForLocale(locale, amountTnd));
}

export async function getCustomDonationQuote(locale: unknown, amountLocal: unknown, currency: unknown): Promise<DonationQuote> {
  return signDonationQuote(await customDonationPriceForLocale(locale, amountLocal, currency));
}
