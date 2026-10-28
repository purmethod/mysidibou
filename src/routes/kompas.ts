import { createFileRoute } from "@tanstack/react-router";
import html from "../pages/kompas.html?raw";

// Standalone document preserves the proven MYKOTAO dial and isolates its styles.
export const Route = createFileRoute("/kompas")({
  server: { handlers: { GET: () => new Response(html, { headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=0, must-revalidate",
  } }) } },
});
