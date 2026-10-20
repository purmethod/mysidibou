import { createFileRoute } from "@tanstack/react-router";

import { resolveCents } from "@/lib/rate.server";
import { CONTRIBUTION, json, stripeErrorResponse, stripeRequest } from "@/lib/stripe.server";

/** Card / PayPal: hosted Stripe Checkout, 10 TND in EUR, back to /go?paid=1. */
export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          const amount = await resolveCents(request);
          const session = await stripeRequest<{ url: string }>("POST", "/checkout/sessions", {
            mode: "payment",
            submit_type: "donate",
            line_items: {
              0: {
                quantity: 1,
                price_data: {
                  currency: CONTRIBUTION.currency,
                  unit_amount: amount,
                  product_data: { name: CONTRIBUTION.description },
                },
              },
            },
            payment_intent_data: {
              description: CONTRIBUTION.description,
              statement_descriptor_suffix: CONTRIBUTION.statementDescriptorSuffix,
              metadata: CONTRIBUTION.metadata,
            },
            metadata: CONTRIBUTION.metadata,
            success_url: `${origin}/go?paid=1&amt=${amount}`,
            cancel_url: `${origin}/go`,
          });
          return json({ url: session.url });
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
