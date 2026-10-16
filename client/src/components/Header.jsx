import { useCallback, useEffect, useRef, useState } from 'react';

const THEMES = [
  { id: 'orchid', color: '#f56fd9', label: 'Switch to orchid theme' },
  { id: 'matrix', color: '#2dff7a', label: 'Switch to matrix theme' },
  { id: 'kali',   color: '#4c8dff', label: 'Switch to kali theme' },
  { id: 'ember',  color: '#ff8a3d', label: 'Switch to ember theme' }
];

const NAV = [
  ['about', 'About'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['achievements', 'Achievements'],
  ['contact', 'Contact']
];

function getTheme() {
  try { return localStorage.getItem('avi-theme') || 'orchid'; } catch { return 'orchid'; }
}

export function applyTheme(name) {
  if (name === 'orchid') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', name);
  }
  try { localStorage.setItem('avi-theme', name); } catch { /* blocked */ }
}

export { THEMES };

export default function Header({ onOpenPalette }) {
  const [theme, setTheme] = useState(getTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef(null);

  const switchTheme = useCallback((id) => {
    applyTheme(id);
    setTheme(id);
  }, []);

  // Listen for theme changes from terminal
  useEffect(() => {
    const handler = (e) => { setTheme(e.detail); };
    window.addEventListener('theme-changed', handler);
    return () => window.removeEventListener('theme-changed', handler);
  }, []);

  // Close menu on Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); menuBtnRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => { setMenuOpen(false); menuBtnRef.current?.focus(); };

  return (
    <>
      <header className="site-header">
        <div className="wrap header-row">
          <div className="header-left">
            <a className="brand" href="#top" aria-label="Back to top">
              <span className="brand-full">Avishkar Kapadnis</span>
              <span className="brand-short" aria-hidden="true">AK</span>
            </a>
          </div>

          <nav className="desktop-nav" aria-label="Sections">
            <ul>
              {NAV.map(([id, label]) => (
                <li key={id}><a href={`#${id}`}>{label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="header-right">
            <div className="theme-swatches" role="group" aria-label="Theme switcher">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="theme-swatch"
                  aria-label={t.label}
                  aria-pressed={theme === t.id}
                  style={{ background: t.color }}
                  onClick={() => switchTheme(t.id)}
                />
              ))}
            </div>
            <button type="button" className="search-trigger" onClick={onOpenPalette} aria-label="Open command palette">
              <span>Search</span>
              <kbd aria-hidden="true">Ctrl K</kbd>
            </button>
            <button
              type="button"
              className="menu-btn"
              ref={menuBtnRef}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {menuOpen ? (
                  <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>
                ) : (
                  <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-drawer" id="mobile-menu" data-open={menuOpen} aria-hidden={!menuOpen}>
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>
        ))}
      </div>
    </>
  );
}
