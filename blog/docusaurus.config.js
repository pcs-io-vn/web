// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PCS Vietnam',
  tagline: 'Hỗ trợ kỹ thuật từ xa | Remote IT Support',
  favicon: 'img/favicon.ico',

  url: 'https://blog.pcs.io.vn',
  baseUrl: '/',

  organizationName: 'JaxVN',   // GitHub username
  projectName: 'jaxvn-blog',   // GitHub repo name

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // ─── i18n: Tiếng Việt mặc định, có thêm English ───
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    localeConfigs: {
      vi: {
        label: '🇻🇳 Tiếng Việt',
        direction: 'ltr',
        htmlLang: 'vi',
      },
      en: {
        label: '🇬🇧 English',
        direction: 'ltr',
        htmlLang: 'en',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false, // Không dùng docs, chỉ dùng pages + blog
        blog: {
          showReadingTime: true,
          routeBasePath: 'blog',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/pcs-social-card.png',

      navbar: {
        title: 'PCS Vietnam',
        logo: {
          alt: 'PCS Logo',
          src: 'img/logo.svg',
        },
        items: [
          { to: '/products', label: 'Sản phẩm', position: 'left' },
          {
            type: 'dropdown',
            label: 'Dịch vụ',
            position: 'left',
            items: [
              { label: 'Tổng quan', to: '/services' },
              { label: 'Hỗ trợ từ xa', to: '/services/remote-it-support' },
              { label: 'Sửa phần cứng', to: '/services/hardware-repair' },
              { label: 'Cho doanh nghiệp', to: '/services/for-business' },
            ],
          },
          { to: '/guides', label: 'Hướng dẫn', position: 'left' },
          { to: '/resources', label: 'Tài nguyên', position: 'left' },
          { to: '/payments', label: 'Thanh toán', position: 'left' },
          { to: '/contact', label: 'Liên hệ', position: 'left' },
          { to: '/tos', label: 'Điều khoản', position: 'right' },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Dịch vụ',
            items: [
              { label: 'Hỗ trợ từ xa', to: '/services/remote-it-support' },
              { label: 'Sửa phần cứng', to: '/services/hardware-repair' },
              { label: 'Cho doanh nghiệp', to: '/services/for-business' },
            ],
          },
          {
            title: 'Thông tin',
            items: [
              { label: 'Sản phẩm', to: '/products' },
              { label: 'Điều khoản dịch vụ', to: '/tos' },
              { label: 'Thanh toán', to: '/payments' },
              { label: 'Hướng dẫn', to: '/guides' },
              { label: 'Tài nguyên', to: '/resources' },
            ],
          },
          {
            title: 'Liên hệ',
            items: [
              { label: 'Email: info@pcs.io.vn', href: 'mailto:info@pcs.io.vn' },
              { label: 'WhatsApp: +84 977 733 339', href: 'https://wa.me/84977733339' },
              { label: 'Tất cả kênh liên lạc', href: 'https://linktr.ee/jaxvn' },
              { label: 'Đặt lịch hẹn', href: 'https://calendar.app.google/r8cNH7giyokjRHP26' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} PCS Vietnam. All rights reserved.`,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;