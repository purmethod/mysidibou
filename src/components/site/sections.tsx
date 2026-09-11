/**
 * mysidibou — the story sections that follow the scroll journey.
 * Layout families are deliberately varied (statement, rows, split, band,
 * panel, hairline list, stat grid, full-bleed, social strip, finale).
 */
import type { ReactNode } from "react";

import { site } from "@/config/site";
import { useI18n } from "@/lib/i18n";
import { DonateButton, FollowLink, HeartIcon, Reveal, socialIcons } from "./ui";

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function Section({
  id,
  className = "",
  style,
  children,
}: {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <section id={id} className={className} style={style}>
      <div className="mx-auto w-full max-w-6xl px-[1.25rem] md:px-10">{children}</div>
    </section>
  );
}

function Headline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`section-headline text-4xl md:text-6xl ${className}`}>{children}</h2>
  );
}

/* ------------------------------------------------------------------ */
/* Mission marquee — one typographic rhythm band after the journey     */
/* ------------------------------------------------------------------ */

export function MarqueeSection() {
  const { dict } = useI18n();
  const phrase = dict.marquee;
  return (
    <div aria-hidden="true" className="marquee">
      <div className="marquee__track">
        {[0, 1].map((group) => (
          <div className="marquee__group" key={group}>
            {[0, 1, 2, 3].map((i) => (
              <span className="marquee__phrase" key={i}>
                {phrase}
                <HeartIcon className="marquee__heart" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The problem — a quiet statement                                     */
/* ------------------------------------------------------------------ */

export function ProblemSection() {
  const { dict } = useI18n();
  return (
    <Section className="section-pad">
      <Reveal>
        <p className="section-headline statement text-4xl md:text-6xl">
          {dict.problem.headline}
        </p>
      </Reveal>
      <div className="mt-14 grid max-w-3xl gap-1 md:grid-cols-2">
        {dict.problem.lines.map((line, i) => (
          <Reveal delay={((i % 2) + 1) as 1 | 2} key={line}>
            <p className="font-display text-2xl italic text-ink-soft md:text-3xl">{line}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* The mission — numbered rows                                         */
/* ------------------------------------------------------------------ */

export function MissionSection() {
  const { dict } = useI18n();
  return (
    <Section id="mission" className="section-pad hairline-t">
      <Reveal>
        <Headline>{dict.mission.headline}</Headline>
        <p className="section-copy mt-6 text-base md:text-lg">{dict.mission.sub}</p>
      </Reveal>
      <div className="mt-12 max-w-3xl">
        {dict.mission.rows.map((row, i) => (
          <Reveal delay={i === 0 ? 1 : (i + 1) as 1 | 2 | 3} key={row}>
            <div className="mission-row">
              <span className="mission-row__n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-xl md:text-2xl">{row}</p>
            </div>
          </Reveal>
        ))}
        <Reveal delay={1}>
          <p className="section-copy mt-10 text-sm md:text-base">{dict.mission.footer}</p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* The people — split: students                                        */
/* ------------------------------------------------------------------ */

export function PeopleSection() {
  const { dict } = useI18n();
  return (
    <Section id="people" className="section-pad">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal>
          <div className="split-media aspect-[4/3] w-full">
            <img
              alt="Architecture students of Sidi Bou Said measuring and drawing a street plan"
              className="h-full w-full object-cover"
              loading="lazy"
              src={site.media.students}
            />
          </div>
        </Reveal>
        <div>
          <Reveal delay={1}>
            <Headline>{dict.people.headline}</Headline>
          </Reveal>
          <Reveal delay={2}>
            <p className="section-copy mt-6 text-base md:text-lg">{dict.people.body}</p>
          </Reveal>
          <Reveal delay={2}>
            <p className="section-copy mt-4 text-base md:text-lg">{dict.people.body2}</p>
          </Reveal>
          <Reveal delay={3}>
            <ul className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-2">
              {dict.people.goals.map((goal) => (
                <li className="border-l-2 border-cobalt pl-3 text-sm text-ink-soft" key={goal}>
                  {goal}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Team — circular photo slots, placeholders until real members        */
/* ------------------------------------------------------------------ */

function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.9 20c1-3.5 3.9-5.4 7.1-5.4s6.1 1.9 7.1 5.4" />
    </svg>
  );
}

export function TeamSection() {
  const { dict } = useI18n();
  return (
    <Section id="team" className="section-pad hairline-t">
      <Reveal>
        <Headline>{dict.team.headline}</Headline>
        <p className="section-copy mt-6 text-base md:text-lg">{dict.team.body}</p>
      </Reveal>
      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
        {site.team.map((member, i) => (
          <Reveal delay={((i % 3) + 1) as 1 | 2 | 3} key={i}>
            <div className="team-member">
              {member.photo ? (
                <img
                  alt={member.name}
                  className="team-member__photo"
                  loading="lazy"
                  src={member.photo}
                />
              ) : (
                <div className="team-member__photo team-member__photo--placeholder">
                  <PersonIcon />
                </div>
              )}
              <p className="team-member__name">{member.name}</p>
              {member.instagram ? (
                <a
                  className="team-member__insta"
                  href={`https://instagram.com/${member.instagram.replace(/^@/, "")}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {member.instagram}
                </a>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Cleaning — full-bleed image band                                    */
/* ------------------------------------------------------------------ */

export function CleaningSection() {
  const { dict } = useI18n();
  return (
    <section className="relative isolate min-h-[72dvh] overflow-hidden">
      <img
        alt="Volunteer hands picking up plastic and cigarette butts from the cobblestones"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        src={site.media.cleaning}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-cobalt-night/85 via-cobalt-night/45 to-transparent"
      />
      <div className="relative mx-auto flex min-h-[72dvh] w-full max-w-6xl items-end px-[1.25rem] pb-16 pt-32 md:px-10 md:pb-20">
        <Reveal>
          <h2 className="section-headline max-w-2xl text-4xl text-paper md:text-7xl">
            {dict.cleaning.headline}
          </h2>
          <p className="mt-6 max-w-xl text-base text-paper/90 md:text-lg">{dict.cleaning.body}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Local life — reversed split                                         */
/* ------------------------------------------------------------------ */

export function LocalsSection() {
  const { dict } = useI18n();
  return (
    <Section className="section-pad">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <Reveal>
            <Headline>{dict.locals.headline}</Headline>
          </Reveal>
          <Reveal delay={1}>
            <p className="section-copy mt-6 text-base md:text-lg">{dict.locals.body}</p>
          </Reveal>
        </div>
        <Reveal className="order-1 lg:order-2">
          <div className="split-media aspect-[4/3] w-full">
            <img
              alt="A flower seller at her stand in a white street of Sidi Bou Said"
              className="h-full w-full object-cover"
              loading="lazy"
              src={site.media.flowerSeller}
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Entrance concept — landscape split with a principle quote           */
/* ------------------------------------------------------------------ */

export function EntranceSection() {
  const { dict } = useI18n();
  return (
    <Section className="section-pad hairline-t">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Reveal>
          <div className="split-media aspect-[16/10] w-full">
            <img
              alt="Bougainvillea and jasmine beginning to climb a light trellis on a white wall"
              className="h-full w-full object-cover"
              loading="lazy"
              src={site.media.entrance}
            />
          </div>
        </Reveal>
        <div>
          <Reveal delay={1}>
            <Headline>{dict.entrance.headline}</Headline>
          </Reveal>
          <Reveal delay={2}>
            <p className="section-copy mt-6 text-base md:text-lg">{dict.entrance.body}</p>
          </Reveal>
          <Reveal delay={3}>
            <p className="font-display mt-8 max-w-md border-l-2 border-cobalt pl-4 text-2xl italic leading-[1.15]">
              We create the conditions. Nature creates the architecture.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Visitor contribution — tinted panel, three columns                  */
/* ------------------------------------------------------------------ */

export function ContributionSection() {
  const { dict } = useI18n();
  return (
    <section className="bg-paper-deep">
      <Section className="section-pad">
        <Reveal>
          <Headline>{dict.contribution.headline}</Headline>
        </Reveal>
        <Reveal delay={1}>
          <p className="section-copy mt-6 text-base md:text-lg">{dict.contribution.body}</p>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <Reveal delay={1}>
            <p className="eyebrow">Tunisian visitors</p>
            <p className="mt-3 text-lg">Remain free. Always.</p>
          </Reveal>
          <Reveal delay={2}>
            <p className="eyebrow">International visitors</p>
            <p className="mt-3 text-lg">Contribute to the preservation of the town.</p>
          </Reveal>
          <Reveal delay={3}>
            <p className="eyebrow">The money returns here</p>
            <ul className="mt-3 space-y-1 text-lg">
              {dict.contribution.returns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal>
          <p className="mt-10 text-sm text-ink-soft">{dict.contribution.note}</p>
        </Reveal>
      </Section>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Transparency — hairline list                                        */
/* ------------------------------------------------------------------ */

export function TransparencySection() {
  const { dict } = useI18n();
  return (
    <Section id="transparency" className="section-pad">
      <Reveal>
        <Headline>{dict.transparency.headline}</Headline>
        <p className="section-copy mt-6 text-base md:text-lg">{dict.transparency.body}</p>
      </Reveal>
      <div className="mt-12 max-w-3xl">
        {dict.transparency.rows.map((row, i) => (
          <Reveal delay={(i % 2) === 0 ? 1 : 2} key={row.label}>
            <div className="alloc-row">
              <p className="text-lg md:text-xl">{row.label}</p>
              <span className="alloc-row__note">{row.note}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-8 inline-flex items-center gap-3 text-sm text-ink-soft">
          <span className="placeholder-chip">{dict.progress.comingSoon}</span>
          {dict.transparency.honesty}
        </p>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Progress — honest placeholders until the first public report        */
/* ------------------------------------------------------------------ */

export function ProgressSection() {
  const { dict } = useI18n();
  return (
    <Section id="progress" className="section-pad hairline-t">
      <Reveal>
        <Headline>{dict.progress.headline}</Headline>
        <p className="section-copy mt-6 text-base md:text-lg">{dict.progress.body}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {site.stats.map((stat, i) => (
          <Reveal delay={((i % 3) + 1) as 1 | 2 | 3} key={dict.progress.statLabels[i]}>
            <div className="stat-cell">
              <p className="stat-cell__value">{stat.value}</p>
              <p className="stat-cell__label">{dict.progress.statLabels[i]}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          {site.media.beforeAfter.before ? (
            <img alt="Before" className="aspect-[4/3] w-full object-cover" src={site.media.beforeAfter.before} />
          ) : (
            <div className="grid aspect-[4/3] w-full place-items-center border border-dashed border-cobalt/40 p-6 text-center">
              <span className="text-sm text-cobalt">{dict.progress.beforeAfter}</span>
            </div>
          )}
          {site.media.beforeAfter.after ? (
            <img alt="After" className="aspect-[4/3] w-full object-cover" src={site.media.beforeAfter.after} />
          ) : (
            <div className="grid aspect-[4/3] w-full place-items-center border border-dashed border-cobalt/40 p-6 text-center">
              <span className="text-sm text-cobalt">{dict.progress.beforeAfter}</span>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* UNESCO — thin, elegant band                                         */
/* ------------------------------------------------------------------ */

export function UnescoSection() {
  const { dict } = useI18n();
  return (
    <section className="bg-paper-deep">
      <Section className="section-pad text-center">
        <Reveal>
          <p className="font-display mx-auto max-w-3xl text-3xl leading-[1.1] md:text-5xl">
            {dict.unesco.headline}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-ink-soft md:text-lg">
            {dict.unesco.body}
          </p>
        </Reveal>
      </Section>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 500 years — full-bleed historic frame                               */
/* ------------------------------------------------------------------ */

export function FiveHundredSection() {
  const { dict } = useI18n();
  return (
    <section className="relative isolate min-h-[92dvh] overflow-hidden">
      <img
        alt="Archival sepia view of Sidi Bou Said, circa 1950"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        src={site.media.historic}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-cobalt-night/80 via-cobalt-night/35 to-cobalt-night/10"
      />
      <div className="relative mx-auto flex min-h-[92dvh] w-full max-w-6xl flex-col justify-end px-[1.25rem] pb-16 pt-32 md:px-10 md:pb-24">
        <Reveal>
          <p className="section-headline text-5xl text-paper md:text-8xl">
            {dict.fiveHundred.years[0]}
          </p>
          <p className="section-headline mt-1 text-5xl text-paper md:text-8xl">
            {dict.fiveHundred.years[1]}
          </p>
          <p className="section-headline mt-1 text-5xl text-paper md:text-8xl">
            {dict.fiveHundred.years[2]}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <p className="font-display mt-10 max-w-2xl text-2xl italic leading-[1.15] text-paper/95 md:text-4xl">
            {dict.fiveHundred.line}
          </p>
          <p className="mt-4 text-sm text-paper/75">{dict.fiveHundred.footnote}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Follow — social strip                                               */
/* ------------------------------------------------------------------ */

export function FollowSection() {
  const { dict } = useI18n();
  const { social } = site;

  const platforms = [
    {
      key: "instagram" as const,
      href: social.instagram,
      handle: social.instagramHandle,
    },
    {
      key: "tiktok" as const,
      href: social.tiktok,
      handle: social.tiktokHandle,
    },
    {
      key: "youtube" as const,
      href: social.youtube,
      handle: social.youtubeHandle,
    },
  ];

  return (
    <Section id="follow" className="section-pad">
      <Reveal>
        <Headline>{dict.follow.headline}</Headline>
        <p className="section-copy mt-6 text-base md:text-lg">{dict.follow.body}</p>
      </Reveal>
      <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-12">
        {platforms.map((platform, i) => {
          const Icon = socialIcons[platform.key];
          const ready = Boolean(platform.href);
          return (
            <Reveal delay={(i + 1) as 1 | 2 | 3} key={platform.key}>
              {ready ? (
                <a
                  aria-label={`${platform.key} ${platform.handle}`}
                  className="social-link"
                  href={platform.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon />
                  {platform.handle}
                </a>
              ) : (
                <span className="social-link" aria-disabled="true">
                  <Icon />
                  {platform.handle}
                  <span className="placeholder-chip">{dict.follow.comingSoon}</span>
                </span>
              )}
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Donate section — one tap on mobile, QR option on desktop            */
/* ------------------------------------------------------------------ */

export function DonateSection() {
  const { dict } = useI18n();
  const { donate } = site;
  return (
    <Section id="donate" className="section-pad hairline-t">
      <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Reveal>
            <Headline>{dict.donateSection.headline}</Headline>
            <p className="section-copy mt-6 text-base md:text-lg">{dict.donateSection.body}</p>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-9 flex flex-wrap items-center gap-7">
              <DonateButton wide />
              <p className="max-w-[22rem] text-sm text-ink-soft">{dict.donateSection.linkSoon}</p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <p className="mt-6 text-xs text-ink-soft">{dict.donateSection.trust}</p>
          </Reveal>
          <Reveal delay={2}>
            <div className="mt-10 border-t border-line pt-6">
              <p className="eyebrow">{dict.donateSection.whyTitle}</p>
              <ul className="mt-4 space-y-3">
                {dict.donateSection.why.map((item) => (
                  <li className="flex items-start gap-3 text-base text-ink md:text-lg" key={item}>
                    <HeartIcon className="why-heart" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={2}>
          <div className="hidden flex-col items-start gap-3 md:flex">
            {donate.qrImage ? (
              <img
                alt={donate.qrAlt}
                className="size-[148px] border border-line object-contain"
                src={donate.qrImage}
              />
            ) : (
              <div className="qr-tile">
                <span className="qr-tile__label">{dict.donateSection.qrSoon}</span>
              </div>
            )}
            <p className="max-w-[220px] text-xs text-ink-soft">{dict.donateSection.body}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Finale — deep Sidi Bou Said blue                                    */
/* ------------------------------------------------------------------ */

export function FinaleSection() {
  const { dict } = useI18n();
  return (
    <section className="finale">
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-6xl flex-col items-start justify-center px-[1.25rem] py-24 md:px-10">
        <Reveal>
          <h2 className="section-headline max-w-4xl text-4xl text-paper md:text-7xl">
            {dict.finale.headline}
          </h2>
        </Reveal>
        <Reveal delay={1}>
          <p className="mt-7 text-xl text-paper/90 md:text-2xl">{dict.finale.sub}</p>
        </Reveal>
        <Reveal delay={2}>
          <div className="chapter-actions mt-10">
            <DonateButton light wide />
            <FollowLink onBlue />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function FooterSection() {
  const { dict } = useI18n();
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-[1.25rem] py-16 md:grid-cols-2 md:px-10">
        <div>
          <p className="font-display text-3xl font-semibold">mysidibou</p>
          <p className="mt-3 max-w-sm text-sm text-ink-soft">{dict.footer.missionLine}</p>
          <p className="mt-6 font-display text-lg italic text-cobalt">{dict.footer.tagline}</p>
        </div>
        <div className="flex flex-col items-start justify-between gap-6 md:items-end">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2">
            {(["mission", "people", "team", "progress", "transparency"] as const).map((key) => (
              <a className="site-nav__link" href={`#${key}`} key={key}>
                {dict.nav[key]}
              </a>
            ))}
            <a className="site-nav__link" href="#donate">
              {dict.nav.donate}
            </a>
          </nav>
          <div className="text-right text-xs leading-relaxed text-ink-soft">
            <p>{dict.footer.location}</p>
            <p>{dict.footer.heritage}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}