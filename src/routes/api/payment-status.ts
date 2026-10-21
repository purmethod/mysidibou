import { createFileRoute } from "@tanstack/react-router";

import { checkoutPaymentStatus } from "@/lib/payment-status.server";
import { json, stripeErrorResponse } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/payment-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const sessionId = new URL(request.url).searchParams.get("session_id");
          return json(await checkoutPaymentStatus(sessionId));
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
