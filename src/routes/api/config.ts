import { createFileRoute } from "@tanstack/react-router";

import { getMerchantCountry, json } from "@/lib/stripe.server";

/** Publishable key for Stripe.js (public by design). */
export const Route = createFileRoute("/api/config")({
  server: {
    handlers: {
      GET: async () => {
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) return json({ error: "not_configured" }, 500);
        return json({ publishableKey, merchantCountry: await getMerchantCountry() }, 200, "public, max-age=300");
      },
    },
  },
});
