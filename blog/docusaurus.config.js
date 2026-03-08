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
            title: 'Dịch vụ | Services',
            items: [
              { label: 'Hỗ trợ từ xa | Remote Support', to: '/services/remote-it-support' },
              { label: 'Sửa phần cứng | Hardware Repair', to: '/services/hardware-repair' },
              { label: 'Cho doanh nghiệp | For Business', to: '/services/for-business' },
            ],
          },
          {
            title: 'Thông tin | Info',
            items: [
              { label: 'Sản phẩm | Products', to: '/products' },
              { label: 'Điều khoản | Terms of Service', to: '/tos' },
              { label: 'Thanh toán | Payments', to: '/payments' },
            ],
          },
          {
            title: 'Liên hệ | Contact',
            items: [
              { label: 'Email: info@pcs.io.vn', href: 'mailto:info@pcs.io.vn' },
              { label: 'Zalo: 0977733339', href: 'https://zalo.me/0977733339' },
              { label: 'Blog', to: '/blog' },
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