import { useState, useEffect } from 'react';
import * as API from './api';
import ComplianceTracker from './ComplianceTracker';

// ─── API-backed storage adapter (D1 backend via pcs-api) ──────────────────
const APIStorage = {
  // In-memory cache để tránh lấy data từ API quá nhiều lần
  _cache: {},

  key: (tenant, type) => {
    // Keep for compatibility, but not used with API
    return `pcs_compliance_${tenant}_${type}`;
  },

  get: async (tenant, type) => {
    if (type === 'controls') {
      try {
        if (!APIStorage._cache[tenant]) {
          APIStorage._cache[tenant] = {};
        }
        if (APIStorage._cache[tenant].controls) {
          return APIStorage._cache[tenant].controls;
        }

        const controls = await API.getControls();
        const controlsMap = {};
        controls.forEach(ctrl => {
          controlsMap[ctrl.id] = {
            status: ctrl.status,
            id: ctrl.id,
            control_id: ctrl.control_id,
            framework: ctrl.framework,
          };
        });
        APIStorage._cache[tenant].controls = controlsMap;
        return controlsMap;
      } catch (err) {
        console.error('API get controls failed:', err);
        return {};
      }
    }
    return null;
  },

  set: async (tenant, type, data) => {
    if (type === 'controls') {
      try {
        // Sync individual control updates to API
        for (const [id, ctrl] of Object.entries(data)) {
          if (ctrl.status) {
            await API.updateControlStatus(id, ctrl.status);
          }
        }
        // Update cache
        APIStorage._cache[tenant] = APIStorage._cache[tenant] || {};
        APIStorage._cache[tenant].controls = data;
      } catch (err) {
        console.error('API set controls failed:', err);
      }
    }
  },

  clear: async (tenant) => {
    // On API backend, we don't actually delete, just clear local cache
    if (APIStorage._cache[tenant]) {
      APIStorage._cache[tenant] = {};
    }
  },
};

// ─── ComplianceApp — đọc/ghi data từ API backend ────────────────────────
export default function ComplianceApp({ tenant }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load controls from API on mount + cleanup old localStorage keys
  useEffect(() => {
    (async () => {
      try {
        const controls = await API.getControls();
        const configData = {
          tenant,
          timestamp: Date.now(),
          controls: controls.length,
        };
        setConfig(configData);

        // Cleanup old localStorage keys (migration complete)
        // Keep: pcs_token, pcs_compliance_{tenant}_config (if used elsewhere)
        // Delete: pcs_compliance_{tenant}_controls, pcs_compliance_{tenant}_m365
        try {
          localStorage.removeItem(`pcs_compliance_${tenant}_controls`);
          localStorage.removeItem(`pcs_compliance_${tenant}_m365`);
          localStorage.removeItem('pcs_controls_standalone');
        } catch (e) {
          console.warn('Failed to clean old localStorage keys:', e);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
        // Allow to continue, ComplianceTracker handles missing data
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
    // Config saved locally only
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
