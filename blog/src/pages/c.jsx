import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// ─── Đọc tenant slug từ URL hash ──────────────────────────────────────────
function getTenant() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  return /^[a-z0-9-]{1,50}$/.test(hash) ? hash : null;
}

// Mode per tenant: 'local' | 'cloud' — persisted in localStorage
function getMode(tenant) {
  if (!tenant || typeof window === 'undefined') return null;
  return localStorage.getItem(`pcs_mode_${tenant}`) || null;
}

function setMode(tenant, mode) {
  localStorage.setItem(`pcs_mode_${tenant}`, mode);
}

// ─── Landing — 2 mode: dùng thử (local) hoặc đăng nhập (cloud) ───────────
function Landing() {
  const [slug, setSlug] = useState('');
  const ready = slug.trim().length > 0;

  const go = (mode) => {
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!clean) return;
    setMode(clean, mode);
    window.location.hash = clean;
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--ifm-color-emphasis-300)',
    background: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    fontFamily: 'inherit',
    fontSize: 14,
  };

  const btnBase = {
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: 14,
    cursor: ready ? 'pointer' : 'default',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: '48px 24px',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 13, opacity: 0.5, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          PCS Compliance
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Tự đánh giá tuân thủ ISO 27001 / 42001
        </h1>
        <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
          Nhập tên công ty để tạo dashboard riêng cho tổ chức của bạn.
        </p>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420 }}>
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ready && go('local')}
          placeholder="tên-công-ty (ví dụ: pcs-vietnam)"
          style={inputStyle}
          autoFocus
        />
      </div>

      {/* 2 CTA buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 420 }}>
        <button
          onClick={() => go('local')}
          disabled={!ready}
          title="Dữ liệu lưu trên trình duyệt, không cần tài khoản"
          style={{
            ...btnBase,
            flex: 1,
            background: ready ? 'var(--ifm-color-emphasis-200)' : 'var(--ifm-color-emphasis-100)',
            color: ready ? 'var(--ifm-font-color-base)' : 'var(--ifm-color-emphasis-400)',
            border: '1px solid var(--ifm-color-emphasis-300)',
          }}
        >
          Dùng thử — lưu local
        </button>
        <button
          onClick={() => go('cloud')}
          disabled={!ready}
          title="Đăng nhập để lưu dữ liệu lên cloud, truy cập từ nhiều thiết bị"
          style={{
            ...btnBase,
            flex: 1,
            background: ready ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
            color: ready ? '#fff' : 'var(--ifm-color-emphasis-500)',
          }}
        >
          Đăng nhập — cloud sync ☁
        </button>
      </div>

      <div style={{ display: 'flex', gap: 32, fontSize: 11, opacity: 0.4, textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>Local: không cần tài khoản, data trên máy này</span>
        <span>Cloud: cần đăng nhập, sync nhiều thiết bị</span>
      </div>

      <div style={{ fontSize: 12, opacity: 0.35, textAlign: 'center' }}>
        URL: <code>pcs.io.vn/c#{slug || 'ten-cong-ty'}</code>
      </div>
    </div>
  );
}

// ─── OAuth callback handler ────────────────────────────────────────────────
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
  } catch (err) {
    console.error('OAuth callback error:', err);
  }

  return false;
}

// ─── App wrapper ───────────────────────────────────────────────────────────
function CompliancePageContent() {
  const [tenant, setTenant] = useState(getTenant);
  const [mode, setModeState] = useState(null);   // 'local' | 'cloud'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onHash = () => setTenant(getTenant());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Handle OAuth callback (cloud mode returning from auth.pcs.io.vn)
      const logged = await handleOAuthCallback();
      if (logged) {
        if (tenant) setMode(tenant, 'cloud');
        setModeState('cloud');
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      if (!tenant) {
        setLoading(false);
        return;
      }

      const savedMode = getMode(tenant);
      const token = localStorage.getItem('pcs_token');

      if (token) {
        // Already have JWT → cloud mode regardless
        setModeState('cloud');
        setIsAuthenticated(true);
      } else if (savedMode === 'cloud') {
        // Cloud mode, no token → redirect to OAuth
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const authUrl = new URL('https://auth.pcs.io.vn/oauth/authorize');
        authUrl.searchParams.set('client_id', '3706e2f9-72e3-49f3-803e-aec4e5cd5614');
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'mcp');
        window.location.href = authUrl.toString();
        return;
      } else if (savedMode === 'local') {
        // Local mode — no auth needed
        setModeState('local');
        setIsAuthenticated(true);
      } else {
        // No mode chosen yet → back to landing (show landing for this tenant too)
        setLoading(false);
        return;
      }

      setLoading(false);
    })();
  }, [tenant]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang xác thực...
      </div>
    );
  }

  // No tenant or no mode chosen → Landing
  if (!tenant || !getMode(tenant)) return <Landing />;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.7, fontFamily: 'monospace' }}>
        Đang chuyển hướng đến đăng nhập...
      </div>
    );
  }

  const ComplianceApp = React.lazy(() => import('../components/ComplianceApp'));

  return (
    <React.Suspense fallback={
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang tải...
      </div>
    }>
      <ComplianceApp tenant={tenant} mode={mode} />
    </React.Suspense>
  );
}

// ─── Docusaurus page export ────────────────────────────────────────────────
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
