/** Large in-flow compass beside the mission and participation copy. */
export function KompasEntry() {
  return (
    <a className="kompas-entry" href="/kompas" aria-label="Open KOMPAS — the best things in Sidi Bou" lang="en" dir="ltr">
      <span className="kompas-entry__title">KOMPAS</span>
      <svg viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <circle cx="36" cy="36" r="33" stroke="currentColor" strokeOpacity=".2" />
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d={i % 6 === 0 ? "M36 7v7" : "M36 8v4"} stroke="currentColor" strokeOpacity={i % 6 === 0 ? ".8" : ".4"} transform={`rotate(${i * 15} 36 36)`} />
        ))}
        <g className="kompas-entry__needle">
          <path d="m45 20-4 21-14 11 4-21 14-11Z" stroke="currentColor" strokeWidth="1.25" />
          <path d="m45 20-4 21-10-10 14-11Z" fill="currentColor" />
          <circle cx="36" cy="36" r="2.5" fill="var(--color-paper)" stroke="currentColor" />
        </g>
      </svg>
      <span className="kompas-entry__tagline">THE BEST THINGS<br />IN SIDI BOU</span>
      <span className="kompas-entry__selection">HAND SELECTED</span>
      <span className="kompas-entry__click">CLICK</span>
    </a>
  );
}
