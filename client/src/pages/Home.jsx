import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCertificates, getExperience, getProjects } from '../api.js';
import { prefersReducedMotion, profile } from '../profile.js';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import BentoHighlights from '../components/BentoHighlights.jsx';
import About from '../components/About.jsx';
import Experience from '../components/Experience.jsx';
import Projects from '../components/Projects.jsx';
import Skills from '../components/Skills.jsx';
import Achievements from '../components/Achievements.jsx';
import Lightbox from '../components/Lightbox.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import CommandPalette from '../components/CommandPalette.jsx';

// JSON-LD Person schema
const SITE_URL = 'https://YOUR-DOMAIN'; // TODO: replace with real domain
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Avishkar Kapadnis',
  jobTitle: 'B.Tech IT student',
  alumniOf: { '@type': 'EducationalOrganization', name: 'KBTCOE' },
  sameAs: [profile.links.github, profile.links.linkedin]
};

export default function Home() {
  const [state, setState] = useState({ status: 'loading', certs: [], projects: [], experience: [], message: '' });
  const [lightbox, setLightbox] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const scrollBarRef = useRef(null);

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    Promise.all([getCertificates(), getProjects(), getExperience()])
      .then(([certs, projects, experience]) => setState({ status: 'ready', certs, projects, experience, message: '' }))
      .catch((err) => setState((s) => ({ ...s, status: 'error', message: err.message })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const { status, certs, projects, experience, message } = state;
  const openCert = useCallback((items, index) => setLightbox({ items, index }), []);
  const closeCert = useCallback(() => setLightbox(null), []);
  const moveCert = useCallback((index) => setLightbox((l) => (l ? { ...l, index } : l)), []);

  const ctfCount = useMemo(() => certs.filter((c) => c.category === 'ctf').length, [certs]);

  // Scroll progress bar
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const bar = scrollBarRef.current;
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const scroll = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scroll / max : 0})`;
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    if (prefersReducedMotion()) return;
    document.documentElement.classList.add('reveal-ready');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    const items = document.querySelectorAll('.reveal');
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 6) * 60}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, [status]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === '/' && !paletteOpen) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Grain overlay */}
      <div className="grain" aria-hidden="true" />

      {/* Scroll progress */}
      <div className="scroll-progress" ref={scrollBarRef} aria-hidden="true" />

      <a className="skip" href="#about">Skip to content</a>
      <Header onOpenPalette={() => setPaletteOpen(true)} />

      <main>
        <Hero certs={certs} />

        {status === 'ready' && (
          <BentoHighlights certs={certs} projects={projects} experience={experience} onOpenCert={openCert} />
        )}

        <div className="reveal">
          <About certCount={certs.length} ctfCount={ctfCount} />
        </div>

        {status === 'error' && (
          <div className="wrap">
            <div className="notice" role="alert">
              <p>{message}</p>
              <p className="dim">Start the API with <code>npm run dev</code> from the project folder, then try again.</p>
              <button type="button" className="btn" onClick={load}>Try again</button>
            </div>
          </div>
        )}

        {status === 'loading' && <div className="wrap"><p className="dim loading">Loading from the API.</p></div>}

        {status === 'ready' && (
          <>
            <div className="reveal">
              <Experience items={experience} certs={certs} onOpen={openCert} />
            </div>
            <div className="reveal">
              <Projects items={projects} />
            </div>
            <div className="reveal">
              <Skills />
            </div>
            <div className="reveal">
              <Achievements certs={certs} onOpen={openCert} />
            </div>
          </>
        )}

        <div className="reveal">
          <Contact />
        </div>
      </main>

      <Footer />

      {lightbox && <Lightbox items={lightbox.items} index={lightbox.index} onClose={closeCert} onIndex={moveCert} />}
      {paletteOpen && <CommandPalette certs={certs} projects={projects} onClose={() => setPaletteOpen(false)} />}
    </>
  );
}
