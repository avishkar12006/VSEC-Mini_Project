async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Could not reach the server. Check that the API is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status}).`);
    err.fields = data.fields;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getCertificates = () => request('/api/certificates');
export const getProjects = () => request('/api/projects');
export const getExperience = () => request('/api/experience');
export const sendMessage = (payload) =>
  request('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

// Admin
const auth = (token) => ({ 'x-admin-token': token });
export const adminLogin = (token) => request('/api/admin/login', { method: 'POST', headers: auth(token) });
export const adminCertificates = (token) => request('/api/admin/certificates', { headers: auth(token) });
export const adminMessages = (token) => request('/api/admin/messages', { headers: auth(token) });
export const adminCreate = (token, formData) => request('/api/admin/certificates', { method: 'POST', headers: auth(token), body: formData });
export const adminPatch = (token, id, body) =>
  request(`/api/admin/certificates/${id}`, { method: 'PATCH', headers: { ...auth(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const adminDelete = (token, id) => request(`/api/admin/certificates/${id}`, { method: 'DELETE', headers: auth(token) });
