const fs = require('fs');
const path = require('path');

// Base URL for your site
const baseUrl = process.env.REACT_APP_BASE_URL || 'https://rudapaints.com';

// List of all routes in your application
const pages = [
  { url: '', priority: 1.0, changefreq: 'daily' }, // Home page
  { url: '/products', priority: 0.9, changefreq: 'weekly' },
  { url: '/price-list', priority: 0.8, changefreq: 'weekly' },
  { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  { url: '/admin/login', priority: 0.3, changefreq: 'monthly' },
  // Add more routes as needed
];

// Generate current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// Create XML sitemap content
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${pages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.image ? `
    <image:image>
      <image:loc>${page.image}</image:loc>
      <image:title>Ruda Paints ${page.url.split('/').pop()}</image:title>
      <image:caption>Premium paint products in Kenya</image:caption>
    </image:image>` : ''}
  </url>`).join('')}
</urlset>`;

// Write to public directory
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log('✅ Sitemap generated successfully at:', sitemapPath);
console.log(`📊 Total pages in sitemap: ${pages.length}`);
console.log(`🌐 Base URL: ${baseUrl}`);

// Also generate a sitemap index if you have many pages (optional)
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

const sitemapIndexPath = path.join(__dirname, '../public/sitemap-index.xml');
fs.writeFileSync(sitemapIndexPath, sitemapIndex);

console.log('✅ Sitemap index generated at:', sitemapIndexPath);