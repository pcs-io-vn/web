import React from 'react';
import Layout from '@theme/Layout';

export default function BrowserPolicy() {
  return (
    <Layout
      title="Browser Policy Manager"
      description="Công cụ quản lý cấu hình trình duyệt Edge và Chrome tập trung — sắp ra mắt.">
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1>🌐 Browser Policy Manager</h1>
        <p>Công cụ quản lý policy Edge &amp; Chrome tập trung — triển khai qua Action1, GPO hoặc Intune.</p>
        <p>🔔 <strong>Đang phát triển</strong> — dự kiến ra mắt Q2 2026.</p>
        <p><a href="/services/for-business">👉 Xem mô tả chi tiết và đăng ký dùng thử</a></p>
      </main>
    </Layout>
  );
}
