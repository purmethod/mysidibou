/** The mission is visible on arrival, with direct actions for visitors. */
import type { SVGProps } from "react";
import { site } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { HeartIcon, SealIcon } from "./ui";
import { KompasEntry } from "./kompas-entry";

const commitmentIcons = ["plastic", "cigarette", "environment", "nature"] as const;
type MissionIconName = typeof commitmentIcons[number] | "like" | "share";

function MissionIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: MissionIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {name === "plastic" && <><path d="M10 2h4v4l3 4v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10l3-4V2zM9 13h6M9 17h6M10 5h4" /><path className="hero-mission__slash" d="M3 21 21 3" strokeWidth="2" /></>}
      {name === "cigarette" && <><path d="M3 13h15v5H3zM13 13v5M20 13v5M22 13v5M15 3c-3 3 3 3 0 6M19 2c-3 3 3 3 0 6" /><path className="hero-mission__slash" d="M2 22 22 2" strokeWidth="2" /></>}
      {name === "environment" && <><path d="M12 21v-8M12 16C6 16 3 13 3 8c6 0 9 3 9 8ZM12 13c0-5 3-8 9-8 0 5-3 8-9 8ZM3 22h18" /><circle cx="6" cy="3" r="1.5" /></>}
      {name === "nature" && <path d="M4 18C1 7 10 4 21 3c1 10-3 18-13 17M4 22 17 9M9 17v-6M10 16h6" />}
      {name === "like" && <path d="M7 10h-4v11h4M7 20c3 1 5 1 8 1h3a2 2 0 0 0 2-1.7l1-7A2 2 0 0 0 19 10h-5l1-5c.3-2-2-3-3-1L7 11z" />}
      {name === "share" && <><circle cx="18" cy="4" r="3" /><circle cx="5" cy="12" r="3" /><circle cx="18" cy="20" r="3" /><path d="m8 10 7-4M8 14l7 4" /></>}
    </svg>
  );
}

export function HeroSection() {
  const { dict } = useI18n();
  const copy = dict.homeHero;
  return (
    <section className="hero hero--mission" aria-labelledby="home-mission-title">
      <div className="hero-mission__copy">
        <div className="hero-mission__intro">
          <p className="hero-mission__location">{dict.journey[0].kicker}</p>
          <p className="hero-mission__tagline" lang="en" dir="ltr">The World’s Most Beautiful Village.</p>
        </div>
        <div className="hero-mission__layout">
          <div className="hero-mission__roles">
            <div className="hero-mission__work">
              <p className="hero-mission__eyebrow">{copy.ourRole}</p>
              <p className="hero-mission__identity">{copy.identity}</p>
              <h1 className="hero-mission__responsibility" id="home-mission-title">
                {copy.responsibility.join(" ")}
              </h1>
              <p className="hero-mission__work-line">{copy.work}</p>
              <p className="hero-mission__community">{copy.community}</p>
            </div>
            <p className="hero-mission__statement">{copy.mission}</p>
          </div>
          <aside className="hero-mission__guide" aria-label="Discover Sidi Bou">
            <KompasEntry />
          </aside>
        </div>
        <div className="hero-mission__participate">
          <p className="hero-mission__eyebrow">{copy.yourRole}</p>
          <h2>{copy.participate}</h2>
          <p className="hero-mission__invitation">{copy.invitation}</p>
          <div className="hero-mission__actions">
            <a className="hero-mission__support" data-action="support" href={site.donate.link}><HeartIcon /><span>{dict.cta.donate}</span></a>
            {/* Let the OS handle the directly tapped Instagram link without requesting a new tab. */}
            <a data-action="like" href={site.social.instagramMissionReel} rel="noopener noreferrer" aria-label={copy.likeLabel}><MissionIcon name="like" /><span>{copy.like}</span></a>
            <a data-action="share" href={site.social.instagramMissionReel} rel="noopener noreferrer" aria-label={copy.shareLabel}><MissionIcon name="share" /><span>{copy.share}</span></a>
          </div>
        </div>
        <div className="hero-mission__impact">
          <ul className="hero-mission__commitments">
            {copy.commitments.map((commitment, index) => (
              <li key={commitmentIcons[index]}>
                <MissionIcon name={commitmentIcons[index]} />
                <p><strong>{commitment.first}</strong><span>{commitment.second}</span></p>
              </li>
            ))}
          </ul>
          <p className="hero__badge" lang="en" dir="ltr">
            <SealIcon className="hero__badge-icon" />
            <span><strong>Official Member of the Scientific Committee</strong>{" "}<span className="hero__badge-report">UNESCO Report 2027</span></span>
          </p>
        </div>
        <a className="hero-mission__discover" href="#mission">{copy.discover}<span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
