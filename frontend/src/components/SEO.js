// frontend/src/components/SEO.js
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title = "Ruda Paints Enterprise | Premium Quality Paints Kenya", 
  description = "Your trusted partner for premium interior & exterior paints, primers, varnishes, and enamel in Kenya. Fast delivery, expert support, affordable prices.",
  keywords = "paints, Nairobi, Kenya, interior paint, exterior paint, primer, varnish, enamel, painting solutions, paint delivery Kenya",
  image = "https://api.rudapaints.com/uploads/logo.png",
  url = "https://rudapaints.com",
  type = "website",
  author = "Ruda Paints Enterprise"
}) => {
  const location = useLocation();
  const fullTitle = title.includes("Ruda Paints") ? title : `${title} | Ruda Paints Enterprise`;
  const currentUrl = `${url}${location.pathname}`;
  
  // Google Analytics tracking
  useEffect(() => {
    // Only load in production
    if (process.env.NODE_ENV === 'production') {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // REPLACE WITH YOUR ACTUAL ID
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        // Configure Google Analytics
        gtag('config', 'G-XXXXXXXXXX', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
          send_page_view: true
        });
      `;
      document.head.appendChild(script2);
      
      // Track page view on route change
      if (window.gtag) {
        window.gtag('config', 'G-XXXXXXXXXX', {
          page_path: location.pathname + location.search,
        });
      }
    }
  }, [location]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
      
      {/* GOOGLE SEARCH CONSOLE VERIFICATION */}
      <meta name="google-site-verification" content="googleea6c0f24382c1950" />
      
      {/* GOOGLE ANALYTICS */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </script>
      
      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Ruda Paints Enterprise" />
      <meta property="og:locale" content="en_KE" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@rudapaints" />
      
      {/* Additional */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      
      {/* Sitemap */}
      <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      
      {/* Structured Data for Local Business (VERY IMPORTANT) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Ruda Paints Enterprise",
          "description": "Premium quality paints and painting solutions in Kenya",
          "url": "https://rudapaints.com",
          "logo": "https://api.rudapaints.com/uploads/logo.png",
          "image": "https://api.rudapaints.com/uploads/banner.jpg",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Nairobi",
            "addressLocality": "Nairobi",
            "addressRegion": "Nairobi",
            "addressCountry": "KE"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-1.286389",
            "longitude": "36.817223"
          },
          "telephone": "+254703538670",
          "email": "rudapaints@gmail.com",
          "priceRange": "$$",
          "openingHours": "Mo-Su 08:00-18:00",
          "sameAs": [
            "https://www.tiktok.com/@rudapaints"
          ]
        })}
      </script>
      
      {/* Additional Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Ruda Paints Enterprise",
          "url": "https://rudapaints.com",
          "logo": "https://api.rudapaints.com/uploads/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+254703538670",
            "contactType": "customer service",
            "email": "rudapaints@gmail.com",
            "areaServed": "KE",
            "availableLanguage": ["English", "Swahili"]
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;