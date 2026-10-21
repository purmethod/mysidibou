import { PaymentInputError, stripeRequest } from "./stripe.server.ts";

interface CheckoutSession {
  status: string | null;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
}

export type CheckoutPaymentStatus =
  | { paid: false }
  | { paid: true; purpose: "donation" | "coffee"; amount: number; currency: string };

export function verifiedCheckoutStatus(session: CheckoutSession): CheckoutPaymentStatus {
  const purpose = session.metadata?.purpose;
  if (session.status !== "complete" || session.payment_status !== "paid" ||
      session.metadata?.project !== "mysidibou" || session.metadata?.source !== "qr-go" ||
      (purpose !== "donation" && purpose !== "coffee") ||
      !Number.isSafeInteger(session.amount_total) || !session.amount_total || session.amount_total < 0 ||
      typeof session.currency !== "string" || !/^[a-z]{3}$/.test(session.currency)) {
    return { paid: false };
  }
  return { paid: true, purpose, amount: session.amount_total, currency: session.currency };
}

export async function checkoutPaymentStatus(sessionId: unknown): Promise<CheckoutPaymentStatus> {
  if (typeof sessionId !== "string" || !/^cs_(?:test|live)_[A-Za-z0-9]{8,256}$/.test(sessionId)) {
    throw new PaymentInputError("invalid_checkout_session");
  }
  const session = await stripeRequest<CheckoutSession>(
    "GET", `/checkout/sessions/${sessionId}`, undefined, { signal: AbortSignal.timeout(5000) },
  );
  return verifiedCheckoutStatus(session);
}
