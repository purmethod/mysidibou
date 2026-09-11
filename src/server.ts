import { applySecurityHeaders } from "./lib/security-headers.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      return applySecurityHeaders(await handler.fetch(request, env, ctx));
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response("500 - Internal Server Error", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
      );
    }
  },
};