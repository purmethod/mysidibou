# KOMPAS

The homepage places Our Role in the left half, with a compact neutral compass link to `/kompas` in the right half, including on mobile. The two columns form one aligned block with a thin vertical divider exactly at the midpoint and shared horizontal boundaries. Mission copy uses naturally aligned text without automatic hyphenation or stretched word spacing. The blue responsibility heading scales to the column width; role and mission accents use cobalt while keeping Outfit. It uses the supplied compass rose image, with EXPLORE SIDI BOU on one line and the smaller CLICK THE COMPASS below. Your Contribution follows across the full content width, with Support spanning the first row and Like / Share sharing the row below. Support uses the same quiet outline style as Like and Share. The existing action destinations are preserved. `/kompas` reuses MYKOTAO's ring, vertical picker, momentum/snap, keyboard controls, selection, category panels and viewport fitting. Supporting copy is English. The destination uses mysidibou's paper/cobalt palette and a thin MYSIDIBOU vector wordmark over a code-native Tunisia outline traced from the supplied map, with one dot at Sidi Bou Saïd. The wordmark recreates the wide geometric capitals of the raster MYKOTAO artwork as fixed paths; there is no separate original font file. The redundant bottom-left homepage label is omitted.

The two KOMPAS pages are standalone HTML documents served by TanStack Start GET routes. Their CSS and vanilla JS are isolated in `public/kompas/`, so they do not change the existing mission or donation flows. Links to these routes must be ordinary anchors (full document navigation), not client-side router transitions. `/kompas/whats-next` is a non-nested file route so its GET handler returns its own document.

## Content

The eight categories match MYKOTAO. Their recommendation sections explicitly say they are being curated; no venue is represented as personally tested. Local subcategory names replace island-specific activities. `What's Next` shows published events, by date, for the next twelve calendar months with Africa/Tunis times and original links.

`data/sources.json` registers 17 sources spanning Greater Tunis. See [source-audit.md](source-audit.md) for adapters, monitored sources and exclusions. Only explicit published dates within twelve calendar months are listed; an empty future month is not filled with guessed annual editions. Locality comes from the venue, address or coordinates, never from a passing mention in a description. The collector supports JSON-LD, public AIO JSON, official programme cards, explicit retreat packages and the Goethe public iCalendar feed.

The collector respects robots.txt, configured hosts and bounded requests. It excludes cancelled, online, past and out-of-region events. Identical listings are merged, preserving source links; recent last-known entries survive partial failures and are labelled. Parsing failures and monitoring-only sources are visible in Sources & Updates. Private Instagram/Facebook stories and poster-only announcements are not automatically imported, so exhaustive coverage cannot be guaranteed.

GitHub Actions is scheduled daily at **22:59 UTC / 23:59 Africa/Tunis**, also on collector changes and by manual dispatch. GitHub may delay scheduled runs. It commits only `public/kompas/events.json`. The browser reads this public JSON from main, with a bundled fallback. Event updates need no site redeploy. Checks older than 48 hours are labelled delayed; entries unverified for seven days are hidden.

The homepage uses Outfit throughout, retaining Cormorant Garamond only for “The World’s Most Beautiful Village.” The floating support button's viewport offset is reduced from 15 to 12 dvh (20% lower offset). Logo artwork occupies MYKOTAO's visible bounds in the same responsive box; the Tunisia outline retains its aspect ratio. The longest dial label has rotation-aware clearance.

## Validation

- `npm run build` — generated routes, TypeScript and production build.
- `node tests/kompas.test.cjs` — actual dial handlers: circular and vertical gestures, confirmation, wheel, keyboard, history and cancellation.
- `python3 -m unittest discover -s tests -p 'test_events.py'` — timezone, locality, twelve-month horizon, past editions, cancellation and duplicate rules.
- HTTP integration checks cover the homepage entry, both KOMPAS documents, assets and sitemap.
- Headless browser checks (no screenshots) verify the homepage entry, category/return navigation, keyboard picker, local feed fallback and filter. The compass fits 320×568, 390×844, 430×932, 1280×800 and 844×390 viewports without homepage scrolling.
- The existing four homepage Support/language regression checks also pass.

Do not create screenshots or preview images. Paul tests the live design.
