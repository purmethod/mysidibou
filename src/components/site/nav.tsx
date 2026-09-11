/**
 * mysidibou navigation: fixed wordmark bar, section links, language
 * switcher and the sticky donate pill that appears while scrolling.
 * On phones the links collapse into a burger menu.
 */
import { useEffect, useState } from "react";

import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { HeartIcon, useDonation } from "./ui";

const anchors = [
  { key: "mission", href: "#mission" },
  { key: "people", href: "#people" },
  { key: "team", href: "#team" },
  { key: "progress", href: "#progress" },
  { key: "transparency", href: "#transparency" },
] as const;

export function LanguageSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((item) => (
        <button
          aria-current={lang === item.code ? "true" : undefined}
          key={item.code}
          onClick={() => setLang(item.code as Lang)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function SiteNav() {
  const { dict } = useI18n();
  const { configured, href } = useDonation();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const donateHref = configured ? href : "#donate";

  return (
    <header className={`site-nav ${solid || open ? "is-solid" : ""}`}>
      <a className="site-nav__wordmark" href="#top" aria-label="mysidibou">
        mysidibou
        <HeartIcon className="wordmark-heart" />
      </a>

      <div className="site-nav__right">
        <nav aria-label="Primary" className="site-nav__links">
          {anchors.map((item) => (
            <a className="site-nav__link" href={item.href} key={item.key}>
              {dict.nav[item.key]}
            </a>
          ))}
          <LanguageSwitch />
          <a className="site-nav__link site-nav__link--donate" href={donateHref}>
            {dict.nav.donate}
          </a>
        </nav>

        <button
          aria-controls="site-nav-menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className={`site-nav__burger ${open ? "is-open" : ""}`}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="site-nav__menu"
          id="site-nav-menu"
        >
          {anchors.map((item) => (
            <a
              className="site-nav__menu-link"
              href={item.href}
              key={item.key}
              onClick={() => setOpen(false)}
            >
              {dict.nav[item.key]}
            </a>
          ))}
          <div className="site-nav__menu-foot">
            <LanguageSwitch />
            <a
              className="site-nav__link site-nav__link--donate"
              href={donateHref}
              onClick={() => setOpen(false)}
            >
              {dict.nav.donate}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function DonatePill() {
  const { dict } = useI18n();
  const { configured, href } = useDonation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      aria-hidden={!visible}
      className={`donate-pill ${visible ? "is-visible" : ""}`}
      href={configured ? href : "#donate"}
      tabIndex={visible ? 0 : -1}
    >
      <HeartIcon className="donate-pill__heart" />
      {dict.nav.donate}
    </a>
  );
}