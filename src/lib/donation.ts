/** Approved donation choices, denominated in whole Tunisian dinars. */
import type { CoffeeFallbackReason } from "./coffee.ts";

export const DONATION_TND_CHOICES = [10, 20, 50] as const;
export const CUSTOM_MIN_TND = 80;
export const CUSTOM_MAX_TND = 10000;

export interface DonationPrice {
  amount: number;
  currency: string;
  /** Donation base in Tunisian millimes, before currency conversion and rounding. */
  baseAmount: number;
  baseCurrency: "tnd";
  fallbackReason: CoffeeFallbackReason;
}

export interface DonationQuote extends DonationPrice {
  token: string;
  expiresAt: number;
}

export function isDonationTndAmount(amount: unknown): amount is number {
  return typeof amount === "number" && Number.isSafeInteger(amount) &&
    ((DONATION_TND_CHOICES as readonly number[]).includes(amount) ||
      (amount >= CUSTOM_MIN_TND && amount <= CUSTOM_MAX_TND));
}

/** Shared rounding keeps the displayed wallet total and server charge identical. */
export function tndToEurCents(amountTnd: number, tndEurRate: number): number {
  const cents = amountTnd * tndEurRate * 100;
  // Preserve half-cent rounding despite binary floating-point noise (e.g. 1.485).
  return Math.round(cents + Number.EPSILON * Math.abs(cents));
}
