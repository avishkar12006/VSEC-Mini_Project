import { useEffect, useMemo, useRef, useState } from 'react';
import { profile, CATEGORY_LABELS } from '../profile.js';
import { applyTheme, THEMES } from './Header.jsx';

export default function CommandPalette({ certs, projects, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(document.activeElement);

  // Build items
  const allItems = useMemo(() => {
    const items = [];

    // Sections
    const sections = [
      { label: 'About', id: 'about' },
      { label: 'Experience', id: 'experience' },
      { label: 'Projects', id: 'projects' },
      { label: 'Achievements', id: 'achievements' },
      { label: 'Contact', id: 'contact' }
    ];
    sections.forEach((s) => items.push({ group: 'Sections', label: s.label, action: () => { document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); onClose(); } }));

    // Projects
    (projects || []).filter((p) => p.featured).forEach((p, i) => {
      items.push({
        group: 'Projects', label: p.name,
        action: () => { document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.dispatchEvent(new CustomEvent('select-project', { detail: i })); onClose(); }
      });
    });

    // Themes
    THEMES.forEach((t) => {
      items.push({
        group: 'Themes', label: `${t.id.charAt(0).toUpperCase() + t.id.slice(1)} theme`,
        action: () => { applyTheme(t.id); window.dispatchEvent(new CustomEvent('theme-changed', { detail: t.id })); onClose(); }
      });
    });

    // Links
    items.push({ group: 'Links', label: 'GitHub', action: () => { window.open(profile.links.github, '_blank'); onClose(); } });
    items.push({ group: 'Links', label: 'LinkedIn', action: () => { window.open(profile.links.linkedin, '_blank'); onClose(); } });

    return items;
  }, [projects, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, allItems]);

  useEffect(() => { setActiveIdx(0); }, [filtered]);

  // Focus input and trap focus
  useEffect(() => {
    const opener = openerRef.current;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter' && filtered.length > 0) { e.preventDefault(); filtered[activeIdx]?.action(); }
      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('input, button');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [onClose, filtered, activeIdx]);

  // Scroll active item into view
  useEffect(() => {
    const el = document.getElementById(`palette-item-${activeIdx}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // Group items for display
  const groups = useMemo(() => {
    const g = {};
    filtered.forEach((item, i) => {
      if (!g[item.group]) g[item.group] = [];
      g[item.group].push({ ...item, flatIdx: i });
    });
    return g;
  }, [filtered]);

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" ref={dialogRef}>
        <div className="palette-input-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
          <input
            ref={inputRef}
            className="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-listbox"
            aria-activedescendant={filtered.length ? `palette-item-${activeIdx}` : undefined}
            placeholder="Search sections, projects, themes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="palette-list" id="palette-listbox" role="listbox">
          {filtered.length === 0 ? (
            <div className="palette-empty">No results found.</div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="palette-group">{group}</div>
                {items.map((item) => (
                  <div
                    key={item.flatIdx}
                    id={`palette-item-${item.flatIdx}`}
                    className="palette-item"
                    role="option"
                    aria-selected={item.flatIdx === activeIdx}
                    data-active={item.flatIdx === activeIdx}
                    onClick={item.action}
                    onMouseEnter={() => setActiveIdx(item.flatIdx)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
