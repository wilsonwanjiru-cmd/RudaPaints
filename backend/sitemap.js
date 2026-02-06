const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');

const generateSitemap = async () => {
  try {
    const sitemap = new SitemapStream({ 
      hostname: 'https://rudapaints.com',
      lastmodDateOnly: true 
    });
    
    const pages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'weekly', priority: 0.9 },
      { url: '/price-list', changefreq: 'monthly', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 },
    ];
    
    pages.forEach(page => sitemap.write(page));
    sitemap.end();
    
    const sitemapBuffer = await streamToPromise(sitemap);
    const gzipped = await streamToPromise(sitemap.pipe(createGzip()));
    
    // Save to file
    fs.writeFileSync(path.join(__dirname, '../frontend/public/sitemap.xml'), sitemapBuffer);
    fs.writeFileSync(path.join(__dirname, '../frontend/public/sitemap.xml.gz'), gzipped);
    
    console.log('✅ Sitemap generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    return false;
  }
};

module.exports = generateSitemap;