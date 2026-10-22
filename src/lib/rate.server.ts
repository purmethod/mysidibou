/**
 * Shared TND → EUR rate used as the intermediate conversion for signed local
 * currency quotes. Cached per server instance; two free sources plus the
 * existing fallback rate when neither source is available.
 */
import { DONATION_TND_CHOICES, tndToEurCents } from "./donation.ts";

const FALLBACK_RATE = 0.297;
const TTL_MS = 6 * 60 * 60 * 1000;

let cache: { rate: number; at: number } | null = null;

const sources: Array<{ url: string; pick: (d: any) => unknown }> = [
  { url: "https://open.er-api.com/v6/latest/TND", pick: (d) => d?.rates?.EUR },
  {
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/tnd.json",
    pick: (d) => d?.tnd?.eur,
  },
];

export async function getTndEurRate(): Promise<number> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rate;
  for (const source of sources) {
    try {
      const res = await fetch(source.url, { signal: AbortSignal.timeout(1500) });
      const rate = Number(source.pick(await res.json()));
      // Sanity bounds: ignore obviously broken data.
      if (rate > 0.2 && rate < 0.4) {
        cache = { rate, at: Date.now() };
        return rate;
      }
    } catch {
      // try the next source
    }
  }
  return cache?.rate ?? FALLBACK_RATE;
}

/** 10 TND in euro cents at the current rate. */
export async function contributionCents(): Promise<number> {
  return tndToEurCents(DONATION_TND_CHOICES[0], await getTndEurRate());
}
