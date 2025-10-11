---
id: intro
title: Chào Mừng Đến Blog Của Bạn!
description: Trang hướng dẫn đầu tiên cho người mới GitHub.
---

# Hướng Dẫn Tạo Trang Blog Đầu Tiên Với Docusaurus Trên GitHub Codespace (Dành Cho Người Mới)

Chào bạn mới! Nếu bạn đang làm quen với GitHub như mình, đây là hướng dẫn **step-by-step đơn giản** để tạo repo, setup Codespace, và chạy trang blog preview chỉ trong 10-15 phút. Mình sẽ dùng Docusaurus (framework dễ dùng cho docs/blog static site). Toàn bộ làm trên web, không cần cài gì local. (Dựa trên kinh nghiệm thực tế từ setup của mình – repo `jaxvn-blog` (bạn có thể thay tên repo bằng tên của bạn nếu muốn, ví dụ: `your-blog`, nhưng giữ nguyên để theo hướng dẫn dễ dàng)).

## Chuẩn Bị: Xóa Repo Cũ (Nếu Có)
Nếu bạn có repo cũ bị lộn xộn (như fork sai hoặc nested folders), xóa để sạch sẽ:
1. GitHub web > Vào repo cũ > **Settings** > Cuộn xuống **Danger Zone** > **Delete this repository** > Xác nhận bằng tên repo.

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
- Tab **Ports** (bên phải VS Code) > Port **3000** > **Open in Browser** → Link public: `https://<random>-3000.app.github.dev/` (ví dụ: https://bookish-space-waffle-...).
- Site load: Trang chủ default với sidebar docs/blog mẫu.

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
Từ folder `blog`:
```
git add .
git commit -m "Add intro doc and first edits"
git push origin main
```
- Thấy: "40 files changed..." (nếu bootstrap lần đầu) – repo web sync ngay (refresh GitHub để xem).

## Mẹo Cho Người Mới
- **Lỗi phổ biến**: Nếu "Directory already exists" – tạo folder khác (thay `blog` bằng `my-blog`) hoặc clean bằng `git clean -fd`.
- **Edit nhanh**: Sửa trực tiếp trên GitHub web (bút chì icon) > Commit – không cần Codespace cho docs đơn giản.
- **Di chuyển lên root** (nếu muốn clean): `cd .. && cd blog && mv * .. && mv .* .. && cd .. && rm -rf blog && git add . && git commit -m "Move to root" && git push`.
- **Sau này**: Thêm bài blog mới trong `blog/` (file `.md` với YAML frontmatter), push để update.

Xong! Bạn đã có blog live trên Codespace. Giờ edit `docs/intro.md` theo hướng dẫn này, push lên – ai mới cũng làm được. Nếu kẹt lệnh nào, paste log terminal nhé! ^^ (Repo mẫu của mình: https://github.com/JaxVN/jaxvn-blog).
**Lưu ý**: Save file là preview tự refresh sau 2 giây!
Của mình thì ở đây: "https://bookish-space-waffle-jjvvrxvw5qxfpjqr-3000.app.github.dev/docs/intro"