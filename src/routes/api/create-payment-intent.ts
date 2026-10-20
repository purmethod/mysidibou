import { createFileRoute } from "@tanstack/react-router";

import { resolveCents } from "@/lib/rate.server";
import { CONTRIBUTION, json, stripeErrorResponse, stripeRequest } from "@/lib/stripe.server";

/** Deferred-intent flow: the wallet sheet is confirmed first, then this creates the intent. */
export const Route = createFileRoute("/api/create-payment-intent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const intent = await stripeRequest<{ client_secret: string }>(
            "POST",
            "/payment_intents",
            {
              amount: await resolveCents(request),
              currency: CONTRIBUTION.currency,
              automatic_payment_methods: { enabled: true },
              description: CONTRIBUTION.description,
              metadata: CONTRIBUTION.metadata,
            },
          );
          return json({ client_secret: intent.client_secret });
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
