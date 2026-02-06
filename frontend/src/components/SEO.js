import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Ruda Paints Enterprise | Premium Quality Paints Kenya", 
  description = "Your trusted partner for premium interior & exterior paints, primers, varnishes, and enamel in Kenya. Fast delivery, expert support, affordable prices.",
  keywords = "paints, Nairobi, Kenya, interior paint, exterior paint, primer, varnish, enamel, painting solutions, paint delivery Kenya",
  image = "https://api.rudapaints.com/uploads/logo.png",
  url = "https://rudapaints.com",
  type = "website",
  author = "Ruda Paints Enterprise"
}) => {
  const fullTitle = title.includes("Ruda Paints") ? title : `${title} | Ruda Paints Enterprise`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
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
    </Helmet>
  );
};

export default SEO;