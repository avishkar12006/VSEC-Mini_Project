export default function RequestPreview({ form, status, error }) {
  const truncate = (s, max) => (s && s.length > max ? s.slice(0, max) + '…' : s || '');

  const bodyObj = {
    name: truncate(form.name, 40),
    email: truncate(form.email, 60),
    message: truncate(form.message, 120)
  };

  let responseLine = '';
  if (status === 'sent') responseLine = '< 200 OK  {"ok":true}';
  else if (status === 'error') responseLine = `< 400     {"error":"${truncate(error, 60)}"}`;
  else if (status === 'sending') responseLine = '< …waiting';

  return (
    <div className="req-preview" aria-hidden="true">
      <div className="nf-bar">
        <span className="nf-bar-dots" aria-hidden="true"><span /><span /><span /></span>
        <span>~/contact/request</span>
      </div>
      <div className="req-body">
        <div className="req-line req-method">POST /api/contact</div>
        <div className="req-line req-header">Content-Type: application/json</div>
        <pre className="req-json">{JSON.stringify(bodyObj, null, 2)}</pre>
        {responseLine && (
          <div className={`req-line ${status === 'sent' ? 'req-ok' : status === 'error' ? 'req-err' : 'req-dim'}`}>
            {responseLine}
          </div>
        )}
      </div>
    </div>
  );
}
