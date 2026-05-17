import React, { useState, useEffect } from 'react';
import {
  getPolicyStandards, getPolicySection, getPolicyControl,
  savePolicyDraft, publishPolicyDraft,
} from './api';

const STD_LABEL = { iso27001: 'ISO 27001:2013', iso42001: 'ISO 42001:2024' };

// ── Helpers ────────────────────────────────────────────────────────────────

function parseStatements(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [raw]; }
}

function statementsToText(arr) {
  return Array.isArray(arr) ? arr.join('\n') : '';
}

function textToStatements(text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean);
}

// ── Styles ─────────────────────────────────────────────────────────────────

const S = {
  wrap:    { display: 'flex', gap: 0, minHeight: '60vh', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' },
  sidebar: { width: 220, flexShrink: 0, borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#fafafa' },
  stdHdr:  { padding: '8px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' },
  secBtn:  (active) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    padding: '7px 14px', fontSize: 12,
    background: active ? '#ede9fe' : 'transparent',
    color:      active ? '#7c3aed' : '#374151',
    fontWeight: active ? 700 : 400,
    borderBottom: '1px solid #f3f4f6',
  }),
  cnt:     { fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 10, padding: '1px 6px' },
  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  toolbar: { display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid #e5e7eb', alignItems: 'center', background: '#fff', flexShrink: 0 },
  search:  { flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none' },
  list:    { flex: 1, overflowY: 'auto' },
  ctrlRow: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
    cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
    background: active ? '#ede9fe' : '#fff',
  }),
  ctrlId:   { fontSize: 11, fontWeight: 700, color: '#7c3aed', minWidth: 70 },
  ctrlName: { fontSize: 13, color: '#111827', flex: 1 },
  ctrlVi:   { fontSize: 11, color: '#9ca3af' },
  chevron:  { color: '#d1d5db', fontSize: 16 },
  empty:    { padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 },

  // Edit panel
  editWrap: { flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#fff' },
  backBtn:  { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 12, padding: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 },
  badge:    { display: 'inline-block', background: '#ede9fe', color: '#7c3aed', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginBottom: 8 },
  editTitle:{ fontSize: 18, fontWeight: 700, margin: '0 0 2px' },
  editVi:   { fontSize: 13, color: '#6b7280', margin: '0 0 16px' },
  tabRow:   { display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 16 },
  tabBtn:   (active) => ({
    padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: active ? 700 : 400,
    color: active ? '#7c3aed' : '#6b7280',
    borderBottom: `2px solid ${active ? '#7c3aed' : 'transparent'}`,
    marginBottom: -2,
  }),
  fieldLbl: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 4, marginTop: 14 },
  textarea: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' },
  hint:     { fontSize: 11, color: '#9ca3af', marginTop: 3 },
  actionRow:{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' },
  saveBtn:  (loading) => ({ background: loading ? '#e5e7eb' : '#7c3aed', color: loading ? '#9ca3af' : '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }),
  pubBtn:   (loading) => ({ background: loading ? '#e5e7eb' : '#059669', color: loading ? '#9ca3af' : '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }),
  msg:      (ok) => ({ fontSize: 12, color: ok ? '#059669' : '#dc2626' }),
  meta:     { fontSize: 11, color: '#9ca3af', marginTop: 8 },
};

// ── Edit Panel ─────────────────────────────────────────────────────────────

function EditPanel({ control, onBack, onSaved }) {
  const [lang, setLang] = useState('en'); // 'en' | 'vi'
  const [bg,      setBg]      = useState(control.background    || '');
  const [bgVi,    setBgVi]    = useState(control.background_vi || '');
  const [stmts,   setStmts]   = useState(statementsToText(parseStatements(control.statements)));
  const [stmtsVi, setStmtsVi] = useState(statementsToText(parseStatements(control.statements_vi)));
  const [notes,   setNotes]   = useState(control.notes || '');
  const [saving,  setSaving]  = useState(false);
  const [pubbing, setPubbing] = useState(false);
  const [msg,     setMsg]     = useState(null); // {ok, text}
  const [version, setVersion] = useState(control.version || 1);

  async function handleSave() {
    setSaving(true); setMsg(null);
    try {
      await savePolicyDraft(control.id, {
        background:    bg      || null,
        background_vi: bgVi    || null,
        statements:    JSON.stringify(textToStatements(stmts)),
        statements_vi: stmtsVi ? JSON.stringify(textToStatements(stmtsVi)) : null,
        notes:         notes   || null,
      });
      setMsg({ ok: true, text: 'Đã lưu draft ✓' });
      if (onSaved) onSaved();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPubbing(true); setMsg(null);
    try {
      const r = await publishPolicyDraft(control.id);
      setVersion(r.version);
      setMsg({ ok: true, text: `✓ Published — version ${r.version}` });
      if (onSaved) onSaved();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setPubbing(false);
    }
  }

  return (
    <div style={S.editWrap}>
      <button style={S.backBtn} onClick={onBack}>← Quay lại danh sách</button>

      <div><span style={S.badge}>{control.control_id}</span></div>
      <h2 style={S.editTitle}>{control.control_name}</h2>
      {control.control_name_vi && <p style={S.editVi}>{control.control_name_vi}</p>}

      {/* Lang tabs */}
      <div style={S.tabRow}>
        {[['en', 'English'], ['vi', 'Tiếng Việt']].map(([l, label]) => (
          <button key={l} style={S.tabBtn(lang === l)} onClick={() => setLang(l)}>{label}</button>
        ))}
      </div>

      {lang === 'en' && (
        <>
          <div style={S.fieldLbl}>Background (EN)</div>
          <textarea
            style={{ ...S.textarea, minHeight: 80 }}
            value={bg}
            onChange={e => setBg(e.target.value)}
            placeholder="Context / rationale for this control..."
          />

          <div style={S.fieldLbl}>Policy Statements (EN)</div>
          <textarea
            style={{ ...S.textarea, minHeight: 140 }}
            value={stmts}
            onChange={e => setStmts(e.target.value)}
            placeholder="One statement per line..."
          />
          <div style={S.hint}>Mỗi dòng = 1 statement. Dòng trắng bị bỏ qua.</div>
        </>
      )}

      {lang === 'vi' && (
        <>
          <div style={S.fieldLbl}>Background (VI)</div>
          <textarea
            style={{ ...S.textarea, minHeight: 80 }}
            value={bgVi}
            onChange={e => setBgVi(e.target.value)}
            placeholder="Bối cảnh / lý do cho control này..."
          />

          <div style={S.fieldLbl}>Policy Statements (VI)</div>
          <textarea
            style={{ ...S.textarea, minHeight: 140 }}
            value={stmtsVi}
            onChange={e => setStmtsVi(e.target.value)}
            placeholder="Mỗi dòng 1 tuyên bố chính sách..."
          />
          <div style={S.hint}>Mỗi dòng = 1 statement. Dòng trắng bị bỏ qua.</div>
        </>
      )}

      <div style={S.fieldLbl}>Notes</div>
      <textarea
        style={{ ...S.textarea, minHeight: 56 }}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Implementation notes, exceptions..."
      />

      <div style={S.actionRow}>
        <button style={S.saveBtn(saving)} onClick={handleSave} disabled={saving || pubbing}>
          {saving ? 'Đang lưu...' : '💾 Lưu draft'}
        </button>
        <button style={S.pubBtn(pubbing)} onClick={handlePublish} disabled={saving || pubbing}>
          {pubbing ? 'Đang publish...' : '🚀 Publish'}
        </button>
        {msg && <span style={S.msg(msg.ok)}>{msg.text}</span>}
      </div>

      <div style={S.meta}>
        {STD_LABEL[control.standard] || control.standard} · Version {version}
        {control.updated_at && ` · Cập nhật ${control.updated_at.split(' ')[0]}`}
      </div>
    </div>
  );
}

// ── Main PolicyTab ─────────────────────────────────────────────────────────

export default function PolicyTab() {
  const [standards,   setStandards]   = useState([]);
  const [selStd,      setSelStd]      = useState('iso27001');
  const [selSection,  setSelSection]  = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState('');
  const [editControl, setEditControl] = useState(null); // full detail object
  const [loadingCtrl, setLoadingCtrl] = useState(false);
  const [error,       setError]       = useState(null);

  // Load standards on mount
  useEffect(() => {
    getPolicyStandards()
      .then(d => {
        const list = d.standards || [];
        setStandards(list);
        const first = list[0];
        if (first?.sections?.length) {
          setSelStd(first.standard);
          setSelSection(first.sections[0].section);
        }
      })
      .catch(e => setError(e.message));
  }, []);

  // Load section controls when selection changes
  useEffect(() => {
    if (!selSection || !selStd) return;
    setLoading(true);
    setSectionData(null);
    setEditControl(null);
    getPolicySection(selStd, selSection)
      .then(setSectionData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selStd, selSection]);

  function selectSection(std, sec) {
    setSelStd(std);
    setSelSection(sec);
    setSearch('');
  }

  async function openControl(ctrl) {
    setLoadingCtrl(true);
    setEditControl(null);
    try {
      const detail = await getPolicyControl(selStd, selSection, ctrl.control_id);
      setEditControl(detail);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingCtrl(false);
    }
  }

  const filtered = (sectionData?.controls || []).filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.control_id.toLowerCase().includes(q) || c.control_name.toLowerCase().includes(q);
  });

  if (error) return <div style={{ padding: 24, color: '#dc2626', fontSize: 13 }}>Lỗi: {error}</div>;

  return (
    <div style={S.wrap}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        {standards.map(std => (
          <div key={std.standard}>
            <div style={S.stdHdr}>{STD_LABEL[std.standard] || std.standard} · {std.total}</div>
            {std.sections.map(sec => (
              <button
                key={sec.section}
                style={S.secBtn(selStd === std.standard && selSection === sec.section)}
                onClick={() => selectSection(std.standard, sec.section)}
              >
                <span>{sec.section}</span>
                <span style={S.cnt}>{sec.count}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={S.main}>
        {editControl ? (
          <EditPanel
            control={editControl}
            onBack={() => setEditControl(null)}
            onSaved={() => {}}
          />
        ) : (
          <>
            {/* Toolbar */}
            <div style={S.toolbar}>
              <input
                style={S.search}
                placeholder="Tìm control ID hoặc tên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {selSection && (
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  {selSection} · {sectionData?.controls?.length ?? 0} controls
                </span>
              )}
            </div>

            {/* Controls list */}
            <div style={S.list}>
              {loading || loadingCtrl ? (
                <div style={S.empty}>Đang tải...</div>
              ) : !selSection ? (
                <div style={S.empty}>Chọn một section từ danh sách bên trái</div>
              ) : filtered.length === 0 ? (
                <div style={S.empty}>Không tìm thấy control nào</div>
              ) : filtered.map(ctrl => (
                <div
                  key={ctrl.id}
                  style={S.ctrlRow(false)}
                  onClick={() => openControl(ctrl)}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={S.ctrlId}>{ctrl.control_id}</div>
                  <div style={{ flex: 1 }}>
                    <div style={S.ctrlName}>{ctrl.control_name}</div>
                    {ctrl.control_name_vi && <div style={S.ctrlVi}>{ctrl.control_name_vi}</div>}
                  </div>
                  <div style={S.chevron}>›</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
