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

## Deploy on Vercel

1. Import this repository into Vercel (Add New Project → Import Git Repository). Vercel detects the TanStack Start setup automatically.
2. The build runs `NITRO_PRESET=vercel` (already wired in `package.json`); no extra configuration is needed.
3. Attach your domain under Project → Settings → Domains (`www.mysidibou.com` and/or `mysidibou.com`) and point the DNS records Vercel shows you at your domain registrar.

## Brand

- Brand name is always written exactly like this: `mysidibou` (all lowercase).
- Colors: limewash white `#F7F5EF`, Sidi Bou Said cobalt blue `#1E4E8C`, natural stone, bougainvillea pink in photography.
- No invented statistics, donations or partnerships are ever displayed — placeholders stay until real data arrives.