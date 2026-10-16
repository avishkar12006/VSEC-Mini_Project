import { useState } from 'react';
import { badgeClass } from './Achievements.jsx';

export default function Experience({ items, certs, onOpen }) {
  const bySlug = new Map(certs.map((c, i) => [c.slug, i]));
  const [activeIdx, setActiveIdx] = useState(0);

  // Get first proof cert for the active entry
  const activeEntry = items[activeIdx];
  const activeProofs = activeEntry ? (activeEntry.proof || []).filter((s) => bySlug.has(s)) : [];
  const previewCert = activeProofs.length > 0 ? certs[bySlug.get(activeProofs[0])] : null;

  return (
    <section className="section" id="experience" aria-labelledby="experience-h">
      <div className="wrap">
        <h2 id="experience-h" className="dir">Experience</h2>
        {items.length === 0 ? (
          <p className="dim">No experience entries yet.</p>
        ) : (
          <div className="exp-grid">
            <ol className="timeline">
              {items.map((e, idx) => {
                const proofs = (e.proof || []).filter((s) => bySlug.has(s));
                return (
                  <li
                    key={e.slug}
                    className={`tl-item ${idx === activeIdx ? 'tl-item--active' : ''}`}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onFocus={() => setActiveIdx(idx)}
                    tabIndex={0}
                  >
                    <div className="tl-head">
                      <h3>{e.role}</h3>
                      <span className={`status ${e.status === 'Offer received' ? 'status-amber' : ''}`}>{e.status}</span>
                    </div>
                    <p className="tl-org">{e.org}</p>
                    <p className="tl-range">{e.range}</p>
                    <ul className="tl-points">
                      {e.points.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                    {proofs.length > 0 && (
                      <p className="tl-proof">
                        {proofs.map((slug) => (
                          <button type="button" className="linklike" key={slug} onClick={() => onOpen(certs, bySlug.get(slug))}>
                            View certificate: {certs[bySlug.get(slug)].title}
                          </button>
                        ))}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
            <aside className="exp-preview" aria-label="Certificate preview">
              {previewCert ? (
                <div className="exp-preview-card">
                  {previewCert.thumb && (
                    <div className="exp-preview-img">
                      <img src={previewCert.thumb} alt="" loading="lazy" />
                    </div>
                  )}
                  <div className="exp-preview-meta">
                    <span className={`badge ${badgeClass(previewCert.badge)}`}>{previewCert.badge}</span>
                    <p className="exp-preview-title">{previewCert.title}</p>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => onOpen(certs, bySlug.get(activeProofs[0]))}
                    >
                      Open full certificate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="exp-preview-empty">
                  <p className="dim">No certificate attached to this entry yet.</p>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
