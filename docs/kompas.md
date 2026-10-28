# KOMPAS

The homepage has a fixed thumb-height compass link to `/kompas`. It is independent of the existing Support action. `/kompas` reuses MYKOTAO's ring, vertical picker, momentum/snap, keyboard controls, selection, category panels and viewport fitting. Supporting copy is English. The destination uses mysidibou's paper/cobalt palette and a KOMPAS wordmark; it does not reuse the Koh Tao island silhouette.

The two KOMPAS pages are standalone HTML documents served by TanStack Start GET routes. Their CSS and vanilla JS are isolated in `public/kompas/`, so they do not change the existing mission or donation flows. Links to these routes must be ordinary anchors (full document navigation), not client-side router transitions. `/kompas/whats-next` is a non-nested file route so its GET handler returns its own document.

## Content

The eight categories match MYKOTAO. Their recommendation sections explicitly say they are being curated; no venue is represented as personally tested. Local subcategory names replace island-specific activities. `What's Next` shows published events, by date, for the next twelve calendar months with Africa/Tunis times and original links.

`data/sources.json` configures Tunis Events' Sidi Bou listings, the Sociale venue calendar and CMAM/Ennejma Ezzahra's official programme. The first checked feed contains five upcoming dated listings. Old CMAM programme dates are filtered out, not relabelled with the current year. Calendar entries must locate the event in Sidi Bou Saïd or Ennejma Ezzahra; a description merely mentioning the village is insufficient. The venue-scoped Sociale feed accepts its known venue's abbreviated name.

The standard-library Python collector respects robots.txt, restricts hosts and page counts, excludes cancelled/online/past events, deduplicates and preserves recent last-known entries on partial failure. Instagram/Facebook/image-only announcements are not imported.

GitHub Actions checks sources every six hours, on collector changes and by manual dispatch. It commits only `public/kompas/events.json`. The browser reads this public JSON from main, with the bundled feed as fallback. Event updates need no site redeploy. Schedules can be delayed by GitHub; stale checks are labelled and entries unverified for seven days are hidden.

## Validation

- `npm run build` — generated routes, TypeScript and production build.
- `node tests/kompas.test.cjs` — actual dial handlers: circular and vertical gestures, confirmation, wheel, keyboard, history and cancellation.
- `python3 -m unittest discover -s tests -p 'test_events.py'` — timezone, locality, twelve-month horizon, past editions, cancellation and duplicate rules.
- HTTP integration checks cover the homepage entry, both KOMPAS documents, assets and sitemap.
- Headless browser checks (no screenshots) verify the homepage entry, category/return navigation, keyboard picker, local feed fallback and filter. The compass fits 320×568, 390×844, 430×932, 1280×800 and 844×390 viewports without homepage scrolling.
- The existing four homepage Support/language regression checks also pass.

Do not create screenshots or preview images. Paul tests the live design.
