import React, { useEffect, useState } from 'react';
import { getSATenants } from './api';

const badge = (count) => ({
  display: 'inline-block',
  padding: '2px 8px',
  background: count > 0 ? '#dbeafe' : '#f3f4f6',
  color: count > 0 ? '#1d4ed8' : '#9ca3af',
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 600,
});

export default function TenantsTab() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getSATenants()
      .then(d => setTenants(d.tenants || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#6b7280' }}>Đang tải...</div>;
  if (error)   return <div style={{ padding: 24, color: '#b91c1c' }}>Lỗi: {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
        {tenants.length} tenant đã đăng ký
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              {['Slug', 'Tên công ty', 'Plan', 'Users', 'Admins', 'Hoạt động gần nhất', 'Ngày tạo'].map(h => (
                <th key={h} style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => (
              <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                  <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{t.slug}</code>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 500 }}>{t.name || '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ ...badge(1), background: '#dcfce7', color: '#166534' }}>{t.plan || 'free'}</span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={badge(t.user_count)}>{t.user_count}</span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={badge(t.admin_count)}>{t.admin_count}</span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: 13 }}>
                  {t.last_activity ? new Date(t.last_activity + 'Z').toLocaleString('vi-VN') : '—'}
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {new Date(t.created_at + 'Z').toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
