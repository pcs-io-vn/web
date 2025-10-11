---
id: intro
title: Chào Mừng Đến Blog Của Bạn!
description: Trang hướng dẫn đầu tiên cho người mới GitHub.
---

# Chào Mừng Đến Blog Của Bạn!

Chào bạn mới! Nếu bạn đang làm quen với GitHub như mình, đây là hướng dẫn step-by-step đơn giản để tạo repo, setup Codespace, và chạy trang blog preview chỉ trong 10-15 phút. Mình sẽ dùng Docusaurus (framework dễ dùng cho docs/blog static site). Toàn bộ làm trên web, không cần cài gì local. (Dựa trên kinh nghiệm thực tế từ setup của mình – repo jaxvn-blog (bạn có thể thay tên repo bằng tên của bạn nếu muốn, ví dụ: your-blog, nhưng giữ nguyên để theo hướng dẫn dễ dàng)).
Chuẩn Bị: Xóa Repo Cũ (Nếu Có)
Nếu bạn có repo cũ bị lộn xộn (như fork sai hoặc nested folders), xóa để sạch sẽ:
GitHub web > Vào repo cũ > Settings > Cuộn xuống Danger Zone > Delete this repository > Xác nhận bằng tên repo.

# Bước 1: Tạo Repo Mới Trống
GitHub web > Nút New (xanh lá) > Tên repo: jaxvn-blog (hoặc tên bạn thích, ví dụ: your-blog – ghi chú: chọn tên ngắn gọn, không dấu cách).
Chọn Public > KHÔNG tick README, .gitignore, license (để repo trống hoàn toàn).
Nhấn Create repository.

# Bước 2: Mở Codespace (Môi Trường Dev Web)
Vào repo mới > Nút Code (xanh) > Tab Codespaces > Create codespace on main.
Chờ load 1-2 phút (tự cài Node/Yarn). Terminal mở (Ctrl+), prompt: @user ➜ /workspaces/jaxvn-blog (main) $(ghi chú: path này dựa trên tên repo của bạn; nếu thay tên repo, path sẽ là/workspaces/your-blog`).


> **Lưu ý**: Save file là preview tự refresh sau 2 giây!
> Của mình thì ở đây: "https://bookish-space-waffle-jjvvrxvw5qxfpjqr-3000.app.github.dev/docs/intro"