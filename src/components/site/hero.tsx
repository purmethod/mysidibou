/**
 * Static hero: the first frame of the town, full screen, no video.
 * The film journey was removed on request; the still carries the same
 * emotional opening and loads in a few hundred kilobytes.
 */
import { site } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { DonateButton, FollowLink } from "./ui";

export function HeroSection() {
  const { dict } = useI18n();
  const hero = dict.journey[0];

  return (
    <section className="hero">
      <div aria-hidden="true" className="hero__media">
        <img
          alt="Sidi Bou Said, Tunisia: white limewashed houses above the Mediterranean sea"
          decoding="async"
          fetchPriority="high"
          src={site.media.hero}
        />
      </div>
      <div aria-hidden="true" className="hero__scrim" />
      <div className="hero__copy">
        {hero.kicker ? <p className="hero__kicker">{hero.kicker}</p> : null}
        <h1 className="hero__title">{hero.title}</h1>
        <p className="hero__body">{hero.body}</p>
        <div className="hero__actions">
          <DonateButton wide />
          <FollowLink />
        </div>
        <p className="hero-line">{dict.heroLine}</p>
      </div>
    </section>
  );
}