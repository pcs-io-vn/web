import React, { useState, useEffect } from 'react';
import { fetchControl } from './api';

const S = {
  wrap: { padding: '0 24px 40px' },
  back: { background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13, marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 4 },
  badge: { display: 'inline-block', background: '#e8f0fe', color: '#1a73e8', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600, marginRight: 8 },
  title: { fontSize: 20, fontWeight: 700, margin: '0 0 4px' },
  titleVi: { fontSize: 14, color: '#666', margin: '0 0 20px' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 8 },
  bg: { background: '#f8f9fa', borderLeft: '3px solid #1a73e8', padding: '12px 16px', borderRadius: '0 4px 4px 0', fontSize: 14, lineHeight: 1.6, color: '#333' },
  bgVi: { background: '#f8f9fa', borderLeft: '3px solid #34a853', padding: '12px 16px', borderRadius: '0 4px 4px 0', fontSize: 14, lineHeight: 1.6, color: '#333', marginTop: 8 },
  stmtList: { margin: 0, paddingLeft: 20 },
  stmtItem: { fontSize: 14, lineHeight: 1.7, marginBottom: 6, color: '#333' },
  stmtViItem: { fontSize: 14, lineHeight: 1.7, marginBottom: 6, color: '#555' },
  langToggle: { display: 'flex', gap: 8, marginBottom: 12 },
  langBtn: (active) => ({
    padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: '1px solid #ddd',
    background: active ? '#1a73e8' : '#fff',
    color: active ? '#fff' : '#666',
  }),
  applyBtn: {
    background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 6,
    padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginRight: 8,
  },
  downloadBtn: {
    background: '#fff', color: '#1a73e8', border: '1px solid #1a73e8', borderRadius: 6,
    padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  note: { background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#614700', marginTop: 16 },
  loading: { textAlign: 'center', padding: 40, color: '#999', fontSize: 14 },
  error: { color: '#d32f2f', padding: 20, fontSize: 14 },
};

export default function ControlDetail({ standard, section, controlId, onBack, onApplyDone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en'); // 'en' | 'vi' | 'both'
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null); setData(null);
    fetchControl(standard, section, controlId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [standard, section, controlId]);

  function downloadMd() {
    if (!data) return;
    const lines = [
      `# ${data.control_id} — ${data.control_name}`,
      data.control_name_vi ? `*${data.control_name_vi}*` : '',
      '',
      '## Background',
      data.background || '',
      data.background_vi ? `\n*${data.background_vi}*` : '',
      '',
      '## Policy Statements',
      ...(data.statements || []).map((s, i) => `${i + 1}. ${s}`),
      '',
      data.statements_vi?.length ? '## Tuyên bố chính sách' : '',
      ...(data.statements_vi || []).map((s, i) => `${i + 1}. ${s}`),
      data.notes ? `\n**Notes:** ${data.notes}` : '',
    ].filter(l => l !== undefined);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${data.control_id}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={S.loading}>Đang tải...</div>;
  if (error) return <div style={S.error}>Lỗi: {error}</div>;
  if (!data) return null;

  const showEn = lang === 'en' || lang === 'both';
  const showVi = lang === 'vi' || lang === 'both';

  return (
    <div style={S.wrap}>
      <button style={S.back} onClick={onBack}>← Quay lại</button>

      <div>
        <span style={S.badge}>{data.control_id}</span>
      </div>
      <h2 style={S.title}>{data.control_name}</h2>
      {data.control_name_vi && <p style={S.titleVi}>{data.control_name_vi}</p>}

      {/* Language toggle */}
      <div style={S.langToggle}>
        {['en', 'vi', 'both'].map(l => (
          <button key={l} style={S.langBtn(lang === l)} onClick={() => setLang(l)}>
            {l === 'en' ? 'English' : l === 'vi' ? 'Tiếng Việt' : 'Song ngữ'}
          </button>
        ))}
      </div>

      {/* Background */}
      {(data.background || data.background_vi) && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Background / Nền tảng</div>
          {showEn && data.background && <div style={S.bg}>{data.background}</div>}
          {showVi && data.background_vi && <div style={S.bgVi}>{data.background_vi}</div>}
        </div>
      )}

      {/* Statements */}
      {(data.statements?.length > 0 || data.statements_vi?.length > 0) && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Policy Statements / Tuyên bố chính sách</div>
          {showEn && data.statements?.length > 0 && (
            <ol style={S.stmtList}>
              {data.statements.map((s, i) => <li key={i} style={S.stmtItem}>{s}</li>)}
            </ol>
          )}
          {showVi && data.statements_vi?.length > 0 && (
            <ol style={{ ...S.stmtList, marginTop: showEn ? 12 : 0 }}>
              {data.statements_vi.map((s, i) => <li key={i} style={S.stmtViItem}>{s}</li>)}
            </ol>
          )}
        </div>
      )}

      {/* Notes */}
      {data.notes && <div style={S.note}><strong>Ghi chú:</strong> {data.notes}</div>}

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={S.downloadBtn} onClick={downloadMd}>↓ Tải Markdown</button>
        {applyMsg && <span style={{ fontSize: 13, color: applyMsg.includes('✅') ? '#2e7d32' : '#d32f2f' }}>{applyMsg}</span>}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: '#aaa' }}>
        Version {data.version} · Cập nhật {data.updated_at?.split(' ')[0]}
      </div>
    </div>
  );
}
