// Compliance API client — wrapper for pcs-api.pcs.io.vn compliance endpoints
// Handles auth + fetch, replaces localStorage

const API_BASE = 'https://mcp.pcs.io.vn/compliance';

/**
 * Get authorization header with JWT or API key
 */
function getAuthHeader() {
  const token = localStorage.getItem('pcs_token');
  if (!token) {
    throw new Error('No auth token. Please login.');
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET /compliance/controls — fetch all controls for tenant
 * @param {string} framework - optional filter (iso27001, iso42001, etc.)
 * @returns {Promise<Array>}
 */
export async function getControls(framework = null) {
  const url = new URL(`${API_BASE}/controls`);
  if (framework) {
    url.searchParams.set('framework', framework);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`GET controls failed: ${response.status}`);
  }

  const data = await response.json();
  return data.controls || [];
}

/**
 * POST /compliance/controls/{id} — toggle control status
 * @param {string} id - control ID
 * @param {string} status - new status (not-started, in-progress, implemented)
 * @returns {Promise<Object>}
 */
export async function updateControlStatus(id, status) {
  const response = await fetch(`${API_BASE}/controls/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`POST control ${id} failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * GET /compliance/m365 — fetch M365 score history
 * @returns {Promise<Array>}
 */
export async function getM365Scores() {
  const response = await fetch(`${API_BASE}/m365`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`GET m365 failed: ${response.status}`);
  }

  const data = await response.json();
  return data.scores || [];
}

/**
 * POST /compliance/m365 — add M365 score
 * @param {number} score - Secure Score value
 * @param {string} date - date (YYYY-MM-DD)
 * @param {number} maxScore - max score (default 100)
 * @returns {Promise<Object>}
 */
export async function addM365Score(score, date, maxScore = 100) {
  const response = await fetch(`${API_BASE}/m365`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ score, date, max_score: maxScore }),
  });

  if (!response.ok) {
    throw new Error(`POST m365 failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * POST /compliance/controls/upsert — upsert control status by control_id string
 * Works for new tenants with no D1 rows. Uses ON CONFLICT DO UPDATE.
 * @param {string} control_id - control identifier like "5.1" or "ai.5.2"
 * @param {string} status - backend status: 'not-started'|'in-progress'|'implemented'|'na'
 * @param {string} framework - 'iso27001' or 'iso42001'
 * @param {string} [title] - optional title
 * @returns {Promise<Object>}
 */
export async function upsertControl(control_id, status, framework, title = '') {
  const response = await fetch(`${API_BASE}/controls/upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ control_id, status, framework, title }),
  });

  if (!response.ok) {
    throw new Error(`POST upsert ${control_id} failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * GET /compliance/config — fetch tenant config (company name, size, frameworks)
 * @returns {Promise<Object|null>}
 */
export async function getConfig() {
  try {
    const response = await fetch(`${API_BASE}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.config || null;
  } catch (e) {
    console.error('getConfig failed:', e);
    return null;
  }
}

/**
 * POST /compliance/config — save tenant config
 * @param {string} companyName - company name
 * @param {string} size - company size (small, medium, large)
 * @param {Array<string>} frameworks - selected frameworks (iso27001, iso42001)
 * @returns {Promise<boolean>}
 */
export async function saveConfig(companyName, size, frameworks) {
  try {
    const response = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ company_name: companyName, size, frameworks }),
    });

    return response.ok;
  } catch (e) {
    console.error('saveConfig failed:', e);
    return false;
  }
}

/**
 * GET /compliance/controls/:control_id/evidence — list evidence for a control
 */
export async function getEvidence(control_id) {
  const response = await fetch(`${API_BASE}/controls/${encodeURIComponent(control_id)}/evidence`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!response.ok) throw new Error(`GET evidence failed: ${response.status}`);
  const data = await response.json();
  return data.evidence || [];
}

/**
 * POST /compliance/evidence — upload evidence file
 * @param {string} control_id
 * @param {File} file
 * @param {string} framework
 * @param {string} notes
 */
export async function uploadEvidence(control_id, file, framework = 'iso27001', notes = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('control_id', control_id);
  formData.append('framework', framework);
  formData.append('notes', notes);

  const response = await fetch(`${API_BASE}/evidence`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Upload failed: ${response.status}`);
  }
  return await response.json();
}

/**
 * DELETE /compliance/evidence/:id — delete evidence
 */
export async function deleteEvidence(id) {
  const response = await fetch(`${API_BASE}/evidence/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error(`DELETE evidence failed: ${response.status}`);
  return await response.json();
}

/**
 * GET /compliance/evidence/:id/download — fetch and trigger browser download
 */
export async function downloadEvidence(id, fileName) {
  const response = await fetch(`${API_BASE}/evidence/${id}/download`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
