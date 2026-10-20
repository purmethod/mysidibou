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

/**
 * The amount the visitor saw on the page (and in the Apple Pay sheet) is the
 * one we charge — as long as it is within 3% of the server's own rate.
 */
export async function resolveCents(request: Request): Promise<number> {
  const server = await contributionCents();
  try {
    const { amount } = (await request.json()) as { amount?: unknown };
    const n = Number(amount);
    if (Number.isInteger(n) && Math.abs(n - server) <= server * 0.03) return n;
  } catch {
    // no / invalid body
  }
  return server;
}
