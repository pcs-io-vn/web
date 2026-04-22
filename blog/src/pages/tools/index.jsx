import React from 'react';
import Layout from '@theme/Layout';

export default function Tools() {
  return (
    <Layout
      title="Công cụ"
      description="Bộ công cụ quản lý IT và bảo mật miễn phí từ PCS Vietnam">
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1>🛠 Công cụ</h1>
        <p>Bộ công cụ quản lý IT và bảo mật do PCS Vietnam phát triển — miễn phí, chạy trên trình duyệt, không cần cài đặt.</p>
        <hr />
        <h2>✅ Có sẵn ngay</h2>
        <h3>🔐 PCS Compliance Tracker</h3>
        <p>Tự đánh giá mức độ tuân thủ ISO 27001:2022, ISO 42001:2023 và Microsoft 365 Adoption Score.</p>
        <ul>
          <li>Checklist ISO 27001 lọc theo quy mô công ty</li>
          <li>Đánh giá AI governance theo ISO 42001</li>
          <li>Tự động tạo lộ trình 3 giai đoạn</li>
          <li>Dữ liệu lưu trên máy bạn, không gửi đi đâu</li>
        </ul>
        <p><a href="/c"><strong>👉 Dùng ngay — miễn phí</strong></a></p>
        <hr />
        <h3>🌐 Browser Policy Manager</h3>
        <p>Tạo script PowerShell quản lý policy Edge và Chrome — triển khai qua Action1, GPO hoặc thủ công.</p>
        <ul>
          <li>15+ policies Edge/Chrome với registry path chuẩn</li>
          <li>Tự động tạo cả Set-*.ps1 và Remove-*.ps1</li>
          <li>Tuỳ chọn tích hợp RDPS lib/Common.ps1</li>
        </ul>
        <p><a href="/tools/browser-policy"><strong>👉 Dùng ngay — miễn phí</strong></a></p>
      </main>
    </Layout>
  );
}
