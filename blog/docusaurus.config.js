// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PCS Vietnam',
  tagline: 'Personal Computing Shield',
  favicon: 'img/favicon.ico',

  url: 'https://pcs.io.vn',
  baseUrl: '/',

  organizationName: 'JaxVN',
  projectName: 'jaxvn-blog',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

<<<<<<< HEAD
  // GTM — inject vào <head>
  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N6QN7WNL');`,
    },
  ],

=======
>>>>>>> 6c2168d6f083d8366a2cb62819b71c675917d616
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    localeConfigs: {
      vi: { label: 'Tiếng Việt' },
      en: { label: 'English' },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'PCS Vietnam',
        logo: {
          alt: 'PCS Vietnam Logo',
          src: 'img/logo.svg',
        },
        items: [
          { label: 'Dịch vụ', position: 'left', type: 'dropdown', items: [
            { label: 'Hỗ trợ từ xa', to: '/services/remote-it-support' },
            { label: 'Sửa phần cứng', to: '/services/hardware-repair' },
            { label: 'Cho doanh nghiệp', to: '/services/for-business' },
          ]},
          { label: 'Sản phẩm', to: '/products', position: 'left' },
          { label: 'Hướng dẫn', to: '/guides', position: 'left' },
          { label: 'Liên hệ', to: '/contact', position: 'left' },
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
              { label: 'Chính sách bảo mật', to: '/privacy' },
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