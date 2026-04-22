import { useState, useEffect } from 'react';
import * as API from './api';
import ComplianceTracker from './ComplianceTracker';

// ─── Status mapping helpers (API ↔ frontend) ──────────────────────────────
const toFrontendStatus = s =>
  ({ implemented: 'done', 'in-progress': 'partial', 'not-started': 'notdone', na: 'na' }[s] || 'notdone');

const toBackendStatus = s =>
  ({ done: 'implemented', partial: 'in-progress', notdone: 'not-started', na: 'na' }[s] || 'not-started');

const deriveFramework = id => id.startsWith('ai.') ? 'iso42001' : 'iso27001';

// ─── Local storage adapter — không cần auth, data trên máy ───────────────
const LocalStorage = {
  get: async (tenant, type) => {
    try {
      return JSON.parse(localStorage.getItem(`pcs_compliance_${tenant}_${type}`) || '{}');
    } catch { return {}; }
  },
  set: async (tenant, type, data) => {
    try {
      localStorage.setItem(`pcs_compliance_${tenant}_${type}`, JSON.stringify(data));
    } catch {}
  },
  clear: async (tenant) => {
    localStorage.removeItem(`pcs_compliance_${tenant}_controls`);
    localStorage.removeItem(`pcs_compliance_${tenant}_m365`);
    localStorage.removeItem(`pcs_compliance_${tenant}_config`);
  },
};

// ─── API-backed storage adapter (D1 via mcp.pcs.io.vn) ───────────────────
const APIStorage = {
  _cache: {},
  _controlMeta: {},

  key: (tenant, type) => `pcs_compliance_${tenant}_${type}`,

  get: async (tenant, type) => {
    if (type !== 'controls') return null;
    try {
      if (!APIStorage._cache[tenant]) APIStorage._cache[tenant] = {};
      if (APIStorage._cache[tenant].controls) return APIStorage._cache[tenant].controls;

      const controls = await API.getControls();
      const controlsMap = {};
      const metaMap = {};

      controls.forEach(ctrl => {
        controlsMap[ctrl.control_id] = toFrontendStatus(ctrl.status);
        metaMap[ctrl.control_id] = { framework: ctrl.framework, title: ctrl.title || '' };
      });

      APIStorage._cache[tenant].controls = controlsMap;
      APIStorage._controlMeta[tenant] = metaMap;
      return controlsMap;
    } catch (err) {
      console.error('API get controls failed:', err);
      return {};
    }
  },

  set: async (tenant, type, data) => {
    if (type !== 'controls') return;
    try {
      const previous = APIStorage._cache[tenant]?.controls || {};
      const changed = Object.entries(data).filter(([id, s]) => previous[id] !== s);
      if (changed.length === 0) return;

      APIStorage._cache[tenant] = APIStorage._cache[tenant] || {};
      APIStorage._cache[tenant].controls = { ...data };

      const meta = APIStorage._controlMeta[tenant] || {};
      for (const [control_id, frontendStatus] of changed) {
        await API.upsertControl(
          control_id,
          toBackendStatus(frontendStatus),
          meta[control_id]?.framework || deriveFramework(control_id),
          meta[control_id]?.title || ''
        );
      }
    } catch (err) {
      console.error('API set controls failed:', err);
    }
  },

  clear: async (tenant) => {
    if (APIStorage._cache[tenant]) APIStorage._cache[tenant] = {};
    if (APIStorage._controlMeta[tenant]) APIStorage._controlMeta[tenant] = {};
  },
};

// ─── ComplianceApp — chọn storage dựa trên mode ──────────────────────────
export default function ComplianceApp({ tenant, mode, onLogout, logoutLabel }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const storage = mode === 'cloud' ? APIStorage : LocalStorage;
  const isCloud = mode === 'cloud';

  useEffect(() => {
    (async () => {
      try {
        // Config (companyName, size, frameworks)
        // Cloud mode: fetch từ D1 API
        // Local mode: lưu local (browser settings)
        let saved = null;

        if (isCloud) {
          // Cloud mode: fetch from API
          try {
            saved = await API.getConfig();
          } catch (err) {
            console.error('Failed to load config from API:', err);
            saved = null;
          }
        } else {
          // Local mode: read from localStorage
          try {
            saved = JSON.parse(localStorage.getItem(`pcs_compliance_${tenant}_config`) || 'null');
          } catch {
            saved = null;
          }
        }

        // Validate required fields
        const valid = saved?.frameworks?.length && saved?.size ? saved : null;
        setConfig(valid);

        if (isCloud) {
          // Cleanup old localStorage keys (chỉ controls/m365)
          try {
            localStorage.removeItem(`pcs_compliance_${tenant}_controls`);
            localStorage.removeItem(`pcs_compliance_${tenant}_m365`);
            localStorage.removeItem('pcs_controls_standalone');
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load config:', err);
        // Fall through — ComplianceTracker handles missing data
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tenant, mode]);

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  const handleComplete = async (data) => {
    const newConfig = { ...data, tenant, timestamp: Date.now() };
    setConfig(newConfig);

    // Save config to appropriate storage
    if (isCloud) {
      // Cloud mode: save to API (D1)
      try {
        await API.saveConfig(data.companyName, data.size, data.frameworks);
      } catch (err) {
        console.error('Failed to save config to API:', err);
      }
    } else {
      // Local mode: save to localStorage
      try {
        localStorage.setItem(`pcs_compliance_${tenant}_config`, JSON.stringify(newConfig));
      } catch {}
    }
  };

  const handleReset = () => {
    if (window.confirm(`Xoá toàn bộ data của "${tenant}"?`)) {
      storage.clear(tenant);
      setConfig(null);
    }
  };

  return (
    <ComplianceTracker
      tenant={tenant}
      config={config}
      onComplete={handleComplete}
      onReset={handleReset}
      onLogout={onLogout}
      logoutLabel={logoutLabel}
      storage={storage}
    />
  );
}
