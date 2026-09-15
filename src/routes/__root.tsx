import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { I18nProvider } from "../lib/i18n";
import { site } from "../config/site";

// Self-hosted brand fonts (no external font requests at runtime).
import "@fontsource-variable/outfit";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/600-italic.css";

// Page metadata (browser <title>/favicon + social og: tags), committed in the
// repo and read at BUILD time.
import appMetaJson from "../app-meta.json";

const DEFAULT_TITLE = "mysidibou | protect sidi bou said";
const DEFAULT_DESCRIPTION =
  "Turning Sidi Bou Said into the cleanest village in the world. Students, locals and architects protecting a UNESCO World Heritage village for the next 500 years.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = meta.og_image_url ?? null;
  const favicon = meta.favicon_url ?? null;

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
      ...(meta.og_video_url
        ? [{ property: "og:video", content: meta.og_video_url }]
        : []),
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
  sameAs: [site.social.instagram].filter(Boolean),
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="section-headline text-6xl">404</h1>
        <p className="mt-4 text-ink-soft">The page you are looking for does not exist.</p>
        <Link className="btn-donate mt-8" to="/">
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="section-headline text-5xl">This page did not load</h1>
        <p className="mt-4 text-ink-soft">
          Something went wrong on our end. Try refreshing, or head back home.
        </p>
        <Link className="btn-donate mt-8" to="/">
          Back home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
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

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Outlet />
      </I18nProvider>
    </QueryClientProvider>
  );
}