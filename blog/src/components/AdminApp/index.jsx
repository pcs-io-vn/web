import React, { useEffect, useState } from 'react';
import Overview  from './Overview';
import UsersTab  from './UsersTab';
import { getMe } from './api';

const tabBtn = (active) => ({
  padding: '8px 16px',
  background: active ? '#0066cc' : 'transparent',
  color:      active ? '#fff'    : '#374151',
  border: '1px solid ' + (active ? '#0066cc' : '#e5e7eb'),
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
});

export default function AdminApp({ tenant, onLogout, onSwitchCompany }) {
  const [tab, setTab] = useState('users');
  const [me, setMe] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe().then((data) => {
      if (data.user?.role !== 'admin') {
        setForbidden(true);
      } else {
        setMe(data);
      }
    }).catch((e) => setError(e.message));
  }, []);

  if (forbidden) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: 32, textAlign: 'center', background: '#fff', border: '1px solid #fecaca', borderRadius: 8 }}>
        <h2 style={{ color: '#991b1b', marginTop: 0 }}>Không có quyền truy cập</h2>
        <p>Trang quản trị chỉ dành cho tài khoản có role <strong>admin</strong>.</p>
        <a href={`/c#${tenant}`} style={{ color: '#0066cc' }}>← Quay về Compliance Tracker</a>
      </div>
    );
  }

  if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>Lỗi: {error}</div>;
  if (!me)   return <div style={{ padding: 24, color: '#6b7280' }}>Đang xác thực…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Quản trị — {me.tenant?.name || tenant}</h1>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Đăng nhập: <strong>{me.user?.email}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`/c#${tenant}`} style={{
            padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 6,
            textDecoration: 'none', color: '#374151', fontSize: 14,
          }}>← Compliance</a>
          <button onClick={onLogout} style={{
            padding: '8px 14px', background: '#fee2e2', color: '#991b1b',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
          }}>Đăng xuất</button>
        </div>
      </header>

      <Overview />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(tab === 'users')}    onClick={() => setTab('users')}>Users</button>
      </div>

      {tab === 'users' && <UsersTab currentUserId={me.user?.id} />}
    </div>
  );
}
