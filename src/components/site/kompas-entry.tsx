/** The supplied compass rose links directly to the local guide. */
export function KompasEntry() {
  return (
    <a className="kompas-entry" href="/kompas" aria-label="Explore Sidi Bou — open KOMPAS" lang="en" dir="ltr">
      <span className="kompas-entry__art">
        <img src="/kompas/compass-rose.jpeg" width="612" height="612" alt="" decoding="async" />
      </span>
      <span className="kompas-entry__caption">
        <span className="kompas-entry__tagline">EXPLORE SIDI BOU</span>
        <span className="kompas-entry__click">CLICK THE COMPASS</span>
      </span>
    </a>
  );
}
