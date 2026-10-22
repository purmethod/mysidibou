import { createFileRoute } from "@tanstack/react-router";

import { getDonationQuote } from "@/lib/donation.server";
import { json, stripeErrorResponse } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/donation-quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const params = new URL(request.url).searchParams;
          const rawAmount = params.get("amountTnd") ?? "";
          const amountTnd = /^[1-9][0-9]{0,4}$/.test(rawAmount) ? Number(rawAmount) : undefined;
          return json(await getDonationQuote(params.get("locale") ?? "", amountTnd));
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
