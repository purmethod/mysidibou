import { createFileRoute } from "@tanstack/react-router";

import { resolvePayment } from "@/lib/payment.server";
import { CONTRIBUTION, json, stripeErrorResponse, stripeRequest } from "@/lib/stripe.server";

/** Card / PayPal: hosted Stripe Checkout for a donation or the signed coffee price. */
export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          const payment = await resolvePayment(request);
          const session = await stripeRequest<{ url: string }>("POST", "/checkout/sessions", {
            mode: "payment",
            // Keep the signed local-currency quote; do not reconvert in Checkout.
            adaptive_pricing: { enabled: false },
            submit_type: payment.purpose === "coffee" ? "pay" : "donate",
            line_items: {
              0: {
                quantity: 1,
                price_data: {
                  currency: payment.currency,
                  unit_amount: payment.amount,
                  product_data: { name: payment.description },
                },
              },
            },
            payment_intent_data: {
              description: payment.description,
              statement_descriptor_suffix: CONTRIBUTION.statementDescriptorSuffix,
              metadata: payment.metadata,
            },
            metadata: payment.metadata,
            success_url: `${origin}/go?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/go`,
          }, { idempotencyKey: payment.idempotencyKey ? `${payment.idempotencyKey}:checkout` : undefined });
          return json({ url: session.url });
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
