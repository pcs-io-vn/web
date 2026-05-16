import React, { useState, useEffect, useCallback } from 'react';
import { fetchStandards, fetchSection, applyTemplates } from './api';
import ControlDetail from './ControlDetail';

const STANDARD_LABELS = { iso27001: 'ISO 27001:2013', iso42001: 'ISO 42001:2024' };

const S = {
  container: { display: 'flex', minHeight: '70vh', fontFamily: 'system-ui, sans-serif' },
  // Sidebar
  sidebar: { width: 260, minWidth: 220, borderRight: '1px solid #eee', overflowY: 'auto', flexShrink: 0, padding: '16px 0' },
  stdGroup: { marginBottom: 8 },
  stdHeader: { padding: '6px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999' },
  sectionBtn: (active) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    padding: '7px 16px', fontSize: 13,
    background: active ? '#e8f0fe' : 'transparent',
    color: active ? '#1a73e8' : '#333',
    fontWeight: active ? 600 : 400,
  }),
  sectionCount: { fontSize: 11, color: '#999', background: '#f1f3f4', borderRadius: 10, padding: '1px 7px' },
  // Main panel
  main: { flex: 1, overflowY: 'auto' },
  // Section header
  sectionHeader: { padding: '20px 24px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 4px' },
  sectionSubtitle: { fontSize: 13, color: '#666', margin: '0 0 12px' },
  applyBar: { display: 'flex', gap: 8, alignItems: 'center', padding: '12px 24px', background: '#f8f9fa', borderBottom: '1px solid #eee' },
  applyBtn: (loading) => ({
    background: loading ? '#ccc' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
  }),
  applyMsg: (ok) => ({ fontSize: 13, color: ok ? '#2e7d32' : '#d32f2f' }),
  // Controls list
  controlList: { padding: '8px 0' },
  controlRow: (active) => ({
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '12px 24px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
    background: active ? '#f0f4ff' : '#fff',
    transition: 'background 0.1s',
  }),
  controlId: { fontSize: 12, fontWeight: 700, color: '#1a73e8', minWidth: 64, paddingTop: 1 },
  controlName: { fontSize: 14, color: '#333', lineHeight: 1.4 },
  controlNameVi: { fontSize: 12, color: '#888', marginTop: 2 },
  // Empty / loading states
  center: { textAlign: 'center', padding: 60, color: '#999', fontSize: 14 },
};

export default function PolicyLibrary() {
  const [standards, setStandards] = useState([]);
  const [selectedStd, setSelectedStd] = useState('iso27001');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null); // { standard, section, controlId }
  const [loadingSection, setLoadingSection] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);
  const [error, setError] = useState(null);

  // Load standards on mount + handle hash navigation
  useEffect(() => {
    fetchStandards()
      .then(d => {
        setStandards(d.standards || []);
        // Auto-select first section from hash or default
        const hash = window.location.hash.replace('#', '');
        const firstStd = d.standards?.[0];
        if (firstStd?.sections?.length) {
          const matchSection = firstStd.sections.find(s => s.section === hash);
          const target = matchSection || firstStd.sections[0];
          setSelectedStd(firstStd.standard);
          setSelectedSection(target.section);
        }
      })
      .catch(e => setError(e.message));
  }, []);

  // Load section controls when section changes
  useEffect(() => {
    if (!selectedSection || !selectedStd) return;
    setLoadingSection(true);
    setSectionData(null);
    setSelectedControl(null);
    // Update hash
    window.location.hash = selectedSection;
    fetchSection(selectedStd, selectedSection)
      .then(setSectionData)
      .catch(e => setError(e.message))
      .finally(() => setLoadingSection(false));
  }, [selectedStd, selectedSection]);

  function selectSection(std, section) {
    setSelectedStd(std);
    setSelectedSection(section);
    setApplyResult(null);
  }

  async function handleApply() {
    setApplying(true);
    setApplyResult(null);
    try {
      const r = await applyTemplates(selectedStd);
      setApplyResult({ ok: true, msg: `✅ Tạo ${r.created} controls (${r.skipped} đã có)` });
    } catch (e) {
      setApplyResult({ ok: false, msg: `❌ Lỗi: ${e.message}` });
    } finally {
      setApplying(false);
    }
  }

  // Control detail view
  if (selectedControl) {
    return (
      <div style={S.container}>
        <Sidebar standards={standards} selectedStd={selectedStd} selectedSection={selectedSection} onSelect={selectSection} />
        <div style={S.main}>
          <ControlDetail
            standard={selectedControl.standard}
            section={selectedControl.section}
            controlId={selectedControl.controlId}
            onBack={() => setSelectedControl(null)}
          />
        </div>
      </div>
    );
  }

  const currentStdSections = standards.find(s => s.standard === selectedStd);

  return (
    <div style={S.container}>
      <Sidebar standards={standards} selectedStd={selectedStd} selectedSection={selectedSection} onSelect={selectSection} />

      <div style={S.main}>
        {error && <div style={{ ...S.center, color: '#d32f2f' }}>Lỗi: {error}. Vui lòng đăng nhập lại.</div>}

        {!error && !selectedSection && (
          <div style={S.center}>Chọn một section từ danh sách bên trái</div>
        )}

        {selectedSection && (
          <>
            {/* Section header */}
            <div style={S.sectionHeader}>
              <h2 style={S.sectionTitle}>
                {selectedSection} — {sectionData?.title || ''}
              </h2>
              <p style={S.sectionSubtitle}>
                {STANDARD_LABELS[selectedStd]} · {sectionData?.controls?.length || 0} controls
              </p>
            </div>

            {/* Apply bar */}
            <div style={S.applyBar}>
              <button style={S.applyBtn(applying)} onClick={handleApply} disabled={applying}>
                {applying ? 'Đang tạo...' : `↑ Apply ${STANDARD_LABELS[selectedStd]} vào tenant`}
              </button>
              {applyResult && (
                <span style={S.applyMsg(applyResult.ok)}>{applyResult.msg}</span>
              )}
            </div>

            {/* Controls list */}
            {loadingSection ? (
              <div style={S.center}>Đang tải...</div>
            ) : (
              <div style={S.controlList}>
                {(sectionData?.controls || []).map(ctrl => (
                  <div
                    key={ctrl.id}
                    style={S.controlRow(false)}
                    onClick={() => setSelectedControl({ standard: selectedStd, section: selectedSection, controlId: ctrl.control_id })}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={S.controlId}>{ctrl.control_id}</div>
                    <div>
                      <div style={S.controlName}>{ctrl.control_name}</div>
                      {ctrl.control_name_vi && <div style={S.controlNameVi}>{ctrl.control_name_vi}</div>}
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#ccc', fontSize: 18, paddingTop: 2 }}>›</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Sidebar({ standards, selectedStd, selectedSection, onSelect }) {
  return (
    <div style={S.sidebar}>
      {standards.map(std => (
        <div key={std.standard} style={S.stdGroup}>
          <div style={S.stdHeader}>
            {STANDARD_LABELS[std.standard] || std.standard} · {std.total}
          </div>
          {std.sections.map(sec => (
            <button
              key={sec.section}
              style={S.sectionBtn(selectedStd === std.standard && selectedSection === sec.section)}
              onClick={() => onSelect(std.standard, sec.section)}
            >
              <span>{sec.section}</span>
              <span style={S.sectionCount}>{sec.count}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
