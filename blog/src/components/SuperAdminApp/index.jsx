import React, { useEffect, useState } from 'react';
import TenantsTab from './TenantsTab';
import UsersTab   from './UsersTab';
import { getSAStats, getMe } from './api';

const card = (label, value, sub, color = '#0066cc') => (
  <div key={label} style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
    padding: '20px 24px', flex: 1, minWidth: 140,
  }}>
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
  </div>
);

const tabBtn = (active) => ({
  padding: '8px 16px',
  background: active ? '#7c3aed' : 'transparent',
  color:      active ? '#fff'    : '#374151',
  border: '1px solid ' + (active ? '#7c3aed' : '#e5e7eb'),
  borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500,
});

export default function SuperAdminApp({ onLogout }) {
  const [tab,     setTab]     = useState('tenants');
  const [stats,   setStats]   = useState(null);
  const [me,      setMe]      = useState(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    Promise.all([getMe(), getSAStats()])
      .then(([meData, statsData]) => {
        setMe(meData);
        setStats(statsData);
      })
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>Lỗi: {error}</div>;
  if (!me)   return <div style={{ padding: 80, textAlign: 'center', color: '#6b7280' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 24 }}>Super Admin — PCS Vietnam</h1>
            <span style={{
              background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 12, letterSpacing: '0.05em',
            }}>SUPERADMIN</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            {me.user?.email}
          </div>
        </div>
        <button onClick={onLogout} style={{
          padding: '8px 14px', background: '#fee2e2', color: '#991b1b',
          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
        }}>Đăng xuất</button>
      </header>

      {/* Stats Overview */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          {card('Tổng tenants',    stats.tenants,       'company đã đăng ký', '#7c3aed')}
          {card('Tổng users',      stats.total_users,   'tất cả tenants')}
          {card('Active 7 ngày',   stats.active_7d,     'đã login trong tuần', '#059669')}
          {card('Mới tuần này',    stats.new_this_week, 'đăng ký mới 7 ngày', '#d97706')}
          {card('Cá nhân',         stats.individual,    'không có tenant', '#6b7280')}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(tab === 'tenants')} onClick={() => setTab('tenants')}>Tenants</button>
        <button style={tabBtn(tab === 'users')}   onClick={() => setTab('users')}>All Users</button>
      </div>

      {tab === 'tenants' && <TenantsTab />}
      {tab === 'users'   && <UsersTab />}
    </div>
  );
}
