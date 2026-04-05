import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// ─── Đọc tenant slug từ URL hash ──────────────────────────────────────────
// pcs.io.vn/c           → tenant = null  → hiện landing
// pcs.io.vn/c#kiena     → tenant = "kiena"
// pcs.io.vn/c#abc-corp  → tenant = "abc-corp"

function getTenant() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  // Chỉ cho phép: chữ cái, số, dấu gạch ngang
  return /^[a-z0-9-]{1,50}$/.test(hash) ? hash : null;
}

// ─── Landing — hiện khi chưa có tenant ────────────────────────────────────
function Landing() {
  const [slug, setSlug] = useState('');

  const go = () => {
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (clean) window.location.hash = clean;
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
        <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7 }}>
          Nhập tên công ty để tạo dashboard riêng cho tổ chức của bạn.
          Data lưu trên máy bạn, không gửi đi đâu.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 400 }}>
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="tên-công-ty (ví dụ: kiena)"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-surface-color)',
            color: 'var(--ifm-font-color-base)',
            fontFamily: 'inherit',
            fontSize: 14,
          }}
        />
        <button
          onClick={go}
          disabled={!slug.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: slug.trim() ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
            color: slug.trim() ? '#fff' : 'var(--ifm-color-emphasis-500)',
            cursor: slug.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 14,
            transition: 'all 0.15s',
          }}
        >
          Bắt đầu →
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.4, textAlign: 'center' }}>
        URL của bạn sẽ là:{' '}
        <code>pcs.io.vn/c#{slug || 'ten-cong-ty'}</code>
        {' '}— bookmark lại để vào lần sau
      </div>
    </div>
  );
}

// ─── OAuth callback handler — catch ?code= from redirect ──────────────────
async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  if (!code) return false;

  try {
    // Exchange code for JWT
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

    if (!response.ok) {
      console.error('OAuth token exchange failed:', response.status);
      return false;
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('pcs_token', data.access_token);
      // Remove code from URL
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      return true;
    }
  } catch (err) {
    console.error('OAuth callback error:', err);
  }

  return false;
}

// ─── App wrapper — lazy load ComplianceApp để tránh SSR ───────────────────
function CompliancePageContent() {
  const [tenant, setTenant] = useState(getTenant);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lắng nghe hashchange để navigate giữa tenant / landing
  useEffect(() => {
    const onHash = () => setTenant(getTenant());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Check auth + handle OAuth callback
  useEffect(() => {
    (async () => {
      // Try OAuth callback first
      const logged = await handleOAuthCallback();
      if (logged) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check for existing token
      const token = localStorage.getItem('pcs_token');
      if (token) {
        setIsAuthenticated(true);
      } else if (tenant) {
        // No token + tenant present → redirect to OAuth
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const authUrl = new URL('https://auth.pcs.io.vn/oauth/authorize');
        authUrl.searchParams.set('client_id', '3706e2f9-72e3-49f3-803e-aec4e5cd5614');
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'mcp');
        authUrl.searchParams.set('code_challenge_method', 'S256');
        window.location.href = authUrl.toString();
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

  if (!tenant) return <Landing />;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.7, fontFamily: 'monospace' }}>
        Đang chuyển hướng đến đăng nhập...
      </div>
    );
  }

  // Lazy import ComplianceApp — chỉ load khi có tenant + auth
  const ComplianceApp = React.lazy(() =>
    import('../components/ComplianceApp')
  );

  return (
    <React.Suspense fallback={
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang tải...
      </div>
    }>
      <ComplianceApp tenant={tenant} />
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
      {/*
        BrowserOnly: Docusaurus render HTML tĩnh server-side trước.
        localStorage và window.location.hash chỉ có trong browser.
        BrowserOnly đảm bảo component này chỉ chạy ở client.
      */}
      <BrowserOnly>
        {() => <CompliancePageContent />}
      </BrowserOnly>
    </Layout>
  );
}
