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
        <h2>🔔 Sắp ra mắt</h2>
        <h3>🌐 Browser Policy Manager</h3>
        <p>Quản lý cấu hình Edge và Chrome tập trung — triển khai qua Action1, GPO hoặc Intune.</p>
        <ul>
          <li>81+ policies Edge/Chrome</li>
          <li>Tạo script triển khai tự động</li>
          <li>Hỗ trợ Action1 / GPO / Intune / PowerShell</li>
        </ul>
        <p><a href="/services/for-business">🔔 Đăng ký nhận thông báo</a></p>
        <h3>📜 RDPS Script Library</h3>
        <p>Thư viện PowerShell script chuẩn hoá để quản lý Windows policy.</p>
        <p><a href="https://github.com/JaxVN/RDPS" target="_blank" rel="noopener noreferrer">🔔 Theo dõi tại GitHub</a></p>
      </main>
    </Layout>
  );
}
