import { createFileRoute } from "@tanstack/react-router";

import { getCoffeeQuote } from "@/lib/coffee.server";
import { json, stripeErrorResponse } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/coffee-quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const locale = new URL(request.url).searchParams.get("locale") ?? "";
          return json(await getCoffeeQuote(locale));
        } catch (error) {
          return stripeErrorResponse(error);
        }
      },
    },
  },
});
