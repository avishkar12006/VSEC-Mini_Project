import { useEffect, useRef, useState } from 'react';
import { CATEGORY_LABELS, prefersReducedMotion, profile } from '../profile.js';
import { applyTheme } from './Header.jsx';

const PS1 = 'guest@avi:~$';
const SECTIONS = ['about', 'experience', 'projects', 'skills', 'achievements', 'contact'];
const THEME_NAMES = ['orchid', 'matrix', 'kali', 'ember'];
const COMMANDS = ['help', 'whoami', 'about', 'skills', 'projects', 'experience', 'achievements', 'goto', 'contact', 'github', 'linkedin', 'clear', 'sudo', 'banner', 'theme', 'resume', 'open'];

const t = (text, cls = '') => ({ text, cls });
const link = (text, href) => ({ text, href });

const ASCII_BANNER = [
  '  █████╗ ██╗   ██╗██╗',
  ' ██╔══██╗██║   ██║██║',
  ' ███████║██║   ██║██║',
  ' ██╔══██║╚██╗ ██╔╝██║',
  ' ██║  ██║ ╚████╔╝ ██║',
  ' ╚═╝  ╚═╝  ╚═══╝  ╚═╝'
];

const BOOT_LINES = [
  '[  OK  ] initializing system environment',
  '[  OK  ] loading certificates',
  '[  OK  ] connecting to api',
  '[  OK  ] mounting projects',
  '[  OK  ] resolving identity',
  '[  OK  ] system ready'
];

const BOOT_KEY = 'avi-boot-done';

function buildOutput(cmd, args, { projects, certs, experience }) {
  switch (cmd) {
    case 'help':
      return [
        t('Commands you can run:', 'dim'),
        t('  whoami            who is this'),
        t('  about             the short version'),
        t('  skills            tools and languages'),
        t('  projects          what I have built'),
        t('  experience        internships and talks'),
        t('  achievements      certificates by category'),
        t('  goto <name>       jump to a section'),
        t('  open <project>    scroll to a project'),
        t('  contact           how to reach me'),
        t('  banner            show ASCII art'),
        t('  resume            check for resume'),
        t('  theme <name>      switch theme (orchid | matrix | kali | ember)'),
        t('  github, linkedin, clear')
      ];
    case 'whoami':
      return [
        t(profile.name, 'strong'),
        t(profile.headline),
        ...profile.facts.map(([k, v]) => t(`${k.padEnd(12)}${v}`, 'dim'))
      ];
    case 'about':
      return profile.about.map((p) => t(p));
    case 'skills':
      return profile.skills.map((g) => t(`${g.group.padEnd(16)}${g.items.join(', ')}`));
    case 'projects': {
      if (!projects.length) return [t('Projects have not loaded yet.', 'err')];
      const featured = projects.filter((p) => p.featured).slice(0, 5);
      return [
        ...featured.map((p) => t(`${p.name.padEnd(30)}${p.status}`)),
        t(`and ${projects.filter((p) => !p.featured).length} smaller builds. Run "goto projects" to read them.`, 'dim')
      ];
    }
    case 'experience':
      if (!experience.length) return [t('Experience has not loaded yet.', 'err')];
      return experience.map((e) => t(`${e.org.padEnd(28)}${e.role}  (${e.range})`));
    case 'achievements': {
      if (!certs.length) return [t('Certificates have not loaded yet.', 'err')];
      const counts = Object.keys(CATEGORY_LABELS).map((c) => t(`${c.padEnd(16)}${certs.filter((x) => x.category === c).length}`));
      return [t(`${certs.length} certificates and records:`, 'dim'), ...counts, t('Run "goto achievements" to open the gallery.', 'dim')];
    }
    case 'goto': {
      const target = args[0];
      if (!target) return [t(`Usage: goto <${SECTIONS.join('|')}>`, 'dim')];
      if (!SECTIONS.includes(target)) return [t(`goto: no section named "${target}".`, 'err')];
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      return [t(`Scrolling to ${target}.`, 'ok')];
    }
    case 'open': {
      const name = args.join(' ').toLowerCase();
      if (!name) return [t('Usage: open <project-name>', 'dim')];
      const featured = projects.filter((p) => p.featured);
      const idx = featured.findIndex((p) => p.name.toLowerCase().includes(name) || p.slug.toLowerCase().includes(name));
      if (idx < 0) return [t(`open: no featured project matching "${name}".`, 'err')];
      document.getElementById('projects')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      window.dispatchEvent(new CustomEvent('select-project', { detail: idx }));
      return [t(`Opening ${featured[idx].name}.`, 'ok')];
    }
    case 'resume': {
      // Check synchronously (the result may already be cached by the browser)
      return [t('Checking /resume.pdf…', 'dim'), t('Run this check from the hero section or visit /resume.pdf directly.')];
    }
    case 'contact':
      return [t('Use the form at the bottom of the page, or reach me here:'), link('github', profile.links.github), link('linkedin', profile.links.linkedin)];
    case 'github':
      return [link(profile.links.github, profile.links.github)];
    case 'linkedin':
      return [link(profile.links.linkedin, profile.links.linkedin)];
    case 'sudo':
      return [t('avi is not in the sudoers file. This incident will not be reported.', 'err')];
    case 'banner':
      return ASCII_BANNER.map((line) => t(line, 'ascii'));
    case 'theme': {
      const name = (args[0] || '').toLowerCase();
      if (!name || !THEME_NAMES.includes(name)) {
        return [
          t('Usage: theme <orchid | matrix | kali | ember>', 'dim'),
          t('  orchid   night orchid (default)'),
          t('  matrix   green hacker'),
          t('  kali     ink-blue palette'),
          t('  ember    warm ember tones')
        ];
      }
      applyTheme(name);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: name }));
      return [t(`Switched to ${name} theme.`, 'ok')];
    }
    default:
      return [t(`${cmd}: command not found. Type "help" to see what works.`, 'err')];
  }
}

function Line({ line }) {
  if (line.href) {
    return (
      <div className="tl-out">
        <a href={line.href} target="_blank" rel="noopener noreferrer">{line.text}</a>
      </div>
    );
  }
  return <div className={`tl-out ${line.cls}`}>{line.text}</div>;
}

export default function Terminal({ projects, certs, experience }) {
  const [log, setLog] = useState([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(true);
  const historyRef = useRef([]);
  const historyIdx = useRef(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const dataRef = useRef({ projects, certs, experience });
  dataRef.current = { projects, certs, experience };

  // Boot sequence
  useEffect(() => {
    let cancelled = false;
    const timers = [];
    setLog([]);
    setValue('');
    setBusy(true);

    let bootDone = false;
    try { bootDone = sessionStorage.getItem(BOOT_KEY) === '1'; } catch { /* blocked */ }

    const finishWhoami = () => {
      if (cancelled) return;
      setLog((prev) => [
        ...prev,
        { cmd: 'whoami' },
        { out: buildOutput('whoami', [], dataRef.current) },
        { out: [t('Type "help" to see what you can run.', 'dim')] }
      ]);
      setValue('');
      setBusy(false);
    };

    const startTyping = () => {
      if (cancelled) return;
      if (prefersReducedMotion()) {
        finishWhoami();
        return;
      }
      const word = 'whoami';
      [...word].forEach((_, i) => {
        timers.push(setTimeout(() => !cancelled && setValue(word.slice(0, i + 1)), 100 + i * 90));
      });
      timers.push(setTimeout(finishWhoami, 100 + word.length * 90 + 350));
    };

    if (prefersReducedMotion() || bootDone) {
      startTyping();
    } else {
      const skipBoot = () => {
        window.removeEventListener('keydown', skipBoot);
        window.removeEventListener('click', skipBoot);
        timers.forEach(clearTimeout);
        timers.length = 0;
        setLog(BOOT_LINES.map((line) => ({ out: [t(line, 'boot')] })));
        try { sessionStorage.setItem(BOOT_KEY, '1'); } catch { /* blocked */ }
        startTyping();
      };

      window.addEventListener('keydown', skipBoot, { once: true });
      window.addEventListener('click', skipBoot, { once: true });

      BOOT_LINES.forEach((line, i) => {
        timers.push(setTimeout(() => {
          if (cancelled) return;
          setLog((prev) => [...prev, { out: [t(line, 'boot')] }]);
          if (i === BOOT_LINES.length - 1) {
            try { sessionStorage.setItem(BOOT_KEY, '1'); } catch { /* blocked */ }
            timers.push(setTimeout(() => {
              window.removeEventListener('keydown', skipBoot);
              window.removeEventListener('click', skipBoot);
              startTyping();
            }, 400));
          }
        }, 200 + i * 250));
      });
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log, value]);

  const run = (raw) => {
    const text = raw.trim();
    if (!text) return;
    const [cmd, ...args] = text.split(/\s+/);
    historyRef.current.push(text);
    historyIdx.current = -1;
    if (cmd === 'clear') {
      setLog([]);
      return;
    }
    setLog((prev) => [...prev, { cmd: text }, { out: buildOutput(cmd.toLowerCase(), args, dataRef.current) }]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    run(value);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (busy) return;
    const hist = historyRef.current;
    if (e.key === 'ArrowUp' && hist.length) {
      e.preventDefault();
      historyIdx.current = historyIdx.current < 0 ? hist.length - 1 : Math.max(0, historyIdx.current - 1);
      setValue(hist[historyIdx.current]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx.current < 0) return;
      historyIdx.current += 1;
      if (historyIdx.current >= hist.length) {
        historyIdx.current = -1;
        setValue('');
      } else {
        setValue(hist[historyIdx.current]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const [first, ...rest] = value.split(/\s+/);
      if (rest.length === 0) {
        const match = COMMANDS.find((c) => c.startsWith(first.toLowerCase()) && first);
        if (match) setValue(match);
      } else if (first === 'goto') {
        const match = SECTIONS.find((s) => s.startsWith(rest[0]) && rest[0]);
        if (match) setValue(`goto ${match}`);
      } else if (first === 'theme') {
        const match = THEME_NAMES.find((tn) => tn.startsWith((rest[0] || '').toLowerCase()) && rest[0]);
        if (match) setValue(`theme ${match}`);
      } else if (first === 'open') {
        const featured = dataRef.current.projects.filter((p) => p.featured);
        const partial = rest.join(' ').toLowerCase();
        const match = featured.find((p) => p.name.toLowerCase().startsWith(partial) || p.slug.toLowerCase().startsWith(partial));
        if (match) setValue(`open ${match.name}`);
      }
    }
  };

  return (
    <div className="term" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <div className="term-bar">
        <span className="term-dots" aria-hidden="true"><span /><span /><span /></span>
        <span className="term-title">guest@avi: ~</span>
      </div>
      <div className="term-body" ref={bodyRef} role="log" aria-live="polite" aria-label="Interactive terminal">
        {log.map((entry, i) =>
          entry.cmd !== undefined ? (
            <div className="tl-cmd" key={i}><span className="ps1">{PS1}</span> {entry.cmd}</div>
          ) : (
            <div className="tl-block" key={i}>{entry.out.map((line, j) => <Line line={line} key={j} />)}</div>
          )
        )}
        <form className="tl-input" onSubmit={onSubmit}>
          <label htmlFor="terminal-input" className="sr-only">Type a command and press Enter</label>
          <span className="ps1" aria-hidden="true">{PS1}</span>
          <input
            id="terminal-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={busy}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={60}
          />
        </form>
      </div>
    </div>
  );
}
