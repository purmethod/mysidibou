/**
 * mysidibou navigation: fixed wordmark bar, language switcher beside the
 * logo (always visible, incl. mobile), section links, and the sticky donate
 * pill that appears while scrolling.
 */
import { useEffect, useState } from "react";

import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { story } from "@/lib/story";
import { BrandWordmark, HeartIcon, useDonation } from "./ui";

const anchors = [
  { key: "story", href: "#story" },
  { key: "team", href: "#team" },
  { key: "how", href: "#contribution" },
  { key: "transparency", href: "#transparency" },
] as const;


export function LanguageSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((item) => (
        <button
          aria-current={lang === item.code ? "true" : undefined}
          className={lang === item.code ? "is-active" : undefined}
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
  const { dict, lang } = useI18n();
  const label = (key: (typeof anchors)[number]["key"]) =>
    key === "story" ? story[lang].nav.story : key === "how" ? story[lang].nav.how : dict.nav[key];
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
      <div className="site-nav__left">
        <a className="site-nav__wordmark" href="#top" aria-label="mysidibou">
          <BrandWordmark />
        </a>
        <LanguageSwitch />
      </div>

      <div className="site-nav__right">
        <nav aria-label="Primary" className="site-nav__links">
          {anchors.map((item) => (
            <a className="site-nav__link" href={item.href} key={item.key}>
              {label(item.key)}
            </a>
          ))}
          <a className="site-nav__link" href="/kompas">
            {story[lang].nav.explore}
          </a>
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
        <nav aria-label="Mobile" className="site-nav__menu" id="site-nav-menu">
          {anchors.map((item) => (
            <a
              className="site-nav__menu-link"
              href={item.href}
              key={item.key}
              onClick={() => setOpen(false)}
            >
              {label(item.key)}
            </a>
          ))}
          <a className="site-nav__menu-link site-nav__menu-link--explore" href="/kompas" onClick={() => setOpen(false)}>
            <img src="/kompas/compaz-mark.webp" width="144" height="147" alt="" decoding="async" />
            <span>{story[lang].nav.explore}</span>
          </a>
          <div className="site-nav__menu-foot">
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
    const onScroll = () => setVisible(window.scrollY > 24);
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
