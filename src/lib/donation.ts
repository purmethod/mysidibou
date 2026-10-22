/** Approved donation choices, denominated in whole Tunisian dinars. */
import type { CoffeeFallbackReason } from "./coffee.ts";

export const DONATION_TND_CHOICES = [10, 20, 50] as const;
export const CUSTOM_MIN_TND = 80;
export const CUSTOM_MAX_TND = 10000;

export interface DonationPrice {
  amount: number;
  currency: string;
  /** Presets: Tunisian millimes. Custom: the exact local-currency minor-unit amount. */
  baseAmount: number;
  baseCurrency: string;
  custom?: true;
  fallbackReason: CoffeeFallbackReason;
}

export interface DonationQuote extends DonationPrice {
  token: string;
  expiresAt: number;
}

export interface DonationMenu {
  /** Preset quotes in the order 10, 20, 50, then the 80 TND custom minimum. */
  choices: DonationQuote[];
  /** Highest accepted custom amount, in the same currency's minor units. */
  customMax: number;
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
