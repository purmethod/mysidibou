# mysidibou — design brief

- **Brand:** mysidibou (always lowercase). A real environmental, architectural and social movement in Sidi Bou Said, Tunisia.
- **Goal:** turn Sidi Bou Said into the cleanest city in Tunisia; protect a 2026 UNESCO World Heritage Site for the next 200-500 years.
- **Audience:** international tourists and locals arriving from Instagram, TikTok, QR codes and phones. Emotional, then convinced, then donating.

## Design read

A heritage-town preservation movement site for anyone who loves Sidi Bou Said: the town itself is the brand. Architectural-magazine calm (Mies-van-der-Rohe simplicity), Mediterranean light, large photography, no clutter, no NGO template.

## Concept spine

"The walk". The whole page is one slow walk down a Sidi Bou Said street: the visitor falls in love first (the film), sees the wear (the problem), meets the people (students, locals), and arrives at responsibility (the ask). The scroll journey enacts the spine: scroll plays a continuous camera glide through the town, chapters read over it.

## Delivery tier

cinema (animated website default, Tier-1 scroll-scrub). Lenis/GSAP avoided for the journey (the engine owns scroll-to-video time); light GSAP-free reveals for post-journey sections, `prefers-reduced-motion` fallbacks everywhere.

## Animation mode: non-animated — user request mid-build

Animation mode: non-animated — user asked mid-build: "vielleicht braucht man auch keine filme... ich glaube, braucht man keine videos" (the film journey was removed; the hero is a static generated still from the film's first frame; Tier-1 wow = the typographic marquee, scroll reveals and image depth).

- **Journey shape:** `single-shot` — one continuous ~15s film, no seams, scrubbed end to end.
- **Journey (6 chapters over the one film):** (1) the town — establishing wide of the white town above the sea; (2) the streets — glide past blue doors and bougainvillea, beauty first; (3) the problem — "every visitor leaves a footprint"; (4) the people — students drawing and cleaning; (5) the mission — "the cleanest city in tunisia"; (6) the future — the closing beauty state at blue hour. Each chapter: kicker (2 max), headline ≤8 words, body one sentence, 0-3 proof tags.
- **World grammar (byte-identical across the film):** photoreal Sidi Bou Said, white limewashed walls, deep cobalt blue doors/windows/wrought iron (#1E4E8C), bougainvillea pink, jasmine, natural stone, Mediterranean golden sunlight, deep blue sky; cinematic grade, locked exposure, slow steady forward camera glide, no cuts, no shake, no camera-facing faces, no on-screen text.
- **Mobile framing:** subject center-safe (the street center), edges expendable; lighter mobile encode.
- **Delivery budget:** desktop ≤32 MiB, mobile ≤16 MiB.

## Locked palette

- `--paper: #F7F5EF` — limewash white, dominant surface. Defense: the white architecture of Sidi Bou Said.
- `--cobalt: #1E4E8C` — Sidi Bou Said blue, sampled from the town's blue doors and wrought iron (deep cobalt, not invented pastel).
- `--cobalt-deep: #123A6B` — deep blue for the final CTA and dark moments; white type on it.
- `--ink: #101D31` — deep navy ink for text on light (never pure black).
- `--stone: #E7DFD0`, `--green: #5F7055`, `--blush: #C96F8B` — stone beige and natural green in small amounts; bougainvillea pink appears mainly through photography.
- No gradients, no neon, no generic green-environmental branding.

## Locked type

- Display serif: **Cormorant Garamond** (editorial/heritage — justified: an actual heritage institution; elegant Mediterranean magazine character; italic for emotional words with leading 1.1-1.15 + descender clearance).
- Sans: **Outfit** (clean geometric body/UI labels).
- Display scale: `clamp(2.75rem, 6vw, 6.75rem)` journey titles; section headlines `text-4xl md:text-6xl tracking-tighter`; body `text-base md:text-lg leading-relaxed max-w-[60ch]`.

## Section plan (after the journey, ~12 sections, ≥6 layout families, no repeats)

1. Journey (film chapters, type over film) — the only full-screen media section.
2. The problem — full-width serif statement, 5 short lines list.
3. The mission — numbered hairline rows (plastic / cigarette butts / waste out).
4. The people — image + text split (students).
5. Cleaning — full-bleed image band, one line.
6. Local life — reversed image + text split (flower sellers, cafés, craftsmen).
7. Entrance concept — text over landscape image, principle list, small quote.
8. Visitor contribution — tinted panel, three columns of facts, no prices.
9. Transparency — hairline list of 6 allocation lines, honesty note.
10. Progress — placeholder stat rows (clear "first report upcoming" marking, no invented numbers) + before/after slot.
11. UNESCO — thin centered band: "World heritage. World responsibility."
12. 500 years — full-bleed historic sepia image, minimal huge type.
13. Follow — social links row (Instagram, TikTok, YouTube).
14. Final CTA — deep cobalt background, white type, Donate now / Follow the mission.
15. Footer — wordmark, one line, tiny nav, language switcher.
- Eyebrows: journey kickers (2) + zero section eyebrows (headlines carry).

## Asset plan

- ONE 16:9 storyboard (6-panel continuous glide) already generated; the film (seedance_2_5, ~15s, 16:9, 1080p, no audio) uses it as style reference.
- Scroll-scrub encodes: desktop + mobile MP4 + exact-frame posters → `public/assets/world/`.
- Content imagery (all photoreal, no text, palette-locked): students working in a street; local flower seller; cleaning hands with tongs; bougainvillea on white wall with trellis (entrance); historic sepia village; blue-hour town (finale option).
- Logo: wordmark is HTML type — no generated logo. Favicon/OG/cover via `generate_app_branding` (flat deep-blue arched-door glyph).
- No generated icon set needed (site is type-only; social marks are inline SVG brand glyphs).

## CTA inventory (every CTA its own component + interaction identity)

1. **Donate now** — filled cobalt pill, white text; :active press-down; used in nav (sticky mini pill), hero chapter, donate section, final CTA. One intent, one label.
2. **Follow the mission** — text link with underline slide-in; hero + final CTA; scrolls to the follow section.
3. **Chapter route** — engine's chapter buttons (journey progress controls).
4. Language switcher — segmented EN/FR/AR pill, live switch with Arabic RTL.
5. Social marks — Instagram/TikTok/YouTube inline SVGs, hover opacity.
6. Before/after + QR slots — clearly marked placeholders, no fake data.