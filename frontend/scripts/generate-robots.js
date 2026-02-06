const fs = require('fs');
const path = require('path');

// Base URL for your site
const baseUrl = process.env.REACT_APP_BASE_URL || 'https://rudapaints.com';

// Generate robots.txt content
const robotsTxt = `# Ruda Paints - Robots.txt
# Generated: ${new Date().toISOString()}

# Allow all search engines
User-agent: *
Allow: /

# Disallow admin panel from search engines
Disallow: /admin
Disallow: /api
Disallow: /private

# Allow search engines for these paths
Allow: /products
Allow: /price-list
Allow: /contact

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml

# Crawl delay (in seconds)
Crawl-delay: 5

# Google-specific instructions
User-agent: Googlebot
Allow: /
Disallow: /admin
Crawl-delay: 2

# Google AdsBot
User-agent: AdsBot-Google
Allow: /

# Google Images
User-agent: Googlebot-Image
Allow: /
Disallow: /admin
Disallow: /uploads/private

# Bing
User-agent: bingbot
Allow: /
Disallow: /admin
Crawl-delay: 3

# Yandex
User-agent: Yandex
Allow: /
Disallow: /admin
Clean-param: ref /products/

# Baidu
User-agent: Baiduspider
Allow: /
Disallow: /admin
Crawl-delay: 10

# Performance considerations
# Wait at least 1 second between requests
Request-rate: 1/1

# Visit time (based on Nairobi timezone GMT+3)
Visit-time: 0200 0600

# Host directive (primary domain)
Host: ${baseUrl.replace('https://', '')}

# Welcome message for crawlers
# Contact for crawler issues: webmaster@rudapaints.com`;

// Write to public directory
const robotsPath = path.join(__dirname, '../public/robots.txt');
fs.writeFileSync(robotsPath, robotsTxt);

console.log('✅ robots.txt generated successfully at:', robotsPath);
console.log('📋 Sitemap URL:', `${baseUrl}/sitemap.xml`);