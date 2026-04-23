// Admin API client — wrapper for auth.pcs.io.vn/admin/* endpoints
const AUTH_BASE = 'https://auth.pcs.io.vn';

function authHeader() {
  const token = localStorage.getItem('pcs_token');
  if (!token) throw new Error('Chưa đăng nhập');
  return { Authorization: `Bearer ${token}` };
}

export async function getUsers() {
  const res = await fetch(`${AUTH_BASE}/admin/users`, { headers: authHeader() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `GET users failed: ${res.status}`);
  return data.users || [];
}

export async function deleteUser(userId) {
  const res = await fetch(`${AUTH_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `DELETE user failed: ${res.status}`);
  return data;
}

export async function getStats() {
  const res = await fetch(`${AUTH_BASE}/admin/stats`, { headers: authHeader() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `GET stats failed: ${res.status}`);
  return data;
}

export async function getMe() {
  const res = await fetch(`${AUTH_BASE}/auth/me`, { headers: authHeader() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `GET me failed: ${res.status}`);
  return data;
}
