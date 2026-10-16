import { useMemo, useState } from 'react';
import { CATEGORY_LABELS } from '../profile.js';

export const badgeClass = (badge) => {
  if (['3rd Place', '2nd Place', '1st Place', 'Winner'].includes(badge)) return 'b-win';
  if (badge === 'Internship') return 'b-blue';
  if (badge === 'Speaker') return 'b-blue-out';
  if (badge === 'Qualified' || badge === 'Achievement') return 'b-amber-out';
  return 'b-dim';
};

const TABS = [['all', 'All'], ...Object.keys(CATEGORY_LABELS).map((c) => [c, CATEGORY_LABELS[c].split(' ')[0]])];
const INITIAL = 9;

export default function Achievements({ certs, onOpen }) {
  const [tab, setTab] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [prizesOnly, setPrizesOnly] = useState(false);

  const counts = useMemo(() => {
    const m = { all: certs.length };
    for (const c of certs) m[c.category] = (m[c.category] || 0) + 1;
    return m;
  }, [certs]);

  const list = useMemo(() => {
    let filtered = tab === 'all' ? certs : certs.filter((c) => c.category === tab);

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(q) || (c.issuer || '').toLowerCase().includes(q)
      );
    }

    // Prizes filter
    if (prizesOnly) {
      filtered = filtered.filter((c) =>
        c.prize || ['Winner', '1st Place', '2nd Place', '3rd Place'].includes(c.badge)
      );
    }

    const rank = (c) => (c.prize ? 0 : c.featured ? 1 : 2);
    return [...filtered].sort((a, b) => rank(a) - rank(b) || a.order - b.order);
  }, [certs, tab, search, prizesOnly]);

  const limited = tab === 'all' && !expanded && !search && !prizesOnly && list.length > INITIAL;
  const shown = limited ? list.slice(0, INITIAL) : list;

  return (
    <section className="section" id="achievements" aria-labelledby="ach-h">
      <div className="wrap">
        <h2 id="ach-h" className="dir">Achievements</h2>
        <p className="intro">
          {certs.length} certificates and records, with prizes first. Open any card to see the full document.
        </p>

        {/* Search and prize filter */}
        <div className="ach-controls">
          <input
            type="search"
            className="ach-search"
            placeholder="Search by title or issuer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search achievements"
          />
          <button
            type="button"
            className="prize-filter"
            aria-pressed={prizesOnly}
            onClick={() => setPrizesOnly(!prizesOnly)}
          >
            🏆 Prizes
          </button>
          <span className="ach-count" aria-live="polite" role="status">
            {list.length} result{list.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="tabs" role="group" aria-label="Filter achievements by category">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="tab"
              aria-pressed={tab === key}
              onClick={() => { setTab(key); setExpanded(false); }}
            >
              {label} <span className="count">{counts[key] || 0}</span>
            </button>
          ))}
        </div>
        {tab !== 'all' && <p className="tab-title">{CATEGORY_LABELS[tab]}</p>}

        {shown.length === 0 ? (
          <p className="dim">Nothing matches your search.</p>
        ) : (
          <ul className="cert-grid">
            {shown.map((c) => (
              <li key={c.slug}>
                <button type="button" className="cert" onClick={() => onOpen(list, list.indexOf(c))}>
                  <span className="cert-media">
                    {c.thumb ? (
                      <img src={c.thumb} alt="" loading="lazy" width="480" height="340" />
                    ) : (
                      <span className="cert-text">{c.description || c.title}</span>
                    )}
                  </span>
                  <span className="cert-meta">
                    <span className={`badge ${badgeClass(c.badge)}`}>{c.badge}</span>
                    <span className="cert-title">{c.title}</span>
                    <span className="cert-issuer">{c.issuer}</span>
                    {c.date && <span className="cert-date">{c.date}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {limited && (
          <button type="button" className="btn show-all" onClick={() => setExpanded(true)}>
            Show all {list.length}
          </button>
        )}
      </div>
    </section>
  );
}
