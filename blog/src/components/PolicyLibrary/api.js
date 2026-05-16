// Policy Library API client
const API = 'https://mcp.pcs.io.vn';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('pcs_token') : null;
}

function authHeaders() {
  const token = getToken();
  if (!token) throw new Error('No auth token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchStandards() {
  const res = await fetch(`${API}/policies/templates`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json(); // { standards: [{ standard, total, sections }] }
}

export async function fetchSection(standard, section) {
  const res = await fetch(`${API}/policies/templates/${standard}/${section}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json(); // { standard, section, title, controls: [] }
}

export async function fetchControl(standard, section, controlId) {
  const res = await fetch(`${API}/policies/templates/${standard}/${section}/${controlId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function applyTemplates(standard = 'iso27001') {
  const res = await fetch(`${API}/compliance/templates/apply`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ standard }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json(); // { ok, created, skipped, total }
}
