import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

function ResetPasswordContent() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Read token + email from URL params
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const e = params.get('email');
    if (t && e) {
      setToken(t);
      setEmail(decodeURIComponent(e));
      setTokenValid(true);
    } else {
      setError('Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu đặt lại mật khẩu lại.');
    }
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Validation
    if (!newPassword || newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('https://auth.pcs.io.vn/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || `Lỗi ${res.status}`);
      }

      setSuccess('✓ Mật khẩu đã được đặt lại thành công. Đang chuyển hướng...');
      setTimeout(() => {
        window.location.href = '/c';
      }, 2000);
    } catch (e) {
      setError(`✗ ${e.message}`);
    } finally {
      setSubmitting(false);
    }
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
    width: '100%',
    boxSizing: 'border-box',
  };

  const btnBase = {
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
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
          Đặt lại mật khẩu
        </h1>
        <p style={{ opacity: 0.6, fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
          Nhập mật khẩu mới để hoàn tất quá trình đặt lại.
        </p>
      </div>

      {!tokenValid ? (
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 13,
          textAlign: 'center',
        }}>
          {error}
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }}>Email</label>
            <input
              value={email}
              disabled
              style={{
                ...inputStyle,
                opacity: 0.6,
                cursor: 'not-allowed',
                background: 'var(--ifm-color-emphasis-100)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }}>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Ít nhất 8 ký tự"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && !submitting && handleSubmit()}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }}>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && !submitting && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 13,
            }}>
              {success}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !tokenValid}
            style={{
              ...btnBase,
              background: 'var(--ifm-color-primary)',
              color: '#fff',
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              width: '100%',
            }}
          >
            {submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <a href="/c" style={{
            fontSize: 12,
            opacity: 0.5,
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}>
            ← Quay lại đăng nhập
          </a>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Layout title="Đặt lại mật khẩu" description="Đặt lại mật khẩu tài khoản PCS Vietnam">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => <ResetPasswordContent />}
      </BrowserOnly>
    </Layout>
  );
}
