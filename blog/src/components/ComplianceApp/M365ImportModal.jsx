import React, { useState } from 'react';
import { importM365CSV } from './api';

const font = "'IBM Plex Mono', monospace";

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modal: {
    background: '#0D1420', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 28, maxWidth: 520, width: '100%',
    fontFamily: font, color: '#e2e8f0',
  },
  title: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 11, color: '#64748b', marginBottom: 20, lineHeight: 1.7 },
  fileLabel: {
    display: 'flex', alignItems: 'center', gap: 10,
    border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8,
    padding: '12px 16px', cursor: 'pointer', fontSize: 12, color: '#94a3b8',
    marginBottom: 16, background: 'rgba(255,255,255,0.03)',
  },
  btn: (disabled) => ({
    background: disabled ? '#1e293b' : '#1a73e8',
    color: disabled ? '#475569' : '#fff',
    border: 'none', borderRadius: 8, padding: '9px 20px',
    fontSize: 12, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', marginRight: 8,
  }),
  cancelBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8', borderRadius: 8, padding: '9px 16px',
    fontSize: 12, cursor: 'pointer',
  },
  resultBox: {
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: 8, padding: '14px 16px', marginBottom: 16,
  },
  errBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8, padding: '14px 16px', marginBottom: 16, color: '#f87171', fontSize: 12,
  },
  reportRow: {
    display: 'flex', gap: 8, fontSize: 11, padding: '4px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', alignItems: 'center',
  },
  badge: (matched) => ({
    background: matched ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.1)',
    color: matched ? '#4ade80' : '#64748b',
    borderRadius: 4, padding: '1px 7px', fontSize: 10, flexShrink: 0,
    whiteSpace: 'nowrap',
  }),
};

export default function M365ImportModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const r = await importM365CSV(file);
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.title}>↑ Import M365 Secure Score</div>
        <div style={S.sub}>
          Export CSV từ <strong>Microsoft Defender portal → Secure Score → Improvement actions → Export</strong>.<br />
          PCS tự mapping recommendation sang controls ISO 27001 tương ứng.
        </div>

        {!result ? (
          <>
            <label style={S.fileLabel}>
              <span>📁</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file ? file.name : 'Chọn file CSV từ M365 export...'}
              </span>
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => { setFile(e.target.files?.[0] || null); setError(null); }}
              />
            </label>

            {error && <div style={S.errBox}>❌ {error}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={S.btn(!file || loading)} onClick={handleImport} disabled={!file || loading}>
                {loading ? 'Đang xử lý...' : 'Import'}
              </button>
              <button style={S.cancelBtn} onClick={onClose}>Huỷ</button>
            </div>
          </>
        ) : (
          <>
            <div style={S.resultBox}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>
                ✅ Import hoàn thành
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 2 }}>
                Đã cập nhật:&nbsp;<strong style={{ color: '#e2e8f0' }}>{result.updated}</strong> controls
                &nbsp;·&nbsp;
                Bỏ qua:&nbsp;<strong style={{ color: '#e2e8f0' }}>{result.skipped}</strong>
                &nbsp;·&nbsp;
                Không khớp:&nbsp;<strong style={{ color: '#e2e8f0' }}>{result.unmatched}</strong>
              </div>
            </div>

            {/* Debug: show detected columns when nothing was updated */}
            {result.updated === 0 && result.debug?.columns?.length > 0 && (
              <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 11, color: '#fbbf24', lineHeight: 1.7 }}>
                ⚠ Không có control nào được cập nhật. Columns phát hiện trong CSV:<br />
                <code style={{ fontSize: 10, opacity: 0.8 }}>{result.debug.columns.join(', ')}</code><br />
                <span style={{ color: '#94a3b8' }}>Nếu không thấy cột tên action/status, CSV có thể sai format.</span>
              </div>
            )}

            {result.report?.length > 0 && (
              <details style={{ marginBottom: 16 }}>
                <summary style={{ fontSize: 11, color: '#64748b', cursor: 'pointer', marginBottom: 8, userSelect: 'none' }}>
                  Chi tiết mapping ({result.report.length} recommendations)
                </summary>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 6 }}>
                  {result.report.map((row, i) => (
                    <div key={i} style={S.reportRow}>
                      <span style={S.badge(row.matched > 0)}>
                        {row.matched > 0 ? `${row.matched} ctrl` : 'skip'}
                      </span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.title}
                      </span>
                      <span style={{ color: '#475569', flexShrink: 0 }}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btn(false)} onClick={onClose}>Đóng</button>
              <button style={S.cancelBtn} onClick={() => { setResult(null); setFile(null); }}>
                Import thêm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
