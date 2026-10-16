import { useState } from 'react';
import { sendMessage } from '../api.js';
import { profile } from '../profile.js';
import RequestPreview from './RequestPreview.jsx';

const EMPTY = { name: '', email: '', message: '', website: '' };
const NAME_MAX = 80;
const EMAIL_MAX = 120;
const MSG_MAX = 2000;

// Only letters, spaces, hyphens, apostrophes, and dots allowed
const NAME_REGEX = /^[A-Za-z\s\-'.]+$/;

function charCounter(current, max) {
  const remaining = max - current;
  const warn = remaining <= Math.floor(max * 0.1);
  return (
    <span className={`char-counter ${warn ? 'char-warn' : ''}`}>
      {current}/{max}
    </span>
  );
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [touched, setTouched] = useState({});

  const set = (key) => (e) => {
    const val = e.target.value;

    // Block numbers and special chars in name field
    if (key === 'name') {
      // Allow empty (for backspace), otherwise check regex
      if (val !== '' && !NAME_REGEX.test(val)) return;
    }

    setForm((f) => ({ ...f, [key]: val }));
    // Clear field error on edit
    if (fields[key]) setFields((f) => ({ ...f, [key]: '' }));
  };

  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    else if (!NAME_REGEX.test(form.name.trim())) errs.name = 'Name can only contain letters, spaces, hyphens, and apostrophes.';

    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email address.';

    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.';

    return errs;
  };

  // Get inline validation error for a touched field
  const inlineError = (key) => {
    if (!touched[key]) return null;
    const errs = validate();
    return errs[key] || null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFields(errs);
      setTouched({ name: true, email: true, message: true });
      return;
    }
    setStatus('sending');
    setError('');
    setFields({});
    try {
      await sendMessage(form);
      setStatus('sent');
      setForm(EMPTY);
      setTouched({});
    } catch (err) {
      setStatus('error');
      setError(err.message);
      setFields(err.fields || {});
    }
  };

  const nameErr = fields.name || inlineError('name');
  const emailErr = fields.email || inlineError('email');
  const msgErr = fields.message || inlineError('message');

  return (
    <section className="section" id="contact" aria-labelledby="contact-h">
      <div className="wrap contact-grid">
        <div>
          <h2 id="contact-h" className="dir">Contact</h2>
          <p className="intro">Recruiters, teammates and fellow CTF players are welcome. I read every message.</p>
          <p className="contact-links">
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
          <RequestPreview form={form} status={status} error={error} />
        </div>

        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <div className="field-head">
              <label htmlFor="c-name">Name</label>
              {charCounter(form.name.length, NAME_MAX)}
            </div>
            <input
              id="c-name"
              value={form.name}
              onChange={set('name')}
              onBlur={blur('name')}
              autoComplete="name"
              maxLength={NAME_MAX}
              placeholder="Your full name"
              pattern="[A-Za-z\s\-'.]+"
              title="Letters, spaces, hyphens, and apostrophes only"
              aria-invalid={Boolean(nameErr)}
              aria-describedby={nameErr ? 'c-name-err' : undefined}
            />
            {nameErr && <p className="field-err" id="c-name-err">{nameErr}</p>}
          </div>

          <div className="field">
            <div className="field-head">
              <label htmlFor="c-email">Email</label>
              {charCounter(form.email.length, EMAIL_MAX)}
            </div>
            <input
              id="c-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              onBlur={blur('email')}
              autoComplete="email"
              maxLength={EMAIL_MAX}
              placeholder="you@example.com"
              aria-invalid={Boolean(emailErr)}
              aria-describedby={emailErr ? 'c-email-err' : undefined}
            />
            {emailErr && <p className="field-err" id="c-email-err">{emailErr}</p>}
          </div>

          <div className="field">
            <div className="field-head">
              <label htmlFor="c-message">Message</label>
              {charCounter(form.message.length, MSG_MAX)}
            </div>
            <textarea
              id="c-message"
              rows="5"
              value={form.message}
              onChange={set('message')}
              onBlur={blur('message')}
              maxLength={MSG_MAX}
              placeholder="What would you like to say?"
              aria-invalid={Boolean(msgErr)}
              aria-describedby={msgErr ? 'c-message-err' : undefined}
            />
            {msgErr && <p className="field-err" id="c-message-err">{msgErr}</p>}
          </div>

          {/* Honeypot: hidden from people, bots tend to fill it in. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="c-website">Leave this empty</label>
            <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <p className="form-status" role="status" aria-live="polite">
            {status === 'sent' && <span className="ok">Message sent. I will reply to the email you gave.</span>}
            {status === 'error' && <span className="err">{error}</span>}
          </p>
        </form>
      </div>
    </section>
  );
}
