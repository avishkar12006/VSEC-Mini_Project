import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminCertificates, adminCreate, adminDelete, adminLogin, adminMessages, adminPatch } from '../api.js';

const CATEGORIES = ['ctf', 'cybersecurity', 'hackathons', 'web-tech', 'workshops'];
const BADGES = ['Participant', 'Completed', 'Qualified', 'Internship', 'Achievement', 'Speaker', 'Winner', '3rd Place', '2nd Place', '1st Place'];
const KEY = 'portfolio-admin-token';

function Login({ onLogin }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(token);
      sessionStorage.setItem(KEY, token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form className="form admin-login" onSubmit={submit}>
      <div className="field">
        <label htmlFor="a-token">Admin token</label>
        <input id="a-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="current-password" />
      </div>
      <button className="btn btn-primary" type="submit">Log in</button>
      <p className="form-status" role="alert">{error && <span className="err">{error}</span>}</p>
    </form>
  );
}

function Dashboard({ token, onLogout }) {
  const [certs, setCerts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [c, m] = await Promise.all([adminCertificates(token), adminMessages(token)]);
      setCerts(c);
      setMessages(m);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
      if (err.status === 401) onLogout();
    }
  }, [token, onLogout]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await adminCreate(token, new FormData(form));
      form.reset();
      setMsg({ type: 'ok', text: 'Certificate added.' });
      refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c) => {
    try { await adminPatch(token, c._id, { featured: !c.featured }); refresh(); }
    catch (err) { setMsg({ type: 'err', text: err.message }); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    try { await adminDelete(token, c._id); refresh(); }
    catch (err) { setMsg({ type: 'err', text: err.message }); }
  };

  return (
    <>
      <div className="admin-bar">
        <button type="button" className="btn" onClick={onLogout}>Log out</button>
      </div>
      <p className="form-status" role="status">{msg.text && <span className={msg.type}>{msg.text}</span>}</p>

      <h2 className="dir">Add certificate</h2>
      <form className="form admin-form" onSubmit={create}>
        <div className="field"><label htmlFor="n-title">Title</label><input id="n-title" name="title" required maxLength={160} /></div>
        <div className="field"><label htmlFor="n-issuer">Issuer</label><input id="n-issuer" name="issuer" maxLength={200} /></div>
        <div className="field"><label htmlFor="n-cat">Category</label>
          <select id="n-cat" name="category" defaultValue="ctf">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="n-badge">Badge</label>
          <select id="n-badge" name="badge" defaultValue="Participant">{BADGES.map((b) => <option key={b}>{b}</option>)}</select></div>
        <div className="field"><label htmlFor="n-date">Date as printed</label><input id="n-date" name="date" maxLength={60} placeholder="12-13 Mar 2026" /></div>
        <div className="field"><label htmlFor="n-prize">Prize line (only if you have proof)</label><input id="n-prize" name="prize" maxLength={120} /></div>
        <div className="field"><label htmlFor="n-img">Image (PNG, JPEG or WebP, up to 6 MB)</label><input id="n-img" name="image" type="file" accept="image/png,image/jpeg,image/webp" /></div>
        <div className="field"><label htmlFor="n-desc">Description</label><textarea id="n-desc" name="description" rows="3" maxLength={600} /></div>
        <label className="check"><input type="checkbox" name="featured" /> Featured</label>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Adding' : 'Add certificate'}</button>
      </form>

      <h2 className="dir">Certificates</h2>
      <ul className="admin-list">
        {certs.map((c) => (
          <li key={c._id}>
            <span className="admin-title">{c.title}<span className="dim"> {c.category}, {c.badge}</span></span>
            <span className="admin-actions">
              <button type="button" className="btn" onClick={() => toggle(c)}>{c.featured ? 'Unfeature' : 'Feature'}</button>
              <button type="button" className="btn btn-danger" onClick={() => remove(c)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="dir">Messages</h2>
      {messages.length === 0 ? <p className="dim">No messages yet.</p> : (
        <ul className="admin-msgs">
          {messages.map((m) => (
            <li key={m._id}>
              <p><strong>{m.name}</strong> <a href={`mailto:${m.email}`}>{m.email}</a></p>
              <p className="dim">{new Date(m.createdAt).toLocaleString()}</p>
              <p className="msg-body">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(KEY) || '');
  const logout = useCallback(() => { sessionStorage.removeItem(KEY); setToken(''); }, []);
  return (
    <main className="wrap admin">
      <p><Link to="/">Back to the site</Link></p>
      <h1 className="admin-h1">Admin</h1>
      {token ? <Dashboard token={token} onLogout={logout} /> : <Login onLogin={setToken} />}
    </main>
  );
}
