# mysidibou

Turning **Sidi Bou Said** into the cleanest city in Tunisia. Students, locals and architecture working together to preserve a UNESCO World Heritage Site (inscribed 2026).

Live: https://mysidibou.higgsfield.app

## Stack

- React 19 + TanStack Start (SSR)
- Tailwind CSS v4
- Self-hosted fonts: Cormorant Garamond (display) + Outfit (body)
- Languages: English (default), Français, العربية (RTL)

## Project structure

| Path | What lives there |
| --- | --- |
| `src/config/site.ts` | Everything editable in one place: donation link, QR code, socials, photographs, statistics, team |
| `src/lib/i18n.tsx` | All page copy in EN / FR / AR |
| `src/components/site/` | Hero, navigation, story sections, team, footer |
| `src/routes/index.tsx` | Page composition |

## Editing basics

- Replace the donation link, QR image, social handles, team members and statistics in `src/config/site.ts` — the site updates everywhere at once.
- Swap any photograph by replacing the file in `public/assets/` and updating its path in the same config.
- Change copy in `src/lib/i18n.tsx` (find the language section you need).

## Run locally

```bash
bun install
bun run dev
```

Note: this export contains the complete source of the website. The build on the originating platform additionally provides vendored platform packages (`packages/`), which are not part of this repository.

## Brand

- Brand name is always written exactly like this: `mysidibou` (all lowercase).
- Colors: limewash white `#F7F5EF`, Sidi Bou Said cobalt blue `#1E4E8C`, natural stone, bougainvillea pink in photography.
- No invented statistics, donations or partnerships are ever displayed — placeholders stay until real data arrives.