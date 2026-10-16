import { useEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '../profile.js';
import Terminal from './Terminal.jsx';

function CountUp({ target, active }) {
  const [val, setVal] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!active || reduced) { setVal(target); return; }
    if (target === 0) { setVal(0); return; }
    let frame;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.floor(t * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, reduced]);

  return <>{val}</>;
}

export default function BentoHighlights({ certs, projects, experience, onOpenCert }) {
  const statsRef = useRef(null);
  const [statsActive, setStatsActive] = useState(false);

  // Intersection observer for count-up
  useEffect(() => {
    if (prefersReducedMotion()) { setStatsActive(true); return; }
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const stats = useMemo(() => {
    const ctf = certs.filter((c) => c.category === 'ctf').length;
    const hacks = certs.filter((c) => c.category === 'hackathons').length;
    const internships = experience.filter((e) => (e.type || '').toLowerCase() === 'internship' || (e.role || '').toLowerCase().includes('intern')).length;
    return [
      { label: 'Certificates', value: certs.length },
      { label: 'CTF entries', value: ctf },
      { label: 'Hackathons', value: hacks },
      { label: 'Projects', value: projects.length },
      { label: 'Internships', value: internships }
    ];
  }, [certs, projects, experience]);

  // Prize card data
  const hawkathonCert = certs.find((c) => c.slug === 'uai-hawkathon');

  // Internship card data
  const internEntry = experience.find((e) => (e.type || '').toLowerCase() === 'internship' || (e.role || '').toLowerCase().includes('intern'));

  // Cursor spotlight handler
  const onPointerMove = (e) => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const openHawkathon = () => {
    if (hawkathonCert) {
      const idx = certs.indexOf(hawkathonCert);
      onOpenCert(certs, idx >= 0 ? idx : 0);
    }
  };

  const openInternCert = () => {
    const internCert = certs.find((c) => c.slug === 'jyesta-internship');
    if (internCert) {
      const idx = certs.indexOf(internCert);
      onOpenCert(certs, idx >= 0 ? idx : 0);
    }
  };

  return (
    <section className="bento" id="highlights" aria-label="Highlights">
      <div className="wrap bento-grid">
        {/* Terminal card */}
        <div className="bento-card bento-terminal" onPointerMove={onPointerMove}>
          <Terminal projects={projects} certs={certs} experience={experience} />
          <p className="term-hint" style={{ padding: '0 16px 14px' }}>
            This terminal works. Click it and type <code>help</code>.
          </p>
        </div>

        {/* Prize card */}
        {hawkathonCert && (
          <button
            type="button"
            className="bento-card bento-prize"
            onClick={openHawkathon}
            onKeyDown={(e) => e.key === 'Enter' && openHawkathon()}
            onPointerMove={onPointerMove}
            aria-label="Open UAi Hawk-athon certificate"
          >
            <div
              className="bento-prize-bg"
              style={{ backgroundImage: 'url(/achievements/full/uai-hawkathon-cheque.webp)' }}
              aria-hidden="true"
            />
            <span className="badge b-win">3rd Place</span>
            <h3>International UAi Hawk-athon</h3>
            <p className="prize-sub">EduPulse, Team AI OverLords. 114 teams.</p>
          </button>
        )}

        {/* Internship card */}
        {internEntry && (
          <div className="bento-card bento-intern" onPointerMove={onPointerMove}>
            <span className="badge b-blue">Internship</span>
            <h3>Cyber Security Intern at {internEntry.org}</h3>
            <p className="intern-range">{internEntry.range}</p>
            <div>
              <button type="button" className="btn" onClick={openInternCert}>View certificate</button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="bento-card bento-stats" ref={statsRef} onPointerMove={onPointerMove}>
          <div className="stats-row">
            {stats.map((s) => (
              <div key={s.label} className="stat-block">
                <span className="stat-num"><CountUp target={s.value} active={statsActive} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
