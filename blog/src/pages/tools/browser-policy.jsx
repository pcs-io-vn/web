import React, { useState, useCallback } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// ═══════════════════════════════════════════════════════════════════════════
// POLICIES DATA
// ═══════════════════════════════════════════════════════════════════════════

const EDGE_BASE = 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge';
const CHROME_BASE = 'HKLM:\\SOFTWARE\\Policies\\Google\\Chrome';

const POLICIES = [
  // ── Giao diện ───────────────────────────────────────────────────────────
  {
    id: 'show-home-button',
    scriptName: 'ShowHomeButton',
    name: 'Show Home Button',
    caption: 'Hiển thị nút Home',
    category: 'Giao diện',
    description: 'Hiển thị hoặc ẩn nút Home trên thanh công cụ trình duyệt.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'ShowHomeButton', type: 'DWord', inputType: 'toggle', label: 'Hiển thị nút Home', on: 1, off: 0, default: 1 },
    ],
  },
  {
    id: 'homepage',
    scriptName: 'Homepage',
    name: 'Homepage',
    caption: 'Trang chủ trình duyệt',
    category: 'Giao diện',
    description: 'Đặt URL trang chủ và kiểm soát trang Tab mới.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'HomepageIsNewTabPage', type: 'DWord', inputType: 'toggle', label: 'Dùng trang Tab mới làm trang chủ', on: 1, off: 0, default: 0 },
      { name: 'HomepageLocation', type: 'String', inputType: 'text', label: 'URL trang chủ', placeholder: 'https://example.com', default: 'https://example.com', dependsOn: { field: 'HomepageIsNewTabPage', value: 0 } },
    ],
  },
  // ── Bảo mật ─────────────────────────────────────────────────────────────
  {
    id: 'smartscreen',
    scriptName: 'SmartScreen',
    name: 'SmartScreen / Safe Browsing',
    caption: 'Lọc nội dung độc hại',
    category: 'Bảo mật',
    description: 'Bật Microsoft SmartScreen (Edge) hoặc Google Safe Browsing (Chrome) để chặn trang web độc hại.',
    edge: { path: EDGE_BASE, fieldMap: { SmartScreen: 'SmartScreenEnabled' } },
    chrome: { path: CHROME_BASE, fieldMap: { SmartScreen: 'SafeBrowsingEnabled' } },
    fields: [
      { name: 'SmartScreen', type: 'DWord', inputType: 'toggle', label: 'Bật SmartScreen / Safe Browsing', on: 1, off: 0, default: 1 },
    ],
  },
  {
    id: 'inprivate',
    scriptName: 'InPrivateMode',
    name: 'InPrivate / Incognito Mode',
    caption: 'Chế độ ẩn danh',
    category: 'Bảo mật',
    description: 'Kiểm soát khả năng sử dụng chế độ duyệt web ẩn danh.',
    edge: { path: EDGE_BASE, fieldMap: { Availability: 'InPrivateModeAvailability' } },
    chrome: { path: CHROME_BASE, fieldMap: { Availability: 'IncognitoModeAvailability' } },
    fields: [
      {
        name: 'Availability', type: 'DWord', inputType: 'select', label: 'Chế độ ẩn danh', default: 1,
        options: [
          { value: 0, label: '0 — Cho phép' },
          { value: 1, label: '1 — Tắt hoàn toàn' },
          { value: 2, label: '2 — Bắt buộc dùng chế độ ẩn danh' },
        ],
      },
    ],
  },
  {
    id: 'extension-block',
    scriptName: 'ExtensionBlock',
    name: 'Extension Install Blocklist',
    caption: 'Chặn cài extension',
    category: 'Bảo mật',
    description: 'Chặn người dùng cài extension/tiện ích. Giá trị "*" chặn tất cả.',
    edge: { path: EDGE_BASE + '\\ExtensionInstallBlocklist' },
    chrome: { path: CHROME_BASE + '\\ExtensionInstallBlocklist' },
    fields: [
      { name: '1', type: 'String', inputType: 'text', label: 'Extension ID hoặc * để chặn tất cả', placeholder: '*', default: '*' },
    ],
    listPolicy: true,
  },
  {
    id: 'sync-disabled',
    scriptName: 'SyncDisabled',
    name: 'Sync Disabled',
    caption: 'Tắt đồng bộ hoá',
    category: 'Bảo mật',
    description: 'Tắt đồng bộ dữ liệu trình duyệt (lịch sử, mật khẩu, bookmark) với tài khoản cloud.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'SyncDisabled', type: 'DWord', inputType: 'toggle', label: 'Tắt đồng bộ hoá', on: 1, off: 0, default: 1 },
    ],
  },
  // ── Quyền riêng tư ──────────────────────────────────────────────────────
  {
    id: 'password-manager',
    scriptName: 'PasswordManager',
    name: 'Password Manager',
    caption: 'Trình quản lý mật khẩu',
    category: 'Quyền riêng tư',
    description: 'Kiểm soát tính năng lưu và tự điền mật khẩu của trình duyệt.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'PasswordManagerEnabled', type: 'DWord', inputType: 'toggle', label: 'Cho phép lưu mật khẩu', on: 1, off: 0, default: 0 },
    ],
  },
  {
    id: 'clear-on-exit',
    scriptName: 'ClearOnExit',
    name: 'Clear Browsing Data On Exit',
    caption: 'Xoá dữ liệu khi thoát',
    category: 'Quyền riêng tư',
    description: 'Tự động xóa lịch sử duyệt web, cookies và dữ liệu trang khi đóng trình duyệt.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'ClearBrowsingDataOnExit', type: 'DWord', inputType: 'toggle', label: 'Xoá dữ liệu khi đóng trình duyệt', on: 1, off: 0, default: 1 },
    ],
  },
  // ── Nội dung ────────────────────────────────────────────────────────────
  {
    id: 'javascript',
    scriptName: 'JavaScript',
    name: 'JavaScript',
    caption: 'Kiểm soát JavaScript',
    category: 'Nội dung',
    description: 'Cho phép hoặc chặn JavaScript trên tất cả trang web.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      {
        name: 'DefaultJavaScriptSetting', type: 'DWord', inputType: 'select', label: 'JavaScript', default: 1,
        options: [
          { value: 1, label: '1 — Cho phép JavaScript' },
          { value: 2, label: '2 — Chặn JavaScript' },
        ],
      },
    ],
  },
  {
    id: 'popups',
    scriptName: 'Popups',
    name: 'Default Popup Setting',
    caption: 'Cửa sổ bật lên (Popup)',
    category: 'Nội dung',
    description: 'Kiểm soát mặc định cho popup và cửa sổ redirect.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      {
        name: 'DefaultPopupsSetting', type: 'DWord', inputType: 'select', label: 'Popup mặc định', default: 2,
        options: [
          { value: 1, label: '1 — Cho phép popup' },
          { value: 2, label: '2 — Chặn popup' },
          { value: 3, label: '3 — Hỏi người dùng' },
        ],
      },
    ],
  },
  {
    id: 'notifications',
    scriptName: 'Notifications',
    name: 'Default Notifications Setting',
    caption: 'Thông báo trình duyệt',
    category: 'Nội dung',
    description: 'Kiểm soát quyền gửi thông báo đẩy từ trang web.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      {
        name: 'DefaultNotificationsSetting', type: 'DWord', inputType: 'select', label: 'Thông báo mặc định', default: 2,
        options: [
          { value: 1, label: '1 — Cho phép thông báo' },
          { value: 2, label: '2 — Chặn thông báo' },
          { value: 3, label: '3 — Hỏi người dùng' },
        ],
      },
    ],
  },
  // ── Tìm kiếm ────────────────────────────────────────────────────────────
  {
    id: 'default-search',
    scriptName: 'DefaultSearch',
    name: 'Default Search Provider',
    caption: 'Công cụ tìm kiếm mặc định',
    category: 'Tìm kiếm',
    description: 'Đặt công cụ tìm kiếm mặc định và khoá người dùng không thay đổi được.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'DefaultSearchProviderEnabled', type: 'DWord', inputType: 'toggle', label: 'Bật policy tìm kiếm mặc định', on: 1, off: 0, default: 1 },
      { name: 'DefaultSearchProviderName', type: 'String', inputType: 'text', label: 'Tên công cụ tìm kiếm', placeholder: 'Google', default: 'Google' },
      { name: 'DefaultSearchProviderSearchURL', type: 'String', inputType: 'text', label: 'URL tìm kiếm', placeholder: 'https://www.google.com/search?q={searchTerms}', default: 'https://www.google.com/search?q={searchTerms}' },
    ],
  },
  // ── Tải xuống ────────────────────────────────────────────────────────────
  {
    id: 'download-dir',
    scriptName: 'DownloadDirectory',
    name: 'Download Directory',
    caption: 'Thư mục tải xuống',
    category: 'Tải xuống',
    description: 'Đặt thư mục mặc định để lưu file tải xuống. Hỗ trợ biến như ${downloads}.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'DownloadDirectory', type: 'String', inputType: 'text', label: 'Đường dẫn thư mục', placeholder: 'C:\\Downloads', default: 'C:\\Downloads' },
    ],
  },
  // ── Mạng ─────────────────────────────────────────────────────────────────
  {
    id: 'proxy',
    scriptName: 'Proxy',
    name: 'Proxy Settings',
    caption: 'Cấu hình Proxy',
    category: 'Mạng',
    description: 'Đặt chế độ proxy cho trình duyệt.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      {
        name: 'ProxyMode', type: 'String', inputType: 'select', label: 'Chế độ Proxy', default: 'direct',
        options: [
          { value: 'direct', label: 'direct — Không dùng proxy' },
          { value: 'auto_detect', label: 'auto_detect — Tự phát hiện proxy' },
          { value: 'pac_script', label: 'pac_script — Dùng PAC script' },
          { value: 'fixed_servers', label: 'fixed_servers — Proxy cố định' },
          { value: 'system', label: 'system — Theo cấu hình Windows' },
        ],
      },
      { name: 'ProxyServer', type: 'String', inputType: 'text', label: 'Địa chỉ proxy server', placeholder: 'proxy.example.com:8080', default: '', dependsOn: { field: 'ProxyMode', value: 'fixed_servers' } },
      { name: 'ProxyPacUrl', type: 'String', inputType: 'text', label: 'URL PAC script', placeholder: 'http://proxy.example.com/proxy.pac', default: '', dependsOn: { field: 'ProxyMode', value: 'pac_script' } },
    ],
  },
  // ── In ấn ─────────────────────────────────────────────────────────────────
  {
    id: 'printing',
    scriptName: 'Printing',
    name: 'Printing Enabled',
    caption: 'In ấn từ trình duyệt',
    category: 'In ấn',
    description: 'Cho phép hoặc chặn chức năng in trang web từ trình duyệt.',
    edge: { path: EDGE_BASE },
    chrome: { path: CHROME_BASE },
    fields: [
      { name: 'PrintingEnabled', type: 'DWord', inputType: 'toggle', label: 'Cho phép in ấn', on: 1, off: 0, default: 1 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCRIPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function getBrowserSuffix(browsers) {
  if (browsers.edge && browsers.chrome) return 'EdgeChrome';
  if (browsers.edge) return 'Edge';
  return 'Chrome';
}

function resolveFieldName(policy, field, browser) {
  const browserCfg = policy[browser];
  if (browserCfg && browserCfg.fieldMap && browserCfg.fieldMap[field.name]) {
    return browserCfg.fieldMap[field.name];
  }
  return field.name;
}

function getBrowserPath(policy, browser) {
  return policy[browser].path;
}

function buildSetLines(policy, browser, fieldValues) {
  const lines = [];
  const bPath = getBrowserPath(policy, browser);
  lines.push(`    $path = "${bPath}"`);
  lines.push(`    Ensure-RegistryPath $path`);

  for (const field of policy.fields) {
    const realName = resolveFieldName(policy, field, browser);
    const val = fieldValues[field.name] !== undefined ? fieldValues[field.name] : field.default;

    if (field.dependsOn) {
      const depVal = fieldValues[field.dependsOn.field] !== undefined
        ? fieldValues[field.dependsOn.field]
        : policy.fields.find(f => f.name === field.dependsOn.field)?.default;
      if (String(depVal) !== String(field.dependsOn.value)) continue;
      if (!val && val !== 0) continue;
    }

    if (field.type === 'DWord') {
      lines.push(`    Set-ItemProperty -Path $path -Name "${realName}" -Value ${val} -Type DWord`);
    } else {
      const escaped = String(val).replace(/\\/g, '\\\\');
      lines.push(`    Set-ItemProperty -Path $path -Name "${realName}" -Value "${escaped}" -Type String`);
    }
    lines.push(`    Write-Log "Set ${browser} ${realName} = ${val}"`);
  }
  return lines.join('\n');
}

function buildRemoveLines(policy, browser) {
  const lines = [];
  const bPath = getBrowserPath(policy, browser);

  if (policy.listPolicy) {
    lines.push(`    if (Test-Path "${bPath}") {`);
    lines.push(`        Remove-Item -Path "${bPath}" -Recurse -Force`);
    lines.push(`        Write-Log "Removed ${browser} ${policy.scriptName} list key"`);
    lines.push(`    }`);
  } else {
    for (const field of policy.fields) {
      const realName = resolveFieldName(policy, field, browser);
      lines.push(`    if (Get-ItemProperty -Path "${bPath}" -Name "${realName}" -ErrorAction SilentlyContinue) {`);
      lines.push(`        Remove-ItemProperty -Path "${bPath}" -Name "${realName}"`);
      lines.push(`        Write-Log "Removed ${browser} ${realName}"`);
      lines.push(`    }`);
    }
  }
  return lines.join('\n');
}

const COMMON_FUNCTIONS = `function Write-Log {
    param([string]$Msg, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$ts][$Level] $Msg"
}

function Ensure-RegistryPath {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -Force | Out-Null
        Write-Log "Created: $Path"
    }
}`;

function generateSetScript(policy, browsers, fieldValues, useCommonLib) {
  const suffix = getBrowserSuffix(browsers);
  const scriptFile = `Set-${policy.scriptName}-${suffix}.ps1`;
  const today = new Date().toISOString().split('T')[0];

  const browserLines = [];
  if (browsers.edge) {
    browserLines.push(`    # ── Edge ──────────────────────────────────────────────────────`);
    browserLines.push(buildSetLines(policy, 'edge', fieldValues));
  }
  if (browsers.chrome) {
    if (browsers.edge) browserLines.push('');
    browserLines.push(`    # ── Chrome ────────────────────────────────────────────────────`);
    browserLines.push(buildSetLines(policy, 'chrome', fieldValues));
  }

  const browserLabel = [browsers.edge && 'Edge', browsers.chrome && 'Chrome'].filter(Boolean).join(', ');

  return `#Requires -RunAsAdministrator
<#
.SYNOPSIS
    ${scriptFile} — ${policy.caption}
.DESCRIPTION
    ${policy.description}
    Browser: ${browserLabel}
    Scope: Machine (HKLM)
.NOTES
    Version: 1.0
    Date: ${today}
    Source: pcs.io.vn/tools/browser-policy
#>

${useCommonLib ? `. "$PSScriptRoot\\..\\..\\lib\\Common.ps1"` : COMMON_FUNCTIONS}

try {
${browserLines.join('\n')}

    Write-Log "${scriptFile} completed."
    exit 0
} catch {
    Write-Log "Error: $_" "ERROR"
    exit 1
}`;
}

function generateRemoveScript(policy, browsers, useCommonLib) {
  const suffix = getBrowserSuffix(browsers);
  const scriptFile = `Remove-${policy.scriptName}-${suffix}.ps1`;
  const today = new Date().toISOString().split('T')[0];

  const browserLines = [];
  if (browsers.edge) {
    browserLines.push(`    # ── Edge ──────────────────────────────────────────────────────`);
    browserLines.push(buildRemoveLines(policy, 'edge'));
  }
  if (browsers.chrome) {
    if (browsers.edge) browserLines.push('');
    browserLines.push(`    # ── Chrome ────────────────────────────────────────────────────`);
    browserLines.push(buildRemoveLines(policy, 'chrome'));
  }

  const browserLabel = [browsers.edge && 'Edge', browsers.chrome && 'Chrome'].filter(Boolean).join(', ');

  return `#Requires -RunAsAdministrator
<#
.SYNOPSIS
    ${scriptFile} — Gỡ policy: ${policy.caption}
.DESCRIPTION
    Xoá registry key để khôi phục về mặc định trình duyệt.
    Browser: ${browserLabel}
    Scope: Machine (HKLM)
.NOTES
    Version: 1.0
    Date: ${today}
    Source: pcs.io.vn/tools/browser-policy
#>

${useCommonLib ? `. "$PSScriptRoot\\..\\..\\lib\\Common.ps1"` : COMMON_FUNCTIONS}

try {
${browserLines.join('\n')}

    Write-Log "${scriptFile} completed."
    exit 0
} catch {
    Write-Log "Error: $_" "ERROR"
    exit 1
}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const S = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 60px)',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 16px',
    borderBottom: '1px solid var(--ifm-toc-border-color)',
    background: 'var(--ifm-navbar-background-color)',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  panels: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  policyList: {
    width: 220,
    flexShrink: 0,
    borderRight: '1px solid var(--ifm-toc-border-color)',
    overflowY: 'auto',
    background: 'var(--ifm-background-surface-color)',
  },
  configPanel: {
    width: 280,
    flexShrink: 0,
    borderRight: '1px solid var(--ifm-toc-border-color)',
    overflowY: 'auto',
    padding: 16,
  },
  outputPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  outputTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--ifm-toc-border-color)',
    flexShrink: 0,
    background: 'var(--ifm-background-surface-color)',
  },
  outputTab: (active) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: active ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
    color: active ? 'var(--ifm-color-primary)' : 'inherit',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
  }),
  scripts: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  scriptBlock: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid var(--ifm-toc-border-color)',
  },
  scriptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    background: 'var(--ifm-background-surface-color)',
    borderBottom: '1px solid var(--ifm-toc-border-color)',
    flexShrink: 0,
  },
  scriptLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ifm-color-secondary-darkest)',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  codeArea: {
    flex: 1,
    overflowY: 'auto',
    padding: 12,
    margin: 0,
    background: 'var(--ifm-pre-background)',
    fontSize: 11,
    lineHeight: 1.6,
    whiteSpace: 'pre',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  categoryHeader: {
    padding: '6px 12px 2px',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--ifm-color-secondary-darkest)',
    marginTop: 8,
  },
  policyItem: (selected) => ({
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: 12,
    background: selected ? 'var(--ifm-color-primary-lightest)' : 'none',
    color: selected ? 'var(--ifm-color-primary-darkest)' : 'inherit',
    borderLeft: selected ? '3px solid var(--ifm-color-primary)' : '3px solid transparent',
    lineHeight: 1.4,
  }),
  policyCaption: { fontSize: 10, opacity: 0.65, display: 'block' },
  label: { display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 },
  input: {
    width: '100%', padding: '6px 8px', fontSize: 12,
    border: '1px solid var(--ifm-toc-border-color)',
    borderRadius: 4, background: 'var(--ifm-background-color)',
    color: 'inherit', fontFamily: "'IBM Plex Mono', monospace",
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '6px 8px', fontSize: 12,
    border: '1px solid var(--ifm-toc-border-color)',
    borderRadius: 4, background: 'var(--ifm-background-color)',
    color: 'inherit', fontFamily: "'IBM Plex Mono', monospace",
    boxSizing: 'border-box',
  },
  fieldGroup: { marginBottom: 14 },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  copyBtn: (copied) => ({
    padding: '3px 10px', fontSize: 11, cursor: 'pointer',
    border: '1px solid var(--ifm-toc-border-color)', borderRadius: 4,
    background: copied ? 'var(--ifm-color-success-light)' : 'var(--ifm-background-color)',
    color: copied ? 'var(--ifm-color-success-darkest)' : 'inherit',
    fontFamily: "'IBM Plex Mono', monospace",
  }),
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, color: 'var(--ifm-color-secondary-darkest)' },
  desc: { fontSize: 11, opacity: 0.75, lineHeight: 1.5, marginBottom: 14 },
  divider: { borderTop: '1px solid var(--ifm-toc-border-color)', margin: '10px 0' },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return <button style={S.copyBtn(copied)} onClick={handle}>{copied ? '✓ Copied' : 'Copy'}</button>;
}

function PolicyList({ selectedId, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = POLICIES.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.caption.includes(search)
  );

  const categories = [...new Set(filtered.map(p => p.category))];

  return (
    <div style={S.policyList}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
        <input
          style={{ ...S.input, fontSize: 11 }}
          placeholder="Tìm policy..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {categories.map(cat => (
        <div key={cat}>
          <div style={S.categoryHeader}>{cat}</div>
          {filtered.filter(p => p.category === cat).map(p => (
            <div key={p.id} style={S.policyItem(p.id === selectedId)} onClick={() => onSelect(p.id)}>
              {p.name}
              <span style={S.policyCaption}>{p.caption}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
        background: checked ? 'var(--ifm-color-primary)' : 'var(--ifm-toc-border-color)',
        position: 'relative', flexShrink: 0, transition: 'background 0.15s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: checked ? 18 : 3, width: 14, height: 14,
        borderRadius: '50%', background: '#fff', transition: 'left 0.15s',
      }} />
    </div>
  );
}

function ConfigPanel({ policy, browsers, onBrowserChange, fieldValues, onFieldChange, useCommonLib, onCommonLibChange }) {
  const noBrowserSelected = !browsers.edge && !browsers.chrome;

  return (
    <div style={S.configPanel}>
      <div style={S.desc}>{policy.description}</div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Trình duyệt</div>
        <label style={{ ...S.checkboxLabel, marginBottom: 8 }}>
          <input type="checkbox" checked={browsers.edge} onChange={e => onBrowserChange('edge', e.target.checked)} />
          Microsoft Edge
        </label>
        <label style={S.checkboxLabel}>
          <input type="checkbox" checked={browsers.chrome} onChange={e => onBrowserChange('chrome', e.target.checked)} />
          Google Chrome
        </label>
        {noBrowserSelected && (
          <div style={{ fontSize: 11, color: 'var(--ifm-color-danger)', marginTop: 6 }}>Chọn ít nhất 1 trình duyệt</div>
        )}
      </div>

      <div style={S.divider} />

      <div style={S.section}>
        <div style={S.sectionTitle}>Giá trị Policy</div>
        {policy.fields.map(field => {
          // Check dependsOn
          if (field.dependsOn) {
            const depVal = fieldValues[field.dependsOn.field] !== undefined
              ? fieldValues[field.dependsOn.field]
              : policy.fields.find(f => f.name === field.dependsOn.field)?.default;
            if (String(depVal) !== String(field.dependsOn.value)) return null;
          }

          const currentVal = fieldValues[field.name] !== undefined ? fieldValues[field.name] : field.default;

          if (field.inputType === 'toggle') {
            return (
              <div key={field.name} style={S.toggleRow}>
                <Toggle checked={!!currentVal} onChange={v => onFieldChange(field.name, v ? (field.on ?? 1) : (field.off ?? 0))} />
                <span style={{ fontSize: 12 }}>{field.label}</span>
              </div>
            );
          }
          if (field.inputType === 'select') {
            return (
              <div key={field.name} style={S.fieldGroup}>
                <label style={S.label}>{field.label}</label>
                <select
                  style={S.select}
                  value={currentVal}
                  onChange={e => onFieldChange(field.name, field.type === 'DWord' ? Number(e.target.value) : e.target.value)}
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            );
          }
          // text
          return (
            <div key={field.name} style={S.fieldGroup}>
              <label style={S.label}>{field.label}</label>
              <input
                style={S.input}
                value={currentVal}
                placeholder={field.placeholder}
                onChange={e => onFieldChange(field.name, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div style={S.divider} />

      <div style={S.section}>
        <div style={S.sectionTitle}>Script Options</div>
        <div style={S.toggleRow}>
          <Toggle checked={useCommonLib} onChange={onCommonLibChange} />
          <span style={{ fontSize: 12 }}>Dùng lib/Common.ps1</span>
        </div>
        <div style={{ fontSize: 10, opacity: 0.6, lineHeight: 1.5 }}>
          Bật để dùng chung hàm từ RDPS lib thay vì inline.
        </div>
      </div>
    </div>
  );
}

function ScriptBlock({ label, filename, script }) {
  return (
    <div style={S.scriptBlock}>
      <div style={S.scriptHeader}>
        <span style={S.scriptLabel}>{filename}</span>
        <CopyButton text={script} />
      </div>
      <pre style={S.codeArea}>{script}</pre>
    </div>
  );
}

function OutputPanel({ policy, browsers, fieldValues, useCommonLib }) {
  const [viewMode, setViewMode] = useState('split');
  const noBrowser = !browsers.edge && !browsers.chrome;

  const suffix = getBrowserSuffix(browsers);
  const setScript = noBrowser ? '# Chọn ít nhất 1 trình duyệt' : generateSetScript(policy, browsers, fieldValues, useCommonLib);
  const removeScript = noBrowser ? '# Chọn ít nhất 1 trình duyệt' : generateRemoveScript(policy, browsers, useCommonLib);
  const setFile = `Set-${policy.scriptName}-${suffix}.ps1`;
  const removeFile = `Remove-${policy.scriptName}-${suffix}.ps1`;

  const tabs = [
    { id: 'split', label: 'Split' },
    { id: 'set', label: 'Set only' },
    { id: 'remove', label: 'Remove only' },
  ];

  return (
    <div style={S.outputPanel}>
      <div style={S.outputTabs}>
        {tabs.map(t => (
          <button key={t.id} style={S.outputTab(viewMode === t.id)} onClick={() => setViewMode(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={S.scripts}>
        {(viewMode === 'split' || viewMode === 'set') && (
          <ScriptBlock label="Set" filename={setFile} script={setScript} />
        )}
        {(viewMode === 'split' || viewMode === 'remove') && (
          <ScriptBlock label="Remove" filename={removeFile} script={removeScript} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

function BrowserPolicyApp() {
  const [selectedId, setSelectedId] = useState(POLICIES[0].id);
  const [browsers, setBrowsers] = useState({ edge: true, chrome: true });
  const [fieldValues, setFieldValues] = useState({});
  const [useCommonLib, setUseCommonLib] = useState(false);

  const policy = POLICIES.find(p => p.id === selectedId);

  const handleSelectPolicy = useCallback((id) => {
    setSelectedId(id);
    setFieldValues({});
  }, []);

  const handleBrowserChange = useCallback((b, val) => {
    setBrowsers(prev => ({ ...prev, [b]: val }));
  }, []);

  const handleFieldChange = useCallback((name, val) => {
    setFieldValues(prev => ({ ...prev, [name]: val }));
  }, []);

  // Init field values from policy defaults when not yet set
  const resolvedValues = {};
  for (const field of policy.fields) {
    resolvedValues[field.name] = fieldValues[field.name] !== undefined ? fieldValues[field.name] : field.default;
  }

  return (
    <div style={S.app}>
      <div style={S.toolbar}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>🌐 Browser Policy Manager</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{POLICIES.length} policies — Edge &amp; Chrome — pcs.io.vn</span>
      </div>
      <div style={S.panels}>
        <PolicyList selectedId={selectedId} onSelect={handleSelectPolicy} />
        <ConfigPanel
          policy={policy}
          browsers={browsers}
          onBrowserChange={handleBrowserChange}
          fieldValues={resolvedValues}
          onFieldChange={handleFieldChange}
          useCommonLib={useCommonLib}
          onCommonLibChange={setUseCommonLib}
        />
        <OutputPanel
          policy={policy}
          browsers={browsers}
          fieldValues={resolvedValues}
          useCommonLib={useCommonLib}
        />
      </div>
    </div>
  );
}

export default function BrowserPolicy() {
  return (
    <Layout
      title="Browser Policy Manager"
      description="Tạo script PowerShell quản lý policy Edge và Chrome — Set và Remove — chuẩn RDPS">
      <BrowserOnly>
        {() => <BrowserPolicyApp />}
      </BrowserOnly>
    </Layout>
  );
}
