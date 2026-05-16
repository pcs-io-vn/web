import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

const API_AUTH = 'https://auth.pcs.io.vn';

const S = {
  loginWrap: { maxWidth: 380, margin: '80px auto', padding: 24, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: 24 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '10px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  errMsg: { color: '#d32f2f', fontSize: 13, marginTop: 8 },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', borderBottom: '1px solid #eee', background: '#fff' },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#1a73e8' },
  logoutBtn: { background: 'none', border: '1px solid #ddd', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#666' },
};

function LoginGate({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_AUTH}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `Lỗi ${res.status}`);
      localStorage.setItem('pcs_token', d.token);
      onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.loginWrap}>
      <div style={S.title}>📋 Policy Library</div>
      <div style={S.subtitle}>Đăng nhập để xem thư viện ISO 27001 & ISO 42001</div>
      <form onSubmit={handleLogin}>
        <input style={S.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={S.input} type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
        <button style={S.btn} type="submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        {error && <div style={S.errMsg}>{error}</div>}
      </form>
    </div>
  );
}

function PolicyApp() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pcs_token');
    if (!token) { setChecking(false); return; }
    fetch(`${API_AUTH}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.ok) setAuthed(true); else localStorage.removeItem('pcs_token'); })
      .catch(() => localStorage.removeItem('pcs_token'))
      .finally(() => setChecking(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('pcs_token');
    setAuthed(false);
  }

  if (checking) return <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Đang tải...</div>;
  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;

  // Lazy-load PolicyLibrary only when authed (avoids SSR issues)
  const PolicyLibrary = require('../components/PolicyLibrary').default;

  return (
    <>
      <div style={S.headerBar}>
        <div style={S.headerTitle}>📋 Policy Library — ISO 27001 & ISO 42001</div>
        <button style={S.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
      </div>
      <PolicyLibrary />
    </>
  );
}

export default function PoliciesPage() {
  return (
    <Layout title="Policy Library" description="Thư viện chính sách ISO 27001 & ISO 42001">
      <BrowserOnly fallback={<div style={{ padding: 60, textAlign: 'center' }}>Đang tải...</div>}>
        {() => <PolicyApp />}
      </BrowserOnly>
    </Layout>
  );
}
