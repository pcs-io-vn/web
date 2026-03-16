# PCS Vietnam — Project Context
> Cập nhật: March 16, 2026  
> Dùng file này để tiếp tục trên Claude Desktop hoặc session mới

---

## 1. Người dùng & Tổ chức

| Field | Value |
|-------|-------|
| **Tên** | JaxVN |
| **Công ty** | PCS Vietnam |
| **Website** | pcs.io.vn (Docusaurus, GitHub Pages) |
| **Domain AD** | KIENA.LOCAL |
| **RMM** | Action1 (free ≤200 endpoints) |
| **MDM** | Chưa có Intune — workgroup + domain mix |
| **Machine mẫu** | KIENA\STCD00558 — user ngan.hong, OU: KIENA.LOCAL/KIENA/STC |

---

## 2. Repos

| Repo | Mục đích | Deploy |
|------|---------|--------|
| `JaxVN/jaxvn-blog` | pcs.io.vn — Docusaurus blog + tools | GitHub Pages |
| `JaxVN/RDPS` | Script library — PowerShell Set/Remove pairs | GitHub (raw download) |

---

## 3. GPO hiện tại tại KIENA.LOCAL (từ GPReport2026.html)

Máy STCD00558 đang áp dụng các GPO sau:

| GPO | Nội dung |
|-----|---------|
| `Default Domain Policy` | Password min 3 chars, Audit, Offline logon cache 10 |
| `C_LAPS_Config` | LAPS: 30 ngày, 8 ký tự, Large+Small+Numbers+Specials |
| `C_LAPS_Deploy` | Cài LAPS.x64.msi từ `\\kiena.local\NETLOGON\LAPS\` |
| `C_Firewall_GPO` | WinRM TCP 5985, WMI DCOM TCP 135, Remote Task Scheduler |
| `C_Lock Workstation` | Tự khóa sau 600 giây (10 phút) |
| `C_Default Lock Screen` | Wallpaper `KA_desktop_2560x1440.jpg` từ NETLOGON |
| `C_Store BitLocker` | BitLocker recovery lưu vào AD DS |
| `C_Turn Off Autorun` | Tắt AutoPlay/AutoRun toàn bộ ổ đĩa |
| `DesktopBackGround` | Copy wallpaper từ `\\stcvm001\NETLOGON\wallpaper\` |
| `Enable WinRM` | WinRM service Automatic Delayed Start |
| `Disable News and Interests` | Tắt widget News trên taskbar |
| `Fortigate` | ❌ Denied — bị block, không áp dụng |

**Browser policies active (từ policies.json export):**
- `ShowHomeButton` = true
- `HomepageLocation` = https://kienacorp.sharepoint.com/
- `HomepageIsNewTabPage` = false
- `LocalNetworkAccessAllowedForUrls` = [kienacorp.sharepoint.com, kienacorp-my.sharepoint.com]

---

## 4. Kiến trúc hệ thống — 5 Layers

```
Layer 0: SaaS Platform        — app.pcs.io.vn (Phase 3-4, tương lai)
Layer 1: Control Plane        — Policy Engine, Script Generator, Profile Engine
Layer 2: Policy Content       — Browser (✅), Windows Hardening (P2), AppLocker (P3)
Layer 3: Deploy Engine        — Action1 ✅, AD GPO ✅, Intune (P2), PS1 Manual ✅
Layer 4: Endpoint             — Workgroup PC, Domain PC (KIENA.LOCAL), Server
```

**Triết lý:**  
- Kế thừa HotCakeX (Harden System Security + AppControl Manager) cho policy taxonomy & compliance concept  
- Tập trung vào Deploy Engine — thứ HotCakeX không có  
- Web-first — chạy trên browser, không cần Windows 11

---

## 5. Kế thừa từ HotCakeX

| Source | Kế thừa | Cách dùng |
|--------|---------|-----------|
| Harden System Security | Category structure Windows policies | Map → Policy JSON → Set-*.ps1 |
| Harden System Security | Compliance Check + Security Score | Verify-*.ps1 → registry read → score |
| AppControl Manager | AppLocker/WDAC rule taxonomy (Publisher/Path/Hash) | Set-AppLocker-*.ps1 |
| AppControl Manager | Policy XML schema cho WDAC | Parse → UI → Generate |
| Cả 2 | Zero-dependency philosophy | PS1 standalone, không cần install thêm |

**Không reinvent:** taxonomy, compliance check, WDAC schema  
**Tập trung vào:** deployment layer, web UI, script library, multi-tenant SaaS

---

## 6. RDPS Repo Structure (JaxVN/RDPS)

```
RDPS/
├── browser/edge-chrome/
│   ├── ✅ Set-HomeButton-EdgeChrome.ps1
│   ├── ✅ Remove-HomeButton-EdgeChrome.ps1
│   └── ... (1 policy = 1 Set + 1 Remove luôn luôn)
├── windows/              ← P2: kế thừa HotCakeX categories
├── applocker/            ← P3: kế thừa AppControl Manager
├── firewall/             ← P2: style C_Firewall_GPO
├── profiles/
│   ├── standard.json
│   ├── kiosk.json
│   └── developer.json
└── lib/
    └── Common.ps1        ← Write-Log, Ensure-RegistryPath
```

**Naming convention:** `Set-{Feature}-{Browser}.ps1` / `Remove-{Feature}-{Browser}.ps1`

**Script template chuẩn:**
- `#Requires -RunAsAdministrator`
- `.SYNOPSIS`, `.DESCRIPTION`, `.NOTES` (Version, Date, Browsers, Source URL)
- `Write-Log` function (hoặc dot-source từ lib/Common.ps1)
- `Ensure-RegistryPath` function
- `try/catch` với `exit 0` / `exit 1`

---

## 7. Browser Policy Excel

**File:** `browser-policy-list.xlsx`  
**81 policies** Edge + Chrome, 6 sheets:

| Sheet | Nội dung |
|-------|---------|
| 📖 Hướng dẫn | Legend, giải thích cột |
| 🌐 Browser Policies | 81 policies đầy đủ, AutoFilter 18 cột |
| ⚙ KAG Active | 4 policies đang active tại KIENA.LOCAL |
| 📝 RDPS Scripts | Set/Remove script mapping |
| 🔒 Software Restriction | Placeholder 12 nhóm (AppLocker, Defender, UAC...) |
| 📊 Summary | Dashboard thống kê |

**18 cột:** PolicyName, Category, Caption_EN, Caption_VI, Edge_Support, Chrome_Support, Edge_RegPath, Chrome_RegPath, ValueType, DefaultValue, SupportedValues, Scope, KAG_Active, KAG_Value, RDPS_Script, Deploy_Channel, Priority, Notes

---

## 8. Browser Policy Generator Tool

**File:** `browser-policy-generator-v2.jsx`  
**Tính năng:**
- 3-panel layout: Policy list | Config | Script output
- Luôn generate cả Set-*.ps1 VÀ Remove-*.ps1
- View modes: Split (cả hai) | Set only | Remove only
- Per-policy browser selection (Edge / Chrome checkboxes)
- Toggle: "Use lib/Common.ps1" cho RDPS integration
- ~17 policies implemented: HomeButton, Homepage, SmartScreen, PasswordManager, InPrivate, ClearOnExit, JavaScript, Popups, Notifications, DefaultSearch, DownloadDirectory, ExtensionBlock, Proxy, SyncDisabled, Printing...

---

## 9. Compliance Tracker — pcs.io.vn/c

### Mục đích
Platform tự đánh giá tuân thủ cho SMB Vietnam (1–50 người), tương tự ISMS.online nhưng nhẹ hơn, tiếng Việt, tích hợp M365.

### Frameworks
- **ISO 27001:2022** — Annex A, 93 controls, lọc theo quy mô
- **ISO 42001:2023** — 11 controls AI management
- **M365 Adoption Score** — 8 dimensions, map sang ISO controls

### URL Pattern
```
pcs.io.vn/c          → Landing (nhập tên công ty)
pcs.io.vn/c#kiena    → Dashboard tenant "kiena"
pcs.io.vn/c#abc-corp → Dashboard tenant "abc-corp"
```
Hash = tenant slug. Data lưu localStorage với key `pcs_compliance_{tenant}_{type}`.

### Files cần đặt trong jaxvn-blog

```
jaxvn-blog/src/
├── pages/
│   └── c.jsx                              ← Docusaurus page, đọc hash
└── components/
    └── ComplianceApp/
        ├── index.jsx                      ← Wrapper, quản lý localStorage per tenant
        └── ComplianceTracker.jsx          ← Logic chính (từ compliance-tracker.jsx)
```

### c.jsx — logic chính
```jsx
// Đọc tenant từ hash
const hash = window.location.hash.replace('#', '').trim().toLowerCase()
const tenant = /^[a-z0-9-]{1,50}$/.test(hash) ? hash : null

// Nếu không có tenant → Landing (input + button)
// Nếu có tenant → lazy load ComplianceApp với tenant prop
```

### Migrate lên c.pcs.io.vn sau này
Đổi 1 dòng trong c.jsx:
```js
// Từ hash:
const tenant = window.location.hash.replace('#', '')
// Thành subdomain:
const tenant = window.location.hostname.split('.')[0]
```

### Dashboard 5 tab
| Tab | Nội dung |
|-----|---------|
| 📊 Tổng quan | Score rings (ISO 27001, 42001, M365), progress theo nhóm, quick wins |
| 🔐 ISO 27001 | Checklist 93 controls, filter theme + effort, Done/Partial/Chưa/N/A |
| 🤖 ISO 42001 | 11 controls AI, chỉ hiện nếu chọn framework này |
| ☁️ M365 Score | Nhập điểm 8 dimensions, map → ISO controls |
| 🗺 Lộ trình | 3 giai đoạn tự động theo effort |

### ISO 27001 — 4 themes
- **Org (🏛)** — Tổ chức: policy, IAM, supplier, incident
- **Ppl (👥)** — Con người: hiring, training, offboarding
- **Phy (🏢)** — Vật lý: access control, clean desk, thiết bị
- **Tech (⚙️)** — Công nghệ: endpoint, MFA, patch, backup, DLP

### Mapping RDPS ↔ ISO 27001
| ISO Control | RDPS Connection |
|-------------|----------------|
| 8.9 — Configuration Management | Set-*.ps1 scripts = evidence |
| 8.23 — Web Filtering | Browser Policy Generator |
| 8.7 — Anti-malware | Defender policy scripts |
| 8.1 — Endpoint | Intune/Action1 + RDPS |

---

## 10. Deploy Architecture

### Hiện tại (Phase 1)
```
pcs.io.vn        → GitHub Pages (Docusaurus — jaxvn-blog repo)
pcs.io.vn/c      → Same repo, src/pages/c.jsx (Compliance Tracker)
pcs.io.vn/tools/ → Browser Policy Generator, etc.
```
**Chi phí: $0. Deploy: push GitHub → auto build.**

### Phase 2 (khi có ~10 khách)
```
pcs.io.vn/c#tenant  → vẫn giữ
api.pcs.io.vn       → Cloudflare Workers + D1 (thay localStorage)
```
D1 schema: `tenants`, `controls`, `m365_scores`

### Phase 3 (khi có khách trả tiền)
```
*.pcs.io.vn         → Wildcard CNAME → Cloudflare Pages
kiena.pcs.io.vn     → Đọc hostname.split('.')[0] = "kiena"
```
1 DNS record wildcard phục vụ tất cả tenant.

---

## 11. SaaS Vision (tương lai)

| Tier | Giới hạn | Giá |
|------|---------|-----|
| Free | ≤50 endpoints, community templates | $0 |
| Pro | Unlimited, custom profiles, audit log, Intune export | ~$X/tháng |
| Enterprise | On-premise, WDAC, SSO/SAML, compliance reports | Liên hệ |

Mô hình giống Action1: Free tier → SMB Vietnam tự đăng ký → upsell Pro khi scale.

---

## 12. Roadmap

| Phase | Timeline | Nội dung |
|-------|---------|---------|
| **P1** ✅ Đang làm | Tuần 1-2 | 81 policies Excel/JSON, browser-policy-generator-v2, RDPS 10 script pairs, compliance-tracker deploy pcs.io.vn/c |
| **P2** | Tuần 3-6 | Windows Hardening (kế thừa HotCakeX), GPO ADMX export, Intune JSON, Verify-*.ps1 compliance check |
| **P3** | Tuần 7-10 | AppLocker/WDAC (kế thừa AppControl Manager), Node.js backend, PostgreSQL, auth, profile CRUD |
| **P4** | Tuần 11+ | Multi-tenant SaaS, tenant isolation, RBAC, Action1 API webhook, compliance dashboard |

---

## 13. Files đã tạo (outputs)

| File | Mô tả |
|------|-------|
| `browser-policy-list.xlsx` | 81 policies Excel, 6 sheets |
| `browser-policy-generator-v2.jsx` | React tool generate Set+Remove PS1 |
| `compliance-tracker.jsx` | Compliance dashboard standalone |
| `c.jsx` | Docusaurus page — pcs.io.vn/c |
| `ComplianceApp.index.jsx` | Wrapper component (đổi tên → index.jsx) |
| `ComplianceTracker.jsx` | Logic compliance (tenant-aware) |
| `architecture.jsx` | Architecture diagram 5 layers |
| `deploy-guide-c.pcs.io.vn.docx` | Hướng dẫn deploy (dở dang do lỗi syntax) |

---

## 14. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Docusaurus 3, IBM Plex Mono |
| Styling | CSS-in-JS (inline), không dùng Tailwind |
| State | useState + localStorage (Phase 1), Cloudflare KV/D1 (Phase 2) |
| Build | Vite (tools standalone), Docusaurus build (blog+pages) |
| Deploy | GitHub Pages (Phase 1), Cloudflare Pages (Phase 2+) |
| Backend | Cloudflare Workers + D1 (Phase 2), Node.js + PostgreSQL (Phase 3) |
| Scripts | PowerShell 5.1+, `#Requires -RunAsAdministrator` |
| RMM | Action1 (free ≤200), GPO (domain), Intune (Phase 2) |

---

## 15. Quy tắc đặt tên

**PowerShell scripts:**
```
Set-{Feature}-{Browser}.ps1       Set-ShowHomeButton-EdgeChrome.ps1
Remove-{Feature}-{Browser}.ps1    Remove-ShowHomeButton-EdgeChrome.ps1
Verify-{Feature}-{Browser}.ps1    Verify-ShowHomeButton-EdgeChrome.ps1
```

**Tenant slugs:** `[a-z0-9-]{1,50}` — chữ thường, số, gạch ngang  
**localStorage keys:** `pcs_compliance_{tenant}_{config|controls|m365}`  
**API endpoints:** `api.pcs.io.vn/api/tenant/{slug}[/controls|/m365]`

---

## 16. Câu hỏi còn mở / việc cần làm tiếp

- [ ] Push 3 files (c.jsx, ComplianceApp/index.jsx, ComplianceTracker.jsx) vào jaxvn-blog
- [ ] Test local: `npm run start` → `localhost:3000/c`
- [ ] Tạo 10 RDPS script pairs đầu tiên (browser policies KAG đang dùng)
- [ ] Hoàn thiện browser-policy-list.xlsx — bổ sung thêm policy chưa có registry path
- [ ] Quyết định font chữ cho pcs.io.vn (hiện IBM Plex Mono cho tool pages)
- [ ] Thiết kế landing page `pcs.io.vn/c` — hiện chỉ có input box đơn giản
- [ ] Tìm hiểu HotCakeX source code sâu hơn cho Windows Hardening taxonomy (Phase 2)