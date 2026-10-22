import { createHmac, timingSafeEqual } from "node:crypto";

import { COFFEE_CURRENCIES } from "./coffee.ts";
import { getEuroRate, tndPriceForLocale } from "./coffee.server.ts";
import { isDonationTndAmount } from "./donation.ts";
import type { DonationPrice, DonationQuote } from "./donation.ts";
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

function signingKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeConfigError("STRIPE_SECRET_KEY is not set");
  return key;
}

function signature(payload: string, key: string): Buffer {
  return createHmac("sha256", key).update(`mysidibou:donation:v1:${payload}`).digest();
}

function validPrice(price: DonationPrice): boolean {
  return !!price && Number.isSafeInteger(price.baseAmount) && isDonationTndAmount(price.baseAmount / 1000) &&
    price.baseCurrency === "tnd" && Number.isSafeInteger(price.amount) && price.amount > 0 && price.amount <= 99999999 &&
    typeof price.currency === "string" && Object.hasOwn(COFFEE_CURRENCIES, price.currency) &&
    price.amount % 10 ** COFFEE_CURRENCIES[price.currency] === 0;
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
    baseCurrency: "tnd", fallbackReason: price.fallbackReason,
  };
}

export async function getDonationQuote(locale: unknown, amountTnd: unknown): Promise<DonationQuote> {
  return signDonationQuote(await donationPriceForLocale(locale, amountTnd));
}
