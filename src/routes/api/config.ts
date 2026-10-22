import { createFileRoute } from "@tanstack/react-router";

import { getMerchantCountry, json, stripeRequest } from "@/lib/stripe.server";

const WALLET_DOMAIN = "www.mysidibou.com";
type PaymentMethodDomain = {
  domain_name: string;
  enabled: boolean;
  apple_pay?: { status?: string };
  google_pay?: { status?: string };
};
const walletStatus = (status: unknown) => status === "active" || status === "inactive" ? status : null;

/** Publishable key for Stripe.js (public by design). */
export const Route = createFileRoute("/api/config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) return json({ error: "not_configured" }, 500);
        const config = { publishableKey, merchantCountry: await getMerchantCountry() };
        if (new URL(request.url).searchParams.get("verify") !== "wallets") {
          return json(config, 200, "public, max-age=300");
        }
        // Read-only, explicitly requested diagnostics for this one public domain.
        // Never return account IDs, other domains, or Stripe error details.
        try {
          const domains = await stripeRequest<{ data: PaymentMethodDomain[] }>(
            "GET", "/payment_method_domains", { domain_name: WALLET_DOMAIN, limit: 1 },
            { signal: AbortSignal.timeout(3000) },
          );
          const domain = domains.data.find((item) => item.domain_name === WALLET_DOMAIN);
          return json({
            ...config,
            walletDomain: {
              domain: WALLET_DOMAIN,
              registered: !!domain,
              enabled: domain?.enabled === true,
              applePay: walletStatus(domain?.apple_pay?.status),
              googlePay: walletStatus(domain?.google_pay?.status),
            },
          });
        } catch {
          return json({ ...config, walletDomain: { domain: WALLET_DOMAIN, status: "unavailable" } });
        }
      },
    },
  },
});
