 /** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'JaxVN Blog',
  tagline: 'Tài liệu cá nhân',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://jaxvn-blog.pages.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'JaxVN', // Usually your GitHub org/user name.
  projectName: 'jaxvn-blog', // Usually your repo name.

  onBrokenLinks: 'throw',
  // Di chuyển onBrokenMarkdownLinks vào markdown.hooks để fix warning
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'vi',  // Tiếng Việt làm ngôn ngữ chính
    locales: ['vi', 'en'],  // Hỗ trợ vi (gốc) + en (dịch sau)
    localeConfigs: {
      vi: {
        label: 'Tiếng Việt',
        direction: 'ltr',  // Left-to-right
      },
      en: {
        label: 'English',
        direction: 'ltr',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/JaxVN/jaxvn-blog/tree/main/blog/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/JaxVN/jaxvn-blog/tree/main/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'JaxVN Blog',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Hướng dẫn',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left'
          },
          {
            href: 'https://github.com/JaxVN/jaxvn-blog',
            label: 'GitHub',
            position: 'right',
          },
          {type: 'localeDropdown', position: 'right'},  // Dropdown ngôn ngữ ở phải navbar
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Hướng dẫn',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      // Bỏ prism block để tránh lỗi module – code block vẫn highlight cơ bản với theme default
    }),

  // Thêm future flags nếu cần (giữ nguyên từ file hiện tại)
  future: {
    v4: true,
  },
};

module.exports = config;