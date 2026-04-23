import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from './api';

const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
  background: '#f9fafb',
};
const tdStyle = { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: 14 };

function fmtDate(s) {
  if (!s) return '—';
  try {
    return new Date(s.replace(' ', 'T') + 'Z').toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch { return s; }
}

function roleBadge(role) {
  const colors = {
    admin:  { bg: '#fef3c7', fg: '#92400e' },
    member: { bg: '#dbeafe', fg: '#1e40af' },
    viewer: { bg: '#f3f4f6', fg: '#374151' },
  };
  const c = colors[role] || colors.viewer;
  return (
    <span style={{
      background: c.bg, color: c.fg, padding: '2px 10px',
      borderRadius: 999, fontSize: 12, fontWeight: 600,
    }}>{role}</span>
  );
}

export default function UsersTab({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setUsers(await getUsers());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(u) {
    if (u.id === currentUserId) {
      alert('Không thể xóa chính tài khoản đang đăng nhập.');
      return;
    }
    if (!confirm(`Xóa tài khoản ${u.email}?\nUser sẽ không login được nữa (soft delete).`)) return;
    setBusy(u.id);
    try {
      await deleteUser(u.id);
      await load();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div style={{ color: '#6b7280' }}>Đang tải danh sách user…</div>;
  if (error)   return <div style={{ color: '#b91c1c' }}>Lỗi: {error}</div>;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Đăng ký</th>
            <th style={thStyle}>Login gần nhất</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr><td style={tdStyle} colSpan={5}>Chưa có user nào.</td></tr>
          )}
          {users.map((u) => (
            <tr key={u.id}>
              <td style={tdStyle}>
                {u.email}
                {u.id === currentUserId && (
                  <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 6 }}>(bạn)</span>
                )}
              </td>
              <td style={tdStyle}>{roleBadge(u.role)}</td>
              <td style={tdStyle}>{fmtDate(u.created_at)}</td>
              <td style={tdStyle}>{fmtDate(u.last_login_at)}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <button
                  onClick={() => handleDelete(u)}
                  disabled={busy === u.id || u.id === currentUserId}
                  style={{
                    padding: '6px 12px',
                    background: u.id === currentUserId ? '#f3f4f6' : '#fee2e2',
                    color:      u.id === currentUserId ? '#9ca3af' : '#991b1b',
                    border: '1px solid transparent',
                    borderRadius: 6,
                    cursor: u.id === currentUserId ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                  }}
                >
                  {busy === u.id ? 'Đang xóa…' : 'Xóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
