import { useEffect, useRef, useState } from 'react';
import { badgeClass } from './Achievements.jsx';

export default function Lightbox({ items, index, onClose, onIndex }) {
  const item = items[index];
  const [imgIdx, setImgIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(document.activeElement);

  useEffect(() => { setImgIdx(0); setZoomed(false); }, [index]);

  useEffect(() => {
    const opener = openerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && index < items.length - 1) onIndex(index + 1);
      else if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      else if (e.key === 'z' || e.key === 'Z') setZoomed((z) => !z);
      else if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll('button:not([disabled]), a[href]');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;
  const pictures = item.images?.length ? item.images : item.image ? [{ src: item.image, caption: item.title }] : [];
  const picture = pictures[Math.min(imgIdx, pictures.length - 1)];

  return (
    <div className="lb-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb" role="dialog" aria-modal="true" aria-label={item.title} ref={dialogRef}>
        <div className="lb-top">
          <span className="lb-pos">{index + 1} of {items.length}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {picture && (
              <button type="button" className="btn lb-zoom-btn" onClick={() => setZoomed(!zoomed)} aria-label={zoomed ? 'Fit to view' : 'Zoom to 100%'}>
                {zoomed ? 'Fit' : '100%'} <kbd aria-hidden="true">z</kbd>
              </button>
            )}
            <button type="button" className="btn" ref={closeRef} onClick={onClose}>Close</button>
          </div>
        </div>

        <div
          className={`lb-media ${zoomed ? 'zoomed' : ''}`}
          onClick={() => picture && setZoomed(!zoomed)}
        >
          {picture ? (
            <img src={picture.src} alt={picture.caption || item.title} />
          ) : (
            <p className="lb-noimg">{item.description || 'No image for this entry.'}</p>
          )}
        </div>

        {pictures.length > 1 && (
          <div className="lb-pics" role="group" aria-label="Images for this entry">
            {pictures.map((p, i) => (
              <button key={p.src} type="button" className="tab" aria-pressed={i === imgIdx} onClick={() => setImgIdx(i)}>
                {p.caption}
              </button>
            ))}
          </div>
        )}

        <div className="lb-info">
          <span className={`badge ${badgeClass(item.badge)}`}>{item.badge}</span>
          <h3>{item.title}</h3>
          <p>{item.issuer}</p>
          {item.date && <p className="dim">{item.date}</p>}
          {item.prize && <p className="lb-prize">{item.prize}</p>}
          {item.description && picture && <p className="lb-desc">{item.description}</p>}
        </div>

        <div className="lb-nav">
          <button type="button" className="btn" disabled={index === 0} onClick={() => onIndex(index - 1)}>Previous</button>
          <button type="button" className="btn" disabled={index === items.length - 1} onClick={() => onIndex(index + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
