import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import AdminApp from '@site/src/components/AdminApp';

const AUTH_BASE = 'https://auth.pcs.io.vn';

function getTenant() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  return /^[a-z0-9-]{1,50}$/.test(hash) ? hash : null;
}

async function validateToken() {
  const token = localStorage.getItem('pcs_token');
  if (!token) return null;
  try {
    const res = await fetch(`${AUTH_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { localStorage.removeItem('pcs_token'); return null; }
    return await res.json();
  } catch {
    localStorage.removeItem('pcs_token');
    return null;
  }
}

function LoginPanel({ onSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const res = await fetch(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
      localStorage.setItem('pcs_token', data.token);
      onSuccess(data.user?.tenant?.slug);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Đăng nhập quản trị</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        Khu vực dành cho admin của tenant. Chỉ tài khoản có role <code>admin</code> mới vào được.
      </p>
      <form onSubmit={submit}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 16, boxSizing: 'border-box' }} />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mật khẩu</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 16, boxSizing: 'border-box' }} />
        {error && <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={busy} style={{
          width: '100%', padding: 12, background: '#0066cc', color: '#fff',
          border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600,
          cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1,
        }}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
      <div style={{ marginTop: 24, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
        Không có tài khoản? <a href="/c" style={{ color: '#0066cc' }}>Đăng ký ở Compliance Tracker</a>
      </div>
    </div>
  );
}

function AdminPage() {
  const [state, setState]   = useState('loading'); // loading | login | ready
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await validateToken();
      if (!data) { setState('login'); return; }
      const slug = data.tenant?.slug;
      const hashTenant = getTenant();
      if (slug && (!hashTenant || hashTenant !== slug)) {
        window.location.hash = slug;
      }
      setTenant(slug);
      setState('ready');
    })();
  }, []);

  function handleLoginSuccess(slug) {
    if (slug) window.location.hash = slug;
    setTenant(slug);
    setState('ready');
  }

  function handleLogout() {
    localStorage.removeItem('pcs_token');
    setTenant(null);
    setState('login');
  }

  if (state === 'loading') {
    return <div style={{ padding: 80, textAlign: 'center', color: '#6b7280' }}>Đang xác thực…</div>;
  }
  if (state === 'login') {
    return <LoginPanel onSuccess={handleLoginSuccess} />;
  }
  return <AdminApp tenant={tenant} onLogout={handleLogout} />;
}

export default function Admin() {
  return (
    <Layout title="Quản trị — PCS Vietnam" description="Admin panel for PCS tenants">
      <BrowserOnly>{() => <AdminPage />}</BrowserOnly>
    </Layout>
  );
}
