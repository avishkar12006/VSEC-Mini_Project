import { useEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '../profile.js';

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

export default function StatsStrip({ certs, projects, experience }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) { setActive(true); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } }, { threshold: 0.3 });
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

  // Build ticker items from real data
  const tickerItems = useMemo(() => {
    const items = [];
    // Prize certs
    certs.filter((c) => c.prize).forEach((c) => items.push(`🏆 ${c.title}`));
    // Featured projects
    projects.filter((p) => p.featured).forEach((p) => items.push(`📁 ${p.name} — ${p.status}`));
    // Featured certs without prize
    certs.filter((c) => c.featured && !c.prize).slice(0, 3).forEach((c) => items.push(`📜 ${c.title}`));
    if (items.length === 0) items.push('Loading highlights…');
    return items;
  }, [certs, projects]);

  return (
    <div className="stats-strip" ref={ref} aria-label="Key stats">
      <div className="wrap stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-block">
            <span className="stat-num"><CountUp target={s.value} active={active} /></span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      {/* Ticker: decorative, duplicated for seamless loop */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span className="ticker-item" key={i}>{item}</span>
          ))}
        </div>
      </div>
      {/* Screen reader alternative */}
      <ul className="sr-only">
        {tickerItems.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}
