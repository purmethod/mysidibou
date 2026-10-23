import { createFileRoute } from "@tanstack/react-router";

import { json, stripeErrorResponse, stripeRequest } from "@/lib/stripe.server";

/**
 * TEMPORARY: why did a mysidibou PaymentIntent fail? Returns only status and the
 * failure reason (no personal data). Remove after diagnosis.
 */
export const Route = createFileRoute("/api/payment-debug")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const id = new URL(request.url).searchParams.get("id") ?? "";
          if (!/^pi_[A-Za-z0-9]{10,64}$/.test(id)) return json({ error: "invalid_id" }, 400);
          const pi = await stripeRequest<any>("GET", `/payment_intents/${id}`, { expand: { 0: "latest_charge" } });
          if (pi?.metadata?.project !== "mysidibou") return json({ error: "not_found" }, 404);
          const e = pi.last_payment_error;
          const c = pi.latest_charge;
          return json({
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            method_types: pi.payment_method_types,
            error: e && { type: e.type, code: e.code, decline_code: e.decline_code, message: e.message, method: e.payment_method?.type },
            charge: c && typeof c === "object" && {
              status: c.status, failure_code: c.failure_code, failure_message: c.failure_message,
              outcome: c.outcome && { type: c.outcome.type, reason: c.outcome.reason, network_status: c.outcome.network_status, seller_message: c.outcome.seller_message },
              method: c.payment_method_details?.type,
            },
          });
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
