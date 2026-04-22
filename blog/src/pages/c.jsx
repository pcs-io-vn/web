import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTenant() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  return /^[a-z0-9-]{1,50}$/.test(hash) ? hash : null;
}

function getMode(tenant) {
  if (!tenant || typeof window === 'undefined') return null;
  return localStorage.getItem(`pcs_mode_${tenant}`) || null;
}

function setMode(tenant, mode) {
  localStorage.setItem(`pcs_mode_${tenant}`, mode);
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function validateToken() {
  const token = localStorage.getItem('pcs_token');
  if (!token) return null;
  try {
    const res = await fetch('https://auth.pcs.io.vn/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { localStorage.removeItem('pcs_token'); return null; }
    const data = await res.json();
    return data.tenant?.slug || null;
  } catch {
    localStorage.removeItem('pcs_token');
    return null;
  }
}

async function apiLogin(email, password) {
  const res = await fetch('https://auth.pcs.io.vn/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
  return { token: data.token, tenantSlug: data.user?.tenant?.slug };
}

async function apiRegister(companyName, email, password) {
  const slug = slugify(companyName);
  if (slug.length < 2) throw new Error('Tên công ty phải có ít nhất 2 ký tự');
  const res = await fetch('https://auth.pcs.io.vn/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_slug: slug,
      tenant_name: companyName.trim(),
      email: email.toLowerCase().trim(),
      password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
  return apiLogin(email, password);
}

// ─── OAuth callback ────────────────────────────────────────────────────────────
async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return false;
  try {
    const response = await fetch('https://auth.pcs.io.vn/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: '3706e2f9-72e3-49f3-803e-aec4e5cd5614',
        client_secret: '59a144a848c27931f2c742e662402eefcb79427f98e9fa7a066c39f6ee4c73c6',
        code,
        redirect_uri: window.location.origin + window.location.pathname,
      }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('pcs_token', data.access_token);
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      return true;
    }
  } catch {}
  return false;
}

// ─── Landing — 2 panels ───────────────────────────────────────────────────────
function Landing({ onLocalStart, onAuthSuccess }) {
  const [localName, setLocalName] = useState('');
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const localSlug = slugify(localName);
  const localReady = localSlug.length >= 2;

  const handleLocalStart = () => {
    if (!localReady) return;
    setMode(localSlug, 'local');
    window.location.hash = localSlug;
    onLocalStart(localSlug);
  };

  const handleCloudSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      if (tab === 'register') {
        if (!companyName.trim()) throw new Error('Tên công ty không được trống');
        if (!email.includes('@')) throw new Error('Email không hợp lệ');
        if (password.length < 8) throw new Error('Mật khẩu tối thiểu 8 ký tự');
        const { token, tenantSlug } = await apiRegister(companyName, email, password);
        localStorage.setItem('pcs_token', token);
        onAuthSuccess(token, tenantSlug);
      } else {
        if (!email.includes('@')) throw new Error('Email không hợp lệ');
        if (!password) throw new Error('Nhập mật khẩu');
        const { token, tenantSlug } = await apiLogin(email, password);
        localStorage.setItem('pcs_token', token);
        onAuthSuccess(token, tenantSlug);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('https://auth.pcs.io.vn/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.toLowerCase().trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
      setResetMsg('✓ Link đặt lại đã gửi. Kiểm tra email của bạn.');
    } catch (e) {
      setResetMsg(`✗ ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--ifm-color-emphasis-300)',
    background: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    fontFamily: 'inherit',
    fontSize: 14,
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      padding: '48px 24px',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 580 }}>
        <div style={{ fontSize: 12, opacity: 0.45, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
          PCS Platform
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
          Compliance & Quản lý ISO
        </h1>
        <p style={{ opacity: 0.55, fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
          Tự đánh giá tuân thủ ISO 27001 / 42001. Dùng thử ngay không cần tài khoản,
          hoặc đăng nhập để sync dữ liệu nhiều thiết bị.
        </p>
      </div>

      {/* Two panels */}
      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 800, flexWrap: 'wrap', alignItems: 'stretch' }}>

        {/* ── Local panel ── */}
        <div style={{
          flex: 1, minWidth: 280,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 12, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>💾 Dùng thử — Local</div>
            <div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.6 }}>
              Không cần tài khoản. Dữ liệu lưu trên trình duyệt này, không sync thiết bị khác.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <input
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && localReady && handleLocalStart()}
              placeholder="Tên công ty (ví dụ: PCS Vietnam)"
              style={inp}
              autoFocus
            />
            {localName && (
              <div style={{ fontSize: 11, opacity: 0.4 }}>
                URL: pcs.io.vn/c#{localSlug || '...'}
              </div>
            )}
          </div>

          <button
            onClick={handleLocalStart}
            disabled={!localReady}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 8,
              border: '1px solid var(--ifm-color-emphasis-300)',
              background: localReady ? 'var(--ifm-color-emphasis-200)' : 'var(--ifm-color-emphasis-100)',
              color: localReady ? 'var(--ifm-font-color-base)' : 'var(--ifm-color-emphasis-400)',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
              cursor: localReady ? 'pointer' : 'default',
            }}
          >
            Bắt đầu →
          </button>
        </div>

        {/* ── Cloud panel ── */}
        <div style={{
          flex: 1, minWidth: 280,
          border: '2px solid var(--ifm-color-primary)',
          borderRadius: 12, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>☁ Tài khoản PCS</div>
            <div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.6 }}>
              Sync nhiều thiết bị. Dùng được cho Compliance, khóa học và các dịch vụ PCS khác.
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>
            {[['login', 'Đăng nhập'], ['register', 'Đăng ký'], ['forgot', 'Quên mật khẩu']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setResetMsg(''); }} style={{
                flex: 1, padding: '6px 0', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 11,
                fontWeight: tab === t ? 700 : 400,
                borderBottom: tab === t ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
                color: tab === t ? 'var(--ifm-color-primary)' : 'inherit', marginBottom: -1,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {tab === 'register' && (
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Tên công ty (ví dụ: PCS Vietnam)"
                style={inp}
              />
            )}

            {tab !== 'forgot' ? (
              <>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  style={inp}
                />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                  type="password"
                  style={inp}
                  onKeyDown={e => e.key === 'Enter' && !submitting && handleCloudSubmit()}
                />
              </>
            ) : (
              <>
                <input
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="Email tài khoản"
                  type="email"
                  style={inp}
                  onKeyDown={e => e.key === 'Enter' && !submitting && handleForgotPassword()}
                />
                <div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.5 }}>
                  Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.
                </div>
              </>
            )}

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
                {error}
              </div>
            )}
            {resetMsg && (
              <div style={{
                background: resetMsg.includes('✓') ? '#dcfce7' : '#fee2e2',
                color: resetMsg.includes('✓') ? '#166534' : '#991b1b',
                padding: '8px 12px', borderRadius: 6, fontSize: 13,
              }}>
                {resetMsg}
              </div>
            )}

            <button
              onClick={tab === 'forgot' ? handleForgotPassword : handleCloudSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                background: 'var(--ifm-color-primary)', color: '#fff',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Đang xử lý...' : tab === 'forgot' ? 'Gửi link đặt lại' : tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, opacity: 0.35, textAlign: 'center' }}>
        pcs.io.vn/c — PCS Vietnam Platform
      </div>
    </div>
  );
}

// ─── App wrapper ───────────────────────────────────────────────────────────────
function CompliancePageContent() {
  const [tenant, setTenant] = useState(null);
  const [mode, setModeState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  const handleLocalStart = (slug) => {
    setTenant(slug);
    setModeState('local');
    setIsAuthenticated(true);
    setShowLanding(false);
  };

  const handleAuthSuccess = (token, tenantSlug) => {
    const t = tenantSlug || getTenant();
    if (t) {
      setMode(t, 'cloud');
      window.location.hash = t;
      setTenant(t);
    }
    setModeState('cloud');
    setIsAuthenticated(true);
    setShowLanding(false);
  };

  useEffect(() => {
    const onHash = () => {
      const t = getTenant();
      if (t) setTenant(t);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Handle OAuth callback
      const oauthLogged = await handleOAuthCallback();
      if (oauthLogged) {
        const slug = await validateToken();
        if (slug) {
          setMode(slug, 'cloud');
          window.location.hash = slug;
          setTenant(slug);
          setModeState('cloud');
          setIsAuthenticated(true);
        }
        setLoading(false);
        return;
      }

      // Check existing token
      const token = localStorage.getItem('pcs_token');
      if (token) {
        const slug = await validateToken();
        if (slug) {
          setMode(slug, 'cloud');
          window.location.hash = slug;
          setTenant(slug);
          setModeState('cloud');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      }

      // Check saved local mode from URL hash
      const currentTenant = getTenant();
      if (currentTenant) {
        const savedMode = getMode(currentTenant);
        if (savedMode === 'local') {
          setTenant(currentTenant);
          setModeState('local');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      }

      // Nothing matched → show landing
      setShowLanding(true);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang xác thực...
      </div>
    );
  }

  if (showLanding || !isAuthenticated) {
    return <Landing onLocalStart={handleLocalStart} onAuthSuccess={handleAuthSuccess} />;
  }

  const handleLogout = () => {
    if (!window.confirm('Bạn muốn đăng xuất?')) return;
    localStorage.removeItem('pcs_token');
    if (tenant) localStorage.removeItem(`pcs_mode_${tenant}`);
    window.location.hash = '';
    window.location.reload();
  };

  const handleSwitchCompany = () => {
    if (tenant) localStorage.removeItem(`pcs_mode_${tenant}`);
    window.location.hash = '';
    setShowLanding(true);
    setIsAuthenticated(false);
    setModeState(null);
    setTenant(null);
  };

  const ComplianceApp = React.lazy(() => import('../components/ComplianceApp'));

  return (
    <React.Suspense fallback={
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang tải...
      </div>
    }>
      <div style={{ position: 'relative' }}>
        {mode === 'cloud' ? (
          <button
            onClick={handleLogout}
            style={{
              position: 'fixed', top: 16, right: 16, padding: '8px 14px',
              fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6,
              background: '#EF4444', color: 'white', cursor: 'pointer', zIndex: 1000,
            }}
          >
            Đăng xuất
          </button>
        ) : (
          <button
            onClick={handleSwitchCompany}
            style={{
              position: 'fixed', top: 16, right: 16, padding: '8px 14px',
              fontSize: 12, fontWeight: 700, borderRadius: 6,
              border: '1px solid var(--ifm-color-emphasis-300)',
              background: 'var(--ifm-background-surface-color)',
              color: 'var(--ifm-font-color-base)', cursor: 'pointer', zIndex: 1000,
            }}
          >
            Đổi công ty
          </button>
        )}
        <ComplianceApp tenant={tenant} mode={mode} />
      </div>
    </React.Suspense>
  );
}

// ─── Docusaurus page export ────────────────────────────────────────────────────
export default function CompliancePage() {
  return (
    <Layout
      title="PCS Compliance"
      description="Tự đánh giá tuân thủ ISO 27001 / ISO 42001 cho doanh nghiệp nhỏ"
      noFooter={false}
    >
      <BrowserOnly>
        {() => <CompliancePageContent />}
      </BrowserOnly>
    </Layout>
  );
}
