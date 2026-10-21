import { createFileRoute } from "@tanstack/react-router";

import { resolvePayment } from "@/lib/payment.server";
import { CONTRIBUTION, json, stripeErrorResponse, stripeRequest } from "@/lib/stripe.server";

/** Deferred-intent flow: the wallet sheet is confirmed first, then this creates the intent. */
export const Route = createFileRoute("/api/create-payment-intent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payment = await resolvePayment(request);
          const intent = await stripeRequest<{ client_secret: string }>(
            "POST",
            "/payment_intents",
            {
              amount: payment.amount,
              currency: payment.currency,
              ...(payment.purpose === "coffee"
                ? { payment_method_types: ["card"] }
                : { automatic_payment_methods: { enabled: true } }),
              description: payment.description,
              statement_descriptor_suffix: CONTRIBUTION.statementDescriptorSuffix,
              metadata: payment.metadata,
            },
            { idempotencyKey: payment.idempotencyKey ? `${payment.idempotencyKey}:intent` : undefined },
          );
          return json({ client_secret: intent.client_secret, amount: payment.amount, currency: payment.currency, purpose: payment.purpose });
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
