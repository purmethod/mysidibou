import { createFileRoute } from "@tanstack/react-router";

import { getCustomDonationQuote, getDonationMenu, getDonationQuote } from "@/lib/donation.server";
import { json, stripeErrorResponse } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/donation-quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const params = new URL(request.url).searchParams;
          const locale = params.get("locale") ?? "";
          if (params.get("menu") === "1") return json(await getDonationMenu(locale));
          if (params.has("amountLocal")) {
            const rawLocal = params.get("amountLocal") ?? "";
            const amountLocal = /^[1-9][0-9]{0,8}$/.test(rawLocal) ? Number(rawLocal) : undefined;
            return json(await getCustomDonationQuote(locale, amountLocal, params.get("currency")));
          }
          const rawAmount = params.get("amountTnd") ?? "";
          const amountTnd = /^[1-9][0-9]{0,4}$/.test(rawAmount) ? Number(rawAmount) : undefined;
          return json(await getDonationQuote(locale, amountTnd));
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
