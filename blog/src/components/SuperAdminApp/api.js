const AUTH_BASE = 'https://auth.pcs.io.vn';

function getToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('pcs_token') : null;
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${AUTH_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getMe        = ()             => apiFetch('/auth/me');
export const getSAStats   = ()             => apiFetch('/superadmin/stats');
export const getSATenants = ()             => apiFetch('/superadmin/tenants');
export const getSAUsers   = (limit = 100, offset = 0) =>
  apiFetch(`/superadmin/users?limit=${limit}&offset=${offset}`);
