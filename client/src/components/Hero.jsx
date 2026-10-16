import { useEffect, useState } from 'react';
import { profile } from '../profile.js';

export default function Hero({ certs }) {
  const [imgMode, setImgMode] = useState('loading'); // loading | photo | cutout | initials
  const [hasResume, setHasResume] = useState(false);

  // Try /avatar.png first (cutout), then /avatar.jpg (photo), then initials
  useEffect(() => {
    const png = new Image();
    png.src = '/avatar.png';
    png.onload = () => setImgMode('cutout');
    png.onerror = () => {
      const jpg = new Image();
      jpg.src = '/avatar.jpg';
      jpg.onload = () => setImgMode('photo');
      jpg.onerror = () => setImgMode('initials');
    };
  }, []);

  // Check if /resume.pdf exists
  useEffect(() => {
    try {
      fetch('/resume.pdf', { method: 'HEAD' })
        .then((r) => { if (r.ok) setHasResume(true); })
        .catch(() => {});
    } catch { /* blocked */ }
  }, []);

  // Find the hawkathon cert for the prize chip
  const hawkathon = certs.find((c) => c.slug === 'uai-hawkathon');

  // Derive availability from facts
  const lookingFor = profile.facts.find(([k]) => k === 'looking for');

  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="avail-chip" aria-hidden="true">
            <span className="dot" />
            <span>{lookingFor ? `Open to ${lookingFor[1].split(' and ')[0]}` : 'Open to opportunities'}</span>
          </div>

          <h1>{profile.name}</h1>
          <p className="hero-role">{profile.headline.split('.')[0]}</p>
          <p className="lede">{profile.headline}</p>

          <dl className="facts">
            {profile.facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#achievements">See achievements</a>
            <a className="btn" href="#contact">Send a message</a>
            {hasResume && (
              <a className="btn" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Download resume</a>
            )}
          </div>
        </div>

        <div className="hero-portrait-wrap">
          <div className={`portrait ${imgMode === 'cutout' ? 'cutout' : ''}`}>
            {imgMode !== 'cutout' && <div className="portrait-frame" aria-hidden="true" />}

            {imgMode === 'initials' ? (
              <div className="portrait-initials" aria-hidden="true">
                {profile.initials}
              </div>
            ) : imgMode !== 'loading' ? (
              <div className="portrait-img-wrap">
                <img
                  src={imgMode === 'cutout' ? '/avatar.png' : '/avatar.jpg'}
                  alt="Portrait of Avishkar Kapadnis"
                  width="440"
                  height="550"
                  fetchpriority="high"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="portrait-initials" aria-hidden="true">{profile.initials}</div>
            )}

            {/* Glass chips */}
            {lookingFor && (
              <div className="portrait-chip chip-availability" aria-hidden="true">
                <span className="dot dot-green" />
                <span>Open to internships</span>
              </div>
            )}
            {hawkathon && (
              <div className="portrait-chip chip-prize" aria-hidden="true">
                <span className="dot dot-amber" />
                <span>3rd place, International UAi Hawk-athon</span>
              </div>
            )}
            <div className="portrait-chip chip-location" aria-hidden="true">
              <span>Nashik, India</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
