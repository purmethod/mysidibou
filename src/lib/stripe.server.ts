/**
 * Minimal Stripe REST client (no SDK dependency). Server-only: reads the
 * secret key from the environment and never exposes it to the browser.
 */
const STRIPE_API = "https://api.stripe.com/v1";

type Params = Record<string, unknown>;

export class StripeConfigError extends Error {}
export class PaymentInputError extends Error {}

export class StripeApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Flattens nested objects into Stripe's form encoding (a[b][c]=v). */
function encode(params: Params, prefix = "", out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object") encode(value as Params, name, out);
    else out.append(name, String(value));
  }
  return out;
}

export async function stripeRequest<T = any>(
  method: "GET" | "POST",
  path: string,
  params?: Params,
  options: { signal?: AbortSignal; idempotencyKey?: string } = {},
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeConfigError("STRIPE_SECRET_KEY is not set");

  const body = params ? encode(params).toString() : undefined;
  const url = method === "GET" && body ? `${STRIPE_API}${path}?${body}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: method === "POST" ? body : undefined,
    signal: options.signal,
  });
  const data = await res.json();
  if (!res.ok) throw new StripeApiError(data?.error?.message ?? "Stripe error", res.status);
  return data as T;
}

/** Contribution: 10 TND, charged in EUR at the current rate (see rate.server.ts). */
export const CONTRIBUTION = {
  currency: "eur",
  description: "MYSIDIBOU student project contribution",
  // Card statements show "<account prefix>* MYSIDIBOU".
  statementDescriptorSuffix: "MYSIDIBOU",
  // Filter in the Stripe Dashboard: metadata project = mysidibou.
  metadata: { project: "mysidibou", source: "qr-go" },
} as const;

/** The merchant country for Payment Request is never the visitor's region. */
let merchantCountryCache: { value: string | null; at: number } | null = null;
export async function getMerchantCountry(): Promise<string | null> {
  const configured = process.env.STRIPE_ACCOUNT_COUNTRY?.trim().toUpperCase();
  if (configured && /^[A-Z]{2}$/.test(configured)) return configured;
  if (merchantCountryCache && Date.now() - merchantCountryCache.at < (merchantCountryCache.value ? 3600000 : 60000)) {
    return merchantCountryCache.value;
  }
  let value: string | null = null;
  try {
    const account = await stripeRequest<{ country?: string }>("GET", "/account", undefined, { signal: AbortSignal.timeout(3000) });
    if (typeof account.country === "string" && /^[A-Z]{2}$/.test(account.country.toUpperCase())) {
      value = account.country.toUpperCase();
    }
  } catch {
    // A restricted key can still create payments without permission to read
    // /account. In that case use Checkout until the merchant country is set.
  }
  merchantCountryCache = { value, at: Date.now() };
  return value;
}

export function json(data: unknown, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  });
}

export function stripeErrorResponse(error: unknown) {
  if (error instanceof PaymentInputError) return json({ error: error.message }, 400);
  if (error instanceof StripeConfigError) return json({ error: "not_configured" }, 500);
  console.error(error);
  const message = error instanceof Error ? error.message : "Payment error";
  return json({ error: message }, error instanceof StripeApiError ? 502 : 500);
}
