/**
 * Scene data for the scroll-scrub journey.
 *
 * Single-shot journey (the default): the whole story is ONE continuous film,
 * scrubbed end to end by scroll. This file maps the film to its hero chapter;
 * the beats that follow (problem, mission, people, future) are the semantic
 * sections of the page that come after the journey.
 *
 * Keep the exports module constants: changing their identity on every render
 * would rebuild the media controller.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";
import { dictionaries, type Dict, type Lang } from "@/lib/i18n";

/** Brand tokens for the journey layer (Sidi Bou Said palette). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#1E4E8C",
  background: "#F7F5EF",
  ink: "#101D31",
  muted: "#43506A",
};

function buildHeroScene(copy: Dict["journey"]): ScrollScrubScene[] {
  const hero = copy[0];
  return [
    {
      body: hero.body,
      clip: "/assets/world/scene-01.mp4",
      id: "scene-01",
      kicker: hero.kicker,
      label: hero.label,
      linger: 0.12,
      mobileClip: "/assets/world/scene-01-mobile.mp4",
      mobilePoster: "/assets/world/scene-01-mobile-poster.png",
      poster: "/assets/world/scene-01-poster.png",
      scroll: 2,
      title: hero.title,
    },
  ];
}

export const scrollScrubScenes: Record<Lang, ScrollScrubScene[]> = {
  en: buildHeroScene(dictionaries.en.journey),
  fr: buildHeroScene(dictionaries.fr.journey),
  ar: buildHeroScene(dictionaries.ar.journey),
};