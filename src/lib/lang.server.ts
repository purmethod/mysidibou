import { getRequestHeader } from "@tanstack/react-start/server";

/** Languages /go speaks; the visitor's phone language picks one (fallback English). */
export const GO_LANGS = ["en", "fr", "de", "it", "es", "ar", "ru"] as const;
export type GoLang = (typeof GO_LANGS)[number];

/** First supported language from the browser's Accept-Language header. */
export function visitorLang(): GoLang {
  const header = getRequestHeader("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.trim().split(";")[0].slice(0, 2).toLowerCase();
    if ((GO_LANGS as readonly string[]).includes(code)) return code as GoLang;
  }
  return "en";
}
