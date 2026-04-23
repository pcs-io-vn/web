import React, { useEffect, useState } from 'react';
import { getSAUsers } from './api';

const roleBadge = (role) => {
  const styles = {
    superadmin: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
    admin:      { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    member:     { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' },
    viewer:     { background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' },
  };
  return {
    display: 'inline-block', padding: '2px 8px', borderRadius: 12,
    fontSize: 12, fontWeight: 600,
    ...(styles[role] || styles.member),
  };
};

export default function UsersTab() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [offset,  setOffset]  = useState(0);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    getSAUsers(limit, offset)
      .then(d => { setUsers(d.users || []); setTotal(d.total || 0); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [offset]);

  if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>Lỗi: {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
        {total} user tổng cộng (tất cả tenants)
        {total > limit && (
          <span> — trang {Math.floor(offset / limit) + 1}/{Math.ceil(total / limit)}</span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 24, color: '#6b7280' }}>Đang tải...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                {['Email', 'Tenant', 'Role', 'Đăng ký', 'Login gần nhất'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                    {u.tenant_slug
                      ? <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{u.tenant_slug}</code>
                      : <span style={{ color: '#9ca3af', fontSize: 12 }}>cá nhân</span>}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={roleBadge(u.role)}>{u.role}</span>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {new Date(u.created_at + 'Z').toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {u.last_login_at ? new Date(u.last_login_at + 'Z').toLocaleString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            style={{ padding: '6px 16px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: offset === 0 ? 'not-allowed' : 'pointer', opacity: offset === 0 ? 0.4 : 1 }}
          >← Trước</button>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            style={{ padding: '6px 16px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: offset + limit >= total ? 'not-allowed' : 'pointer', opacity: offset + limit >= total ? 0.4 : 1 }}
          >Sau →</button>
        </div>
      )}
    </div>
  );
}
