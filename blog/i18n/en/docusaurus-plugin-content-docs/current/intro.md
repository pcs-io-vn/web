---
id: intro
title: Tutorial Intro!
description: Giới thiệu Hướng dẫn.
---
## Getting Started

**Hãy khám phá Docusaurus** với **[docusaurus.io](https://docusaurus.io)**.
**Thử Docusaurus ngay lập tức** với **[docusaurus.new](https://docusaurus.new)**.

Hãy khám phá **Docusaurus chỉ trong chưa đầy 5 phút**.
Có lẽ họ quên nói một vài thứ chẳng hạn như cần một số kiến thức cơ bản về lập trình chẳng hạn???
Hoặc... bạn có thể mất hơn 5 ngày để mò mẫm từng chút một như mình ngày xưa! 😅
Và giờ đây, mình viết lại bài hướng dẫn này dựa trên kinh nghiệm thực tế, hy vọng sẽ giúp được cho những ai đi sau – từ setup Codespace đến deploy Cloudflare, đơn giản và tránh lỗi phổ biến. Theo dõi nhé!

## Giới thiệu Hướng dẫn.

Chào bạn mới! Nếu bạn đang làm quen với GitHub như mình, đây là hướng dẫn **step-by-step đơn giản** để tạo repo, setup Codespace, và chạy trang blog preview chỉ trong 10-15 phút. Mình sẽ dùng Docusaurus (framework dễ dùng cho docs/blog static site). Toàn bộ làm trên web, không cần cài gì local. (Dựa trên kinh nghiệm thực tế từ setup của mình – repo `jaxvn-blog` bạn có thể thay tên repo bằng tên của bạn nếu muốn, ví dụ: `your-blog`, nhưng giữ nguyên để theo hướng dẫn dễ dàng).

## Bước 1: Tạo Repo Mới Trống
1. GitHub web > Nút **New** (xanh lá) > Tên repo: `jaxvn-blog` (hoặc tên bạn thích, ví dụ: `your-blog` – ghi chú: chọn tên ngắn gọn, không dấu cách).
2. Chọn **Public** > **KHÔNG tick** README, .gitignore, license (để repo trống hoàn toàn).
3. Nhấn **Create repository**.

## Bước 2: Mở Codespace (Môi Trường Dev Web)
1. Vào repo mới > Nút **Code** (xanh) > Tab **Codespaces** > **Create codespace on main**.
2. Chờ load 1-2 phút (tự cài Node/Yarn). Terminal mở (Ctrl+`), prompt: `@user ➜ /workspaces/jaxvn-blog (main) $` (ghi chú: path này dựa trên tên repo của bạn; nếu thay tên repo, path sẽ là `/workspaces/your-blog`).

## Bước 3: Bootstrap Site Docusaurus (Tạo Cấu Trúc Blog)
Từ terminal root (`/workspaces/jaxvn-blog`):
```
npx create-docusaurus@latest blog classic
```
- Chọn **JavaScript** (gõ `js` khi hỏi language – đơn giản cho newbie).
- Gõ `y` cho "Ok to proceed?".
- Chờ cài dependencies (30-60 giây): Thấy "[SUCCESS] Created blog."

Kiểm tra: `ls` – thấy folder `blog/` mới với `docs/`, `blog/`, `package.json`.

## Bước 4: Chạy Dev Server Và Preview
```
cd blog  # Vào folder site
yarn start    # Build và chạy server (10-20 giây)
```
- Thấy: `[SUCCESS] Docusaurus website is running at: http://localhost:3000/`.
- Tab **Ports** (bên phải VS Code) > Port **3000** > **Open in Browser** → Link public: `https://<random>-3000.app.github.dev/` (ví dụ của mình là bookish-space-waffle-jjvvrxvw5qxfpjqr-3000...).
- Phần `<random>` thì hệ thống tự động tạo ra lần đầu tiên khi khởi tạo, sau này nó sẽ giữ nguyên.
- Trang của bạn đang đọc có url đường dẫn đầy đủ là:
 https://bookish-space-waffle-jjvvrxvw5qxfpjqr-3000.app.github.dev/docs/intro
 
## Bước 5: Edit Nội Dung Đầu Tiên (Hot-Reload Tự Update)
- Mở `docs/intro.md` trong VS Code (file explorer trái).
- Sửa Markdown (ví dụ):
```
  # Chào Mừng Đến Blog Của Bạn!

  Đây là trang hướng dẫn đầu tiên. Bạn có thể thêm:
  - **Bold** cho nhấn mạnh.
  - Danh sách: - Item 1, - Item 2.
  - Link: [GitHub Repo](https://github.com/your-username/jaxvn-blog).
  - Hình: ![Docusaurus](../static/img/docusaurus.png) (upload img vào `static/img/` nếu cần).

  Save (Ctrl+S) – preview tự refresh sau 2 giây!
```
- Tùy chỉnh config: Mở `docusaurus.config.js` > Sửa `title: 'JaxVN Blog'`, `tagline: 'Hướng dẫn GitHub cho newbie'` (ghi chú: thay 'JaxVN Blog' bằng tên site của bạn nếu muốn).

## Bước 6: Commit Và Push (Sync Lên GitHub)
- Quay lại cửa sổ Codespace tab TERMINAL, tại dấu nhắc lệnh bạn sẽ thấy mỗi khi bạn gõ hoặc chỉnh sửa thì nó sẽ tự động chạy thông báo:
```
✔ Client
  Compiled successfully in 619.52ms

client (webpack 5.102.1) compiled successfully
```
- Bấm Ctrl+C để dừng lệnh 'yarn star' nó sẽ trả về dấu nhắc
```
@JaxVN ➜ /workspaces/jaxvn-blog/blog (main) $ 
``` 
- Copy & dán các lệnh sau để đồng bộ sự thay đổi về repo của mình:

```
git add .
git commit -m "Add intro doc and first edits"
git push origin main
```
- Thấy: "40 files changed..." (nếu bootstrap lần đầu) – repo web sync ngay (refresh GitHub để xem).

Xong! Bạn đã có blog live trên Codespace. Giờ edit `docs/intro.md` theo hướng dẫn này, push lên – ai mới cũng làm được! ^^ 
**Lưu ý**:
- Save file là preview tự refresh sau 2 giây!
- Mình dùng Chrome, chọn cho phép luôn mở cửa sổ mới với trang Codespace thì sau này mỗi lần chạy `yarn start` là nó tự động mở trình duyệt mới luôn à!
```
@JaxVN ➜ /workspaces/jaxvn-blog/blog (main) $ yarn start
yarn run v1.22.22
$ docusaurus start
[INFO] Starting the development server...
[SUCCESS] Docusaurus website is running at: http://localhost:3000/

✔ Client
  Compiled successfully in 1.81s

client (webpack 5.102.1) compiled successfully
```