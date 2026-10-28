# Greater Tunis source audit

Checked 28 October 2026. Scope: Sidi Bou Saïd, Tunis, Carthage, La Marsa, Gammarth, Ariana and nearby Greater Tunis. This is a researched source registry, not a claim to index the entire internet.

| Source | Method / current scope |
|---|---|
| [Tunis Events · Greater Tunis](https://tunis.events/) | jsonld |
| [Sociale · Sidi Bou Saïd](https://tunis.events/venues/L8JBr8/sociale-sidi-bou-said) | jsonld |
| [Ennejma Ezzahra · CMAM](https://www.cmam.tn/activites/fr.html) | cmam |
| [Teskerti · tickets & screenings](https://teskerti.tn/) | teskerti |
| [Guichet · shows & events](https://guichet.tn/fr) | jsonld |
| [Meeps · Tunis agenda](https://joinmeeps.com/fr/playlist/quoi-faire-a-tunis-e00w0dzv) | jsonld |
| [El Teatro · official programme](https://www.billetterie.elteatrotunis.com/fr/programmes) | elteatro |
| [Art Explora · Tunis programme](https://www.artexplora.org/festival/ville/tunis) | artexplora |
| [Houdou · Dar Kbira yoga retreats](https://www.bookyogaretreats.com/houdou/5-day-mediterranean-yoga-and-meditation-retreat-in-the-heart-of-sidi-bou-said-tunisia) | bookyoga |
| [YogaTribes · Tunisia retreats](https://yogamonde.yogatribes.com/fr/tunisie/) | yogatribes; dated multi-stop retreat including Tunis, clearly labelled |
| [Dar Kbira · retreat programme](https://darkbira.tn/english/retraites-yoga/) | jsonld; monitored public page, no reliably dated import currently available |
| [Institut français de Tunisie](https://www.institutfrancais-tunisie.com/agenda/) | jsonld; monitored public page, no reliably dated import currently available |
| [Goethe-Institut Tunis](https://www.goethe.de/ins/tn/fr/ver.cfm) | ical |
| [L’Agora · La Marsa cinema](https://lagora.tn/programme/) | lagora; published current-day sessions (future tabs are not inferred) |
| [AIO Events · public listings](https://aio.events/events) | aio |
| [Gate Pass · public listings](https://gate-pass.tn/) | jsonld; monitored public page, no reliably dated import currently available |
| [Jaou Tunis · official programme](https://jaou.tn/) | jsonld; monitored public page, no reliably dated import currently available |

## Other researched sources and limits

- Izy: the indexed October 2026 site shows a defacement; excluded from automatic import.
- Institut français, Jaou and Gate Pass: public pages monitored, but no usable dated records in the tested responses. Jaou and IFT listings also appear through Tunis Events / Meeps.
- Dar Kbira: some retreat pages explicitly say dates will be confirmed; these are not fabricated as events. The dated Houdou package is imported separately.
- Tunisian Cinema and CinéMadart: researched for cinema coverage; the current importer uses official L’Agora and Teskerti listings plus dated structured entries in the general calendars.
- Instagram/Facebook: organizer profiles discovered via their public calendars, but private/logged-in feeds and story/poster OCR are not connected.
- Southern-Tunisia-only retreats, Hammamet, Sousse and Djerba events are excluded unless a specifically labelled travel retreat includes Tunis.
- Most calendars publish weeks, not a full year ahead. The collection window is twelve months; publication availability determines actual dates.

## Daily operation

The configured source roots are revisited daily, discovering newly linked programme/event pages within per-source limits. Each source records pages checked, import counts, errors and a timestamp. `monitor_only` means a directory link, not a successfully connected calendar. Schedule: `59 22 * * *` UTC, which is 23:59 in Tunisia. Scheduler delays remain possible.
