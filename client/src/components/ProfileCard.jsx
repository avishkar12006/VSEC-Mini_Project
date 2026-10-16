import { useEffect, useState } from 'react';
import { prefersReducedMotion, profile } from '../profile.js';

const ASCII_LOGO = [
  '  ┌──────┐',
  '  │ >_   │',
  '  │      │',
  '  └──────┘'
];

const THEME_COLORS = [
  '--bg', '--panel', '--raised', '--line',
  '--dim', '--accent', '--mint', '--amber'
];

export default function ProfileCard({ certCount, ctfCount }) {
  const [elapsed, setElapsed] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [reduced]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  // Extract values from profile.js facts
  const college = profile.facts.find(([k]) => k === 'college')?.[1] || '';
  const focus = profile.facts.find(([k]) => k === 'focus')?.[1] || '';
  const languages = profile.skills.find((g) => g.group === 'Languages')?.items.join(', ') || '';

  const lines = [
    ['user', profile.name],
    ['college', college.split('.')[0]],
    ['degree', 'B.Tech IT, ' + (college.match(/graduating \d+/)?.[0] || '')],
    ['focus', focus],
    ['languages', languages],
    ['certificates', String(certCount)],
    ['ctf entries', String(ctfCount)],
    ['session', reduced ? '--:--' : `${mm}:${ss}`]
  ];

  return (
    <div className="nf-card" aria-label="Profile summary">
      <div className="nf-bar">
        <span className="nf-bar-dots" aria-hidden="true"><span /><span /><span /></span>
        <span>~/about/neofetch</span>
      </div>
      <div className="nf-body">
        <pre className="nf-logo" aria-hidden="true">{ASCII_LOGO.join('\n')}</pre>
        <div className="nf-info">
          {lines.map(([key, val]) => (
            <div key={key} className="nf-line">
              <span className="nf-key">{key}</span>
              <span className="nf-val">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="nf-colors" aria-hidden="true">
        {THEME_COLORS.map((c) => (
          <span key={c} className="nf-swatch" style={{ background: `var(${c})` }} />
        ))}
      </div>
    </div>
  );
}
