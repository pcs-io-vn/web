import React, { useEffect, useState } from 'react';
import { getStats } from './api';

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '20px 24px',
  flex: 1,
  minWidth: 180,
};
const labelStyle = { fontSize: 13, color: '#6b7280', marginBottom: 6 };
const valueStyle = { fontSize: 32, fontWeight: 700, color: '#111827' };

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ color: '#b91c1c' }}>Lỗi: {error}</div>;
  if (!stats) return <div style={{ color: '#6b7280' }}>Đang tải số liệu…</div>;

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Tổng user</div>
        <div style={valueStyle}>{stats.total_users}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Active 7 ngày</div>
        <div style={valueStyle}>{stats.active_7d}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Admin</div>
        <div style={valueStyle}>{stats.admins}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Đã xóa</div>
        <div style={valueStyle}>{stats.deleted_users}</div>
      </div>
    </div>
  );
}
