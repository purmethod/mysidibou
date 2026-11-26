/**
 * mysidibou: the calm landing, the story line and the call to take part.
 *
 * The visitor lands on an almost empty page. A thin line starts and runs down
 * through the whole story: first the history of the village, then the
 * mission. Stations alternate left and right on wide screens and fade in
 * softly while scrolling. On phones the line runs along the side.
 */
import { useEffect, useRef, useState } from "react";

import { site } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { story, type Station } from "@/lib/story";
import { commitmentIcons, MissionIcon } from "./hero";
import { HeartIcon, SealIcon } from "./ui";

/** Adds "is-in" once the element scrolls into view (hidden only after JS runs). */
function useSoftReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"static" | "waiting" | "in">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setState("in");
      return;
    }
    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("in");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, className: state === "waiting" ? "is-waiting" : state === "in" ? "is-in" : "" };
}

/** Existing copy may still carry long dashes; the story never shows them. */
function plain(text: string) {
  return text.replace(/\s*[—–]\s*/g, ", ");
}

/* ------------------------------------------------------------------ */
/* Landing: quiet, almost empty                                        */
/* ------------------------------------------------------------------ */

export function IntroSection() {
  const { dict, lang } = useI18n();
  const copy = story[lang];
  return (
    <section className="story-intro" aria-labelledby="story-intro-title">
      <div className="story-intro__copy">
        <p className="story-intro__kicker">{dict.journey[0].kicker}</p>
        <h1 className="story-intro__title" id="story-intro-title" lang="en" dir="ltr">
          The World’s Most Beautiful Village.
        </h1>
        <p className="story-intro__line">{copy.intro.line}</p>
      </div>
      <a className="story-intro__scroll" href="#story">
        <span>{copy.intro.scroll}</span>
      </a>
      <span className="story-intro__rule" aria-hidden="true" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* One station on the line                                             */
/* ------------------------------------------------------------------ */

function StationItem({ station, side }: { station: Station; side: "start" | "end" }) {
  const { dict, lang } = useI18n();
  const copy = story[lang];
  const reveal = useSoftReveal<HTMLLIElement>();
  const [open, setOpen] = useState(false);
  const moreText = station.more ? plain(station.more(dict)) : "";

  return (
    <li
      ref={reveal.ref}
      className={`station station--${side} ${station.photo ? "has-photo" : "no-photo"} ${station.future ? "is-future" : ""} ${reveal.className}`}
    >
      <span className="station__dot" aria-hidden="true" />
      {station.photo ? (
        <figure className="station__media">
          <img src={station.photo} alt={station.alt ?? ""} width="720" height="720" loading="lazy" decoding="async" />
        </figure>
      ) : null}
      <div className="station__body">
        <p className="station__date">{station.date}</p>
        {station.title ? <h3 className="station__title">{station.title}</h3> : null}
        <p className="station__text">{station.text}</p>

        {station.extra === "role" ? (
          <p className="station__badge" lang="en" dir="ltr">
            <SealIcon className="station__badge-icon" />
            <span>
              <strong>Official Member of the Scientific Committee</strong>
              <span className="station__badge-report">UNESCO Report 2027</span>
            </span>
          </p>
        ) : null}

        {station.extra === "commitments" ? (
          <ul className="station__commitments">
            {dict.homeHero.commitments.map((commitment, index) => (
              <li key={commitmentIcons[index]}>
                <MissionIcon name={commitmentIcons[index]} />
                <span>
                  {commitment.first} {commitment.second}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {station.extra === "ticket" ? (
          <a className="station__link" href="#contribution">
            {copy.howLink}
          </a>
        ) : null}

        {moreText ? (
          <>
            {open ? (
              <div className="station__more">
                {moreText.split(/\n\n+/).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            <button
              aria-expanded={open}
              className="station__toggle"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              {open ? copy.readLess : copy.readMore}
            </button>
          </>
        ) : null}
      </div>
    </li>
  );
}

function Chapter({ label, id }: { label: string; id?: string }) {
  const reveal = useSoftReveal<HTMLDivElement>();
  return (
    <div ref={reveal.ref} className={`story-chapter ${reveal.className}`} id={id}>
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The line                                                            */
/* ------------------------------------------------------------------ */

export function StorySection() {
  const { lang } = useI18n();
  const copy = story[lang];
  const sideOf = (n: number) => (n % 2 === 0 ? "start" : "end");

  return (
    <section className="story" id="story" aria-label={copy.nav.story}>
      <div className="story__track">
      <Chapter label={copy.chapters.village} />
      <ol className="story__list">
        {copy.history.map((station, i) => (
          <StationItem key={`h${i}`} station={station} side={sideOf(i)} />
        ))}
      </ol>
      <Chapter label={copy.chapters.mission} id="mission" />
      <ol className="story__list">
        {copy.mission.map((station, i) => (
          <StationItem key={`m${i}`} station={station} side={sideOf(copy.history.length + i)} />
        ))}
      </ol>
      <span className="story__end" aria-hidden="true" />
      </div>
      <p className="story__credit">{copy.credit}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* After the line: take part                                           */
/* ------------------------------------------------------------------ */

export function ParticipateSection() {
  const { dict } = useI18n();
  const copy = dict.homeHero;
  return (
    <section className="story-participate" aria-labelledby="participate-title">
      <div className="story-participate__inner hero-mission__participate">
        <p className="hero-mission__eyebrow">{copy.yourRole}</p>
        <h2 id="participate-title">{copy.participate}</h2>
        <p className="hero-mission__invitation">{copy.invitation}</p>
        <div className="hero-mission__actions">
          <a className="hero-mission__support" data-action="support" href={site.donate.link}>
            <HeartIcon />
            <span>{dict.cta.donate}</span>
          </a>
          <a data-action="like" href={site.social.instagramMissionReel} rel="noopener noreferrer" aria-label={copy.likeLabel}>
            <MissionIcon name="like" />
            <span>{copy.like}</span>
          </a>
          <a data-action="share" href={site.social.instagramMissionReel} rel="noopener noreferrer" aria-label={copy.shareLabel}>
            <MissionIcon name="share" />
            <span>{copy.share}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stories from the mission: after the line, not on it                 */
/* ------------------------------------------------------------------ */

export function PostsSection() {
  const { lang } = useI18n();
  const copy = story[lang];
  return (
    <section className="story-posts" aria-label={copy.chapters.mission}>
      <ol className="story__list">
        {copy.posts.map((station, i) => (
          <StationItem key={`p${i}`} station={station} side={i % 2 === 0 ? "start" : "end"} />
        ))}
      </ol>
    </section>
  );
}
