import { useState, useEffect } from 'react';
import * as API from './api';
import ComplianceTracker from './ComplianceTracker';

// ─── Status mapping helpers ────────────────────────────────────────────────
// Frontend: "done" | "partial" | "notdone" | "na"
// Backend:  "implemented" | "in-progress" | "not-started" | "na"
const toFrontendStatus = s =>
  ({ implemented: 'done', 'in-progress': 'partial', 'not-started': 'notdone', na: 'na' }[s] || 'notdone');

const toBackendStatus = s =>
  ({ done: 'implemented', partial: 'in-progress', notdone: 'not-started', na: 'na' }[s] || 'not-started');

// Derive framework from control_id — ISO 42001 IDs start with "ai."
const deriveFramework = id => id.startsWith('ai.') ? 'iso42001' : 'iso27001';

// ─── API-backed storage adapter (D1 backend via mcp.pcs.io.vn) ───────────
const APIStorage = {
  _cache: {},
  // Stores { [control_id]: { framework, title } } per tenant for upsert calls
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
        // Fix Bug 1: map by control_id string, not UUID
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
    // data shape: { [control_id]: "done" | "partial" | "notdone" | "na" }
    if (type !== 'controls') return;
    try {
      const previous = APIStorage._cache[tenant]?.controls || {};

      // Fix Bug 5: delta sync — only send changed controls
      const changed = Object.entries(data).filter(([id, s]) => previous[id] !== s);
      if (changed.length === 0) return;

      // Update cache before async calls to prevent double-fire
      APIStorage._cache[tenant] = APIStorage._cache[tenant] || {};
      APIStorage._cache[tenant].controls = { ...data };

      const meta = APIStorage._controlMeta[tenant] || {};

      // Fix Bugs 2, 3, 4: correct iteration, status mapping, upsert by control_id
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

// ─── ComplianceApp — đọc/ghi data từ API backend ─────────────────────────
export default function ComplianceApp({ tenant }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const controls = await API.getControls();
        setConfig({
          tenant,
          timestamp: Date.now(),
          controls: controls.length,
        });

        // Cleanup old localStorage keys (migration complete)
        try {
          localStorage.removeItem(`pcs_compliance_${tenant}_controls`);
          localStorage.removeItem(`pcs_compliance_${tenant}_m365`);
          localStorage.removeItem('pcs_controls_standalone');
        } catch (e) {
          console.warn('Failed to clean old localStorage keys:', e);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tenant]);

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', opacity: 0.5, fontFamily: 'monospace' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  const handleComplete = (data) => {
    setConfig({ ...data, tenant, timestamp: Date.now() });
  };

  const handleReset = () => {
    if (window.confirm(`Xoá toàn bộ data của "${tenant}"?`)) {
      APIStorage.clear(tenant);
      setConfig(null);
    }
  };

  return (
    <ComplianceTracker
      tenant={tenant}
      config={config}
      onComplete={handleComplete}
      onReset={handleReset}
      storage={APIStorage}
    />
  );
}
