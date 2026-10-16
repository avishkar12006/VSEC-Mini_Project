import { profile } from '../profile.js';

const SECTIONS = [
  ['about', 'About'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['achievements', 'Achievements'],
  ['contact', 'Contact']
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-top">
          <div className="footer-links" aria-label="Section links">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`}>{label}</a>
            ))}
          </div>
          <div className="footer-links">
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Built with React, Express and MongoDB for the Web Development mini project at KBTCOE, Nashik.</p>
          <button type="button" className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
            ↑ Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
