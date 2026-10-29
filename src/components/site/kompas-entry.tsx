/** The COMPAZ mark and wordmark link directly to the local guide. */
export function KompasEntry() {
  return (
    <a className="kompas-entry" href="/kompas" aria-label="Explore Sidi Bou — open COMPAZ" lang="en" dir="ltr">
      <span className="kompas-entry__art">
        <img className="kompas-entry__mark" src="/kompas/compaz-mark.webp" width="144" height="147" alt="" decoding="async" />
        <img className="kompas-entry__wordmark" src="/kompas/compaz-wordmark.webp" width="420" height="54" alt="COMPAZ" decoding="async" />
      </span>
      <span className="kompas-entry__caption">
        <span className="kompas-entry__tagline">EXPLORE SIDI BOU</span>
        <span className="kompas-entry__click">CLICK THE COMPAZ</span>
      </span>
    </a>
  );
}
