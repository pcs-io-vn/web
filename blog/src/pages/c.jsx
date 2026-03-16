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

// ─── App wrapper — lazy load ComplianceApp để tránh SSR ───────────────────
function CompliancePageContent() {
  const [tenant, setTenant] = useState(getTenant);

  // Lắng nghe hashchange để navigate giữa tenant / landing
  useEffect(() => {
    const onHash = () => setTenant(getTenant());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!tenant) return <Landing />;

  // Lazy import ComplianceApp — chỉ load khi có tenant
  const ComplianceApp = React.lazy(() =>
    import('../../components/ComplianceApp')
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
