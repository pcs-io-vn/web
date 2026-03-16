import { useState, useEffect } from 'react';

// Import tất cả logic từ compliance-tracker — chỉ thay đổi phần root App
// để nhận tenant từ bên ngoài thay vì tự quản lý
import ComplianceTracker from './ComplianceTracker';

// ─── localStorage helpers ─────────────────────────────────────────────────
const LS = {
  key: (tenant, type) => `pcs_compliance_${tenant}_${type}`,

  get: (tenant, type) => {
    try {
      const raw = localStorage.getItem(LS.key(tenant, type));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set: (tenant, type, data) => {
    try {
      localStorage.setItem(LS.key(tenant, type), JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },

  clear: (tenant) => {
    ['config', 'controls', 'm365'].forEach(type => {
      localStorage.removeItem(LS.key(tenant, type));
    });
  },
};

// ─── ComplianceApp — đọc/ghi data theo tenant ────────────────────────────
export default function ComplianceApp({ tenant }) {
  const [config, setConfig] = useState(() => LS.get(tenant, 'config'));

  // Reset khi đổi tenant (dùng hash navigation)
  useEffect(() => {
    setConfig(LS.get(tenant, 'config'));
  }, [tenant]);

  const handleComplete = (data) => {
    const configWithTenant = { ...data, tenant };
    LS.set(tenant, 'config', configWithTenant);
    setConfig(configWithTenant);
  };

  const handleReset = () => {
    if (window.confirm(`Xoá toàn bộ data của "${tenant}"?`)) {
      LS.clear(tenant);
      setConfig(null);
    }
  };

  return (
    <ComplianceTracker
      tenant={tenant}
      config={config}
      onComplete={handleComplete}
      onReset={handleReset}
      storage={LS}
    />
  );
}
