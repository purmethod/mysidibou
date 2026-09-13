/**
 * Shared mysidibou UI primitives.
 * All entrance motion is transform-only and screenshot-safe; reveals never
 * animate opacity to zero.
 */
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";

import { site } from "@/config/site";
import { useI18n } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Donation link handling                                              */
/* ------------------------------------------------------------------ */

export function useDonation() {
  const raw = site.donate.link.trim();
  const configured = raw.length > 0 && !raw.startsWith("[DONATION_LINK]");
  return { configured, href: configured ? raw : "#donate" };
}

/* ------------------------------------------------------------------ */
/* Reveal — transform-only scroll entrance                             */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass = delay === 0 ? "" : `reveal-delay-${delay}`;

  return (
    <div ref={ref} className={`reveal ${inView ? "is-in" : ""} ${delayClass} ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CTAs — each with its own interaction identity                       */
/* ------------------------------------------------------------------ */

export function DonateButton({
  wide = false,
  light = false,
  className = "",
}: {
  wide?: boolean;
  light?: boolean;
  className?: string;
}) {
  const { dict } = useI18n();
  const { configured, href } = useDonation();

  const classes = [
    "btn-donate",
    light ? "btn-donate--light" : "",
    wide ? "btn-donate--wide" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (configured) {
    return (
      <a className={classes} href={href}>
        {dict.cta.donate}
      </a>
    );
  }

  // Placeholder link: never fake a payment flow. Scroll to the donate
  // section, which explains that the secure link opens soon.
  return (
    <a className={classes} href="#donate">
      {dict.cta.donate}
    </a>
  );
}

export function FollowLink({
  onBlue = false,
  className = "",
}: {
  onBlue?: boolean;
  className?: string;
}) {
  const { dict } = useI18n();
  const classes = [
    "btn-follow",
    onBlue ? "btn-follow--on-blue" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} href="#follow">
      {dict.cta.follow}
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Social brand glyphs (minimal geometric marks)                       */
/* ------------------------------------------------------------------ */

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}>
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3c.35 1.85 1.4 3.3 3.4 3.55v2.7c-1.3.06-2.5-.35-3.4-1.05v6.1c0 3.45-2.7 5.7-5.75 5.7-2.95 0-5.35-2.25-5.35-5.15 0-3.05 2.7-5.3 5.8-5.1v2.8c-1.6-.3-3 .55-3 2.35 0 1.55 1.05 2.5 2.5 2.5 1.55 0 2.55-1.05 2.55-2.7V3h2.25z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.2 9.4l4.6 2.6-4.6 2.6z" fill="currentColor" />
    </svg>
  );
}

export const socialIcons = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
};

/* The brand heart mark (nav wordmark, donate pill, marquee). */
export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/* Thin reading-progress bar under the nav (transform-only). */
export function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.setProperty("--scroll-progress", String(progress));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div aria-hidden="true" className="scroll-progress">
      <span ref={barRef} />
    </div>
  );
}