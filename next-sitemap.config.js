/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://originalfilter.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://originalfilter.com'}/server-sitemap.xml`,
    ],
    policies: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
  },
};
