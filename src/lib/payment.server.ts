import { verifyCoffeeQuote } from "./coffee.server.ts";
import { verifyDonationQuote } from "./donation.server.ts";
import { CONTRIBUTION, PaymentInputError } from "./stripe.server.ts";

export interface PaymentDetails {
  purpose: "donation" | "coffee";
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  idempotencyKey?: string;
}

export function coffeeIdempotencyKey(requestId: unknown): string | undefined {
  if (requestId === undefined) return undefined;
  if (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new PaymentInputError("invalid_payment_request_id");
  }
  return `coffee:${requestId.toLowerCase()}`;
}

/** Parse once and use the same trusted amount for wallet intents and Checkout. */
export async function resolvePayment(request: Request): Promise<PaymentDetails> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    throw new PaymentInputError("invalid_payment_request");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new PaymentInputError("invalid_payment_request");

  if (body.purpose === "coffee") {
    // Never trust a client amount, currency or FX rate for the fixed coffee price.
    const price = verifyCoffeeQuote(body.quote);
    return {
      purpose: "coffee",
      amount: price.amount,
      currency: price.currency,
      description: "Buy the MYSIDIBOU team a coffee",
      idempotencyKey: coffeeIdempotencyKey(body.paymentRequestId),
      metadata: {
        ...CONTRIBUTION.metadata,
        purpose: "coffee",
        base_amount: String(price.baseAmount),
        base_currency: price.baseCurrency,
      },
    };
  }
  if (body.purpose !== undefined && body.purpose !== "donation") throw new PaymentInputError("invalid_payment_purpose");
  const price = verifyDonationQuote(body.quote);
  // The signed quote fixes both the charge and currency; the frontend must echo
  // exactly the total shown in the wallet or Checkout CTA, never a stale quote.
  if (body.amount !== price.amount || body.currency !== price.currency) {
    throw new PaymentInputError("donation_quote_mismatch");
  }
  return {
    purpose: "donation",
    amount: price.amount,
    currency: price.currency,
    description: CONTRIBUTION.description,
    metadata: {
      ...CONTRIBUTION.metadata,
      purpose: "donation",
      base_amount: String(price.baseAmount),
      base_currency: price.baseCurrency,
    },
  };
}
