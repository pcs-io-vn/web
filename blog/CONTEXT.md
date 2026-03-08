# PCS Vietnam – Project Devlog

> File này dùng để đồng bộ context dự án giữa các AI agents và thiết bị.  
> Cập nhật mỗi khi có thay đổi quan trọng.

---

## 📌 Tổng quan dự án

| Thông tin | Chi tiết |
|---|---|
| **Tên** | PCS Vietnam (Personal Computing Shield) |
| **Chủ sở hữu** | JaxVN – cá nhân độc lập |
| **Website chính (cũ)** | https://www.pcs.io.vn (Google Sites) |
| **Website mới** | https://blog.pcs.io.vn (Docusaurus + Cloudflare Pages) |
| **Repo** | https://github.com/JaxVN/jaxvn-blog |
| **Email** | info@pcs.io.vn |
| **WhatsApp** | https://wa.me/84977733339 |
| **Linktree** | https://linktr.ee/jaxvn |
| **Đặt lịch** | https://calendar.app.google/r8cNH7giyokjRHP26 |
| **PayPal** | https://paypal.me/jaxhong |

---

## 🏗️ Kiến trúc kỹ thuật

| Thành phần | Chi tiết |
|---|---|
| **Framework** | Docusaurus 3.7.0 |
| **Ngôn ngữ mặc định** | Tiếng Việt (`vi`) |
| **Ngôn ngữ phụ** | Tiếng Anh (`en`) |
| **Deploy** | Cloudflare Pages (tự động khi push lên `main`) |
| **Build command** | `npm install && npm run build` |
| **Root directory** | `blog` |
| **Build output** | `build` |
| **DNS** | Cloudflare – CNAME `blog` → `jaxvn-blog.pages.dev` |
| **Package manager** | npm (không dùng yarn) |

---

## 🗺️ Sitemap

```
blog.pcs.io.vn/
├── /                           Trang chủ
├── /products                   Các gói đăng ký
├── /services                   Tổng quan dịch vụ
│   ├── /services/remote-it-support   Hỗ trợ từ xa
│   ├── /services/hardware-repair     Sửa phần cứng
│   └── /services/for-business        Cho doanh nghiệp (coming soon)
├── /guides                     Hướng dẫn cài UltraViewer
├── /resources                  Download agent Windows/macOS
├── /contact                    Liên hệ
├── /payments                   Thanh toán
└── /tos                        Điều khoản dịch vụ

Bản EN tương ứng tại /en/[trang]
```

---

## 📁 Cấu trúc repo

```
jaxvn-blog/
└── blog/
    ├── src/
    │   └── pages/              ← Nội dung tiếng Việt (mặc định)
    │       ├── index.md
    │       ├── products.md
    │       ├── guides.md
    │       ├── resources.md
    │       ├── contact.md
    │       ├── payments.md
    │       ├── tos.md
    │       └── services/
    │           ├── index.md
    │           ├── remote-it-support.md
    │           ├── hardware-repair.md
    │           └── for-business.md
    ├── i18n/
    │   └── en/
    │       ├── docusaurus-plugin-content-pages/  ← Bản dịch EN
    │       │   ├── index.md
    │       │   ├── products.md
    │       │   ├── guides.md
    │       │   ├── resources.md
    │       │   ├── contact.md
    │       │   ├── payments.md
    │       │   ├── tos.md
    │       │   └── services/
    │       │       ├── index.md
    │       │       ├── remote-it-support.md
    │       │       ├── hardware-repair.md
    │       │       └── for-business.md
    │       └── docusaurus-theme-classic/
    │           ├── navbar.json                   ← Label menu EN
    │           └── footer.json                   ← Label footer EN
    ├── docusaurus.config.js
    ├── package.json
    └── CONTEXT.md              ← File này
```

---

## 💼 Sản phẩm & Dịch vụ

### Gói đăng ký cá nhân

| Gói | Giá | Nổi bật |
|---|---|---|
| Trải nghiệm | 365.000 ₫/năm | Auto update + email support |
| An tâm | 999.000 ₫/năm | 5h remote support/năm |
| Chăm sóc toàn diện | 1.999.000 ₫/năm | 10h + ưu tiên 1-2h |

### Dịch vụ

- **Remote IT Support**: Hỗ trợ từ xa trước, nếu không giải quyết được → pickup thiết bị → sửa → trả qua Grab (khu vực HCM)
- **Hardware Repair**: Pickup tận nơi → chẩn đoán → báo giá → sửa → trả qua Grab (HCM)
- **For Business**: Coming soon

### Bảng giá remote support

| Thời gian | Tổng |
|---|---|
| Dưới 60 phút | 275.000 ₫ |
| 90 phút | 425.000 ₫ |
| Mỗi giờ thêm | +150.000 ₫ |
| Hỗ trợ tại chỗ | +150.000–250.000 ₫/buổi |

---

## 💳 Thanh toán

| Kênh | Chi tiết |
|---|---|
| **ACB** | STK: 20699307 – HỒNG BẢO NGÂN – ACB PGD Tân Uyên – Swift: ASCBVNVX |
| **PayPal** | https://paypal.me/jaxhong |

---

## 📋 Điều khoản quan trọng (tóm tắt)

- Chu kỳ 12 tháng, không tự động gia hạn
- Hoàn tiền 100% trong 7 ngày nếu chưa dùng
- Sau 7 ngày: không hoàn, trừ lỗi từ PCS
- Thông báo thay đổi điều khoản trước 14 ngày
- Link ToS đầy đủ: `https://blog.pcs.io.vn/tos`

---

## 🕐 Thời gian hỗ trợ

- Thứ 2–6: Sau 19:00
- Thứ 7–CN: Cả ngày
- Lý do: Chủ sở hữu có công việc chính từ T2–T6

---

## 📡 Kênh liên lạc

| Kênh | Link |
|---|---|
| WhatsApp | https://wa.me/84977733339 |
| Email | info@pcs.io.vn |
| Linktree | https://linktr.ee/jaxvn |
| Đặt lịch | https://calendar.app.google/r8cNH7giyokjRHP26 |

> ⚠️ Zalo đã ngừng sử dụng — chuyển hoàn toàn sang WhatsApp

---

## 🔧 Công cụ hỗ trợ từ xa

| Tool | Mục đích |
|---|---|
| **UltraViewer** | Remote support tức thời (không cần cài đặt sẵn) |
| **Action1 Agent** | Patch management tự động (cài sẵn cho khách hàng có gói) |

### Link download Action1 Agent

- **Windows**: `https://app.action1.com/agent/a3ec8694-8920-11ee-8f6e-53e2d9b96c81/Windows/agent(PCS).msi`
- **macOS**: `https://app.action1.com/agent/a3ec8694-8920-11ee-8f6e-53e2d9b96c81/Mac/agent(PCS).pkg`

---

## 📅 Lịch sử phát triển

### 2026-03-08
- ✅ Soạn bộ ToS + Refund Policy + Privacy Policy song ngữ VI/EN
- ✅ Xác nhận cá nhân độc lập hợp lệ bán subscription trên PayPal
- ✅ Migrate website từ Google Sites sang Docusaurus
- ✅ Setup i18n VI/EN với locale dropdown
- ✅ Soạn toàn bộ nội dung 11 trang (VI + EN)
- ✅ Fix build errors: package.json, yarn.lock → npm
- ✅ Deploy thành công lên Cloudflare Pages
- ✅ Navbar dropdown Services hoạt động
- ✅ Chuyển ngôn ngữ VI/EN hoạt động
- ✅ Footer cập nhật: bỏ Zalo, thêm WhatsApp + Linktree
- ✅ Tạo CONTEXT.md

---

## 📝 Việc còn lại

| Việc | Độ ưu tiên |
|---|---|
| Setup PayPal subscription button/link | 🔴 Cao |
| Thêm favicon + logo PCS (thay logo Docusaurus mặc định) | 🟡 Trung bình |
| Dọn dẹp thư mục `i18n/vi/` cũ không cần thiết | 🟢 Thấp |
| Trang For Business (nội dung coming soon → hoàn thiện) | 🟢 Thấp |
| Xem xét chuyển `pcs.io.vn` chính về Docusaurus | 🟢 Thấp |

---

## 🤖 Hướng dẫn cho AI Agent

Khi làm việc với dự án này:

1. **Ngôn ngữ mặc định là Tiếng Việt** — file VI để trong `src/pages/`, file EN để trong `i18n/en/docusaurus-plugin-content-pages/`
2. **Không dùng Zalo** — dùng WhatsApp `https://wa.me/84977733339`
3. **Pickup/hoàn trả chỉ áp dụng khu vực HCM** qua Grab
4. **Build bằng npm**, không phải yarn
5. **Commit nhỏ, rõ ràng** — mỗi commit một việc cụ thể
6. **Cloudflare tự build** khi push lên branch `main` — không cần build local

---

*Cập nhật lần cuối: 2026-03-08 bởi Claude (Anthropic) + JaxVN*
