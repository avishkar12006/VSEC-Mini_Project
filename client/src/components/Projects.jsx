import { useEffect, useState } from 'react';

export default function Projects({ items }) {
  const featured = items.filter((p) => p.featured).slice(0, 5);
  const others = items.filter((p) => !p.featured);
  const [active, setActive] = useState(0);
  const current = featured[active] || featured[0];

  // Listen for project selection from command palette/terminal
  useEffect(() => {
    const handler = (e) => {
      const idx = e.detail;
      if (typeof idx === 'number' && idx >= 0 && idx < featured.length) {
        setActive(idx);
      }
    };
    window.addEventListener('select-project', handler);
    return () => window.removeEventListener('select-project', handler);
  }, [featured.length]);

  return (
    <section className="section" id="projects" aria-labelledby="projects-h">
      <div className="wrap">
        <h2 id="projects-h" className="dir">Projects</h2>
        {!current ? (
          <p className="dim">No projects yet.</p>
        ) : (
          <>
            <div className="proj">
              <ul className="proj-list" aria-label="Featured projects">
                {featured.map((p, i) => (
                  <li key={p.slug}>
                    <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => setActive(i)}>
                      <span className="proj-name">{p.name}</span>
                      <span className="proj-status">{p.status}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <article className="proj-detail" aria-live="polite">
                {/* Project cover */}
                <div className="proj-cover">
                  {current.image ? (
                    <img src={current.image} alt="" loading="lazy" width="800" height="350" />
                  ) : (
                    <div className="proj-cover-gen" aria-hidden="true">
                      <span>{current.name}</span>
                    </div>
                  )}
                </div>

                <h3>{current.name}</h3>
                <p className="proj-summary">{current.summary}</p>
                {current.role && <p className="proj-role">My role: {current.role}</p>}
                {current.problem && (
                  <>
                    <h4>The problem</h4>
                    <p>{current.problem}</p>
                  </>
                )}
                {current.built?.length > 0 && (
                  <>
                    <h4>What I built</h4>
                    <ul>{current.built.map((b) => <li key={b}>{b}</li>)}</ul>
                  </>
                )}
                {current.outcome && (
                  <>
                    <h4>Where it stands</h4>
                    <p>{current.outcome}</p>
                  </>
                )}
                {current.stack?.length > 0 && (
                  <div className="stack-pills">
                    {current.stack.map((s) => (
                      <span key={s} className="stack-pill">{s}</span>
                    ))}
                  </div>
                )}
                {current.links?.length > 0 && (
                  <div className="proj-links">
                    {current.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn">{l.label}</a>
                    ))}
                  </div>
                )}
              </article>
            </div>

            {others.length > 0 && (
              <>
                <h3 className="sub">More builds</h3>
                <div className="more-grid">
                  {others.map((p) => (
                    <div key={p.slug} className="more-card">
                      <div className="more-card-head">
                        <span className="proj-name">{p.name}</span>
                        {p.status && <span className="proj-status">{p.status}</span>}
                      </div>
                      <p className="more-card-summary">{p.summary}</p>
                      {p.stack?.length > 0 && (
                        <div className="stack-pills" style={{ margin: 0, padding: 0, border: 'none' }}>
                          {p.stack.map((s) => (
                            <span key={s} className="stack-pill">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
