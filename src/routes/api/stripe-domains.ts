import { createFileRoute } from "@tanstack/react-router";

import { json, stripeErrorResponse, stripeRequest } from "@/lib/stripe.server";

/**
 * TEMPORARY setup endpoint: registers the fixed site domains for Apple Pay /
 * Google Pay with Stripe (payment_method_domains). Takes no input, so it can
 * only ever touch these two domains. Remove once both are verified.
 */
const DOMAINS = ["mysidibou.com", "www.mysidibou.com"];

type Domain = {
  id: string;
  domain_name: string;
  enabled: boolean;
  apple_pay: { status: string; status_details?: { error_message?: string } };
  google_pay: { status: string };
};

const summary = (d: Domain) => ({
  domain: d.domain_name,
  enabled: d.enabled,
  apple_pay: d.apple_pay.status,
  apple_pay_error: d.apple_pay.status_details?.error_message,
  google_pay: d.google_pay.status,
});

async function sync(register: boolean) {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const list = await stripeRequest<{ data: Domain[] }>("GET", "/payment_method_domains", { limit: 100 });
  const result = [];
  for (const name of DOMAINS) {
    let domain = list.data.find((d) => d.domain_name === name);
    if (register && !domain) {
      domain = await stripeRequest<Domain>("POST", "/payment_method_domains", { domain_name: name });
    } else if (register && domain && domain.apple_pay.status !== "active") {
      domain = await stripeRequest<Domain>("POST", `/payment_method_domains/${domain.id}/validate`);
    }
    result.push(domain ? summary(domain) : { domain: name, registered: false });
  }
  return { livemode: key.startsWith("sk_live_") || key.startsWith("rk_live_"), domains: result };
}

export const Route = createFileRoute("/api/stripe-domains")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json(await sync(false));
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
      POST: async () => {
        try {
          return json(await sync(true));
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
