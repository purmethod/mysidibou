/**
 * Live TND → EUR rate for the /go page. The page shows "10 TND ≈ €x.xx" and
 * charges exactly that euro amount. Cached per server instance; two free
 * sources plus a hard fallback so the page never breaks.
 */
const TND = 10;
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
  return Math.round(TND * (await getTndEurRate()) * 100);
}

/** Fixed euro choices on /go, and the range for a custom "€20+" amount. */
export const FIXED_EURO_CENTS = [500, 1000];
export const CUSTOM_MIN_CENTS = 2000;
export const CUSTOM_MAX_CENTS = 1000000; // €10,000

/**
 * The amount the visitor chose on the page (and saw in the Apple Pay sheet) is
 * the one we charge, if it is one of the allowed choices:
 *  - 10 TND at the current rate (within 3% of the server's own rate)
 *  - €5 or €10
 *  - a custom amount from €20 to €10,000 (whole euros)
 * Anything else falls back to 10 TND.
 */
export function validDonationCents(amount: unknown, tnd: number): number | null {
  if (typeof amount !== "number" || !Number.isInteger(amount)) return null;
  if (Math.abs(amount - tnd) <= tnd * 0.03) return amount;
  if (FIXED_EURO_CENTS.includes(amount)) return amount;
  if (amount >= CUSTOM_MIN_CENTS && amount <= CUSTOM_MAX_CENTS && amount % 100 === 0) return amount;
  return null;
}

export async function resolveCents(request: Request): Promise<number> {
  const tnd = await contributionCents();
  try {
    const { amount } = (await request.json()) as { amount?: unknown };
    return validDonationCents(amount, tnd) ?? tnd;
  } catch {
    // no / invalid body
  }
  return tnd;
}
