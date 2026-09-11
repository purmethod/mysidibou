import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { button } from "@higgsfield/quanta/button";
import { NotFound } from "@higgsfield/quanta/not-found";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import { I18nProvider } from "../lib/i18n";
import { site } from "../config/site";

// Self-hosted brand fonts (never a runtime Google Fonts link).
import "@fontsource-variable/outfit";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/600-italic.css";

// Page metadata (browser <title>/favicon + social og: tags) committed into the
// repo by the marketplace meta API and read at BUILD time — no runtime fetch.
// Editing it via the app settings UI rewrites this file and redeploys the app.
import appMetaJson from "../app-meta.json";

declare const __HF_DESIGN_INSPECTOR__: boolean;

// Built-in defaults for any field that isn't set in app-meta.json.
const DEFAULT_TITLE = "mysidibou | protect sidi bou said";
const DEFAULT_DESCRIPTION =
  "turning sidi bou said into the cleanest city in tunisia. students, locals and architecture working together to preserve a unesco world heritage site.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
  // Read by the Higgsfield platform (marketplace feed card), never by the
  // app itself — keep it in this file, don't render it.
  marketplace_cover_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

// Build the document head (title / description / og: / twitter: / favicon) from
// app-meta.json, falling back to the defaults above for any unset field.
// og_title/og_description double as the browser <title> and meta description;
// og_image_url (when set) also drives the twitter card + image. Built from
// inline tag literals (conditional spreads for the optional image/favicon) so
// it matches the head() shape TanStack expects.
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value; // already root-relative
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some(
      (zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`),
    );
    if (isAppHost) return u.pathname + u.search;
    return value; // external host (CDN, etc.) — keep absolute
  } catch {
    return value; // not a parseable URL — leave as-is
  }
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: site.brand.themeColor },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "mysidibou" },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "fr_FR" },
      { property: "og:locale:alternate", content: "ar_AR" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      ...(favicon ? [{ rel: "icon", href: favicon }] : []),
      ...(favicon ? [{ rel: "apple-touch-icon", href: favicon }] : []),
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "mysidibou",
  description: DEFAULT_DESCRIPTION,
  areaServed: "Sidi Bou Said, Tunisia",
  sameAs: [site.social.instagram]
    .filter(Boolean)
    .map((url) => url),
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-q-background-primary px-4">
      <NotFound
        className="mx-auto max-w-md"
        icon={<span className="text-q-title-md-semi-bold text-q-text-primary">404</span>}
        title="Page not found"
        subtitle="The page you're looking for doesn't exist or has been moved."
      >
        <Link to="/" className={button({ variant: "primary", size: "md" }, "mt-3")}>
          Go home
        </Link>
      </NotFound>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-q-background-primary px-4">
      <div className="max-w-md text-center">
        <h1 className="text-q-title-lg-semi-bold text-q-text-primary">This page didn't load</h1>
        <p className="mt-2 text-q-body-sm-regular text-q-text-secondary">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={button({ variant: "primary", size: "md" })}
          >
            Try again
          </button>
          <a href="/" className={button({ variant: "outline", size: "md" })}>
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Read the committed page metadata at build time (no runtime fetch).
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // Light, paper-white site. Language and direction are applied by the
    // i18n provider on the client (Arabic renders RTL).
    <html lang="en" dir="ltr" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }

    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          {
            boundary: "higgsfield_design_inspector_import",
          },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </I18nProvider>
    </QueryClientProvider>
  );
}