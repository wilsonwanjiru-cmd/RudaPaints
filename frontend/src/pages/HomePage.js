// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Chip,
  Alert,
  CircularProgress,
  CardActions,
} from '@mui/material';
import { Link } from 'react-router-dom';
import BrushIcon from '@mui/icons-material/Brush';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DownloadIcon from '@mui/icons-material/Download';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import NatureIcon from '@mui/icons-material/Nature';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import { testBackendConnection, productsAPI, getImageUrl } from '../services/api';

const HomePage = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [featuredPaints, setFeaturedPaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: 0,
    averagePrice: 0,
  });

  useEffect(() => {
    checkApiHealth();
    fetchFeaturedPaints();
    fetchStats();
    
    // Set document title for SEO
    document.title = "Ruda Paints Kenya | Premium Quality Paints & Coatings in Nairobi";
    
    // Add meta description for SEO
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Ruda Paints offers high-quality interior & exterior paints, waterproofing solutions, and industrial coatings in Kenya. Best prices on premium paints with same-day delivery in Nairobi.';
    document.head.appendChild(metaDescription);
    
    // Cleanup function
    return () => {
      document.title = 'Ruda Paints';
      const existingMeta = document.querySelector('meta[name="description"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    };
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await testBackendConnection();
      setApiStatus({
        status: response.connected ? 'online' : 'offline',
        database: response.database || 'unknown',
        message: response.message || 'API is connected and working',
        uptime: response.uptime || 0,
      });
    } catch (error) {
      console.error('Error checking API health:', error);
      setApiStatus({
        status: 'offline',
        database: 'disconnected',
        message: 'API connection failed',
        uptime: 0,
      });
    }
  };

  const fetchFeaturedPaints = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      
      let paints = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          paints = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          paints = response.data.data;
        } else if (response.data.paints && Array.isArray(response.data.paints)) {
          paints = response.data.paints;
        }
      }
      
      const featured = paints.slice(0, 4);
      setFeaturedPaints(featured);
    } catch (error) {
      console.error('Error fetching featured paints:', error);
      setFeaturedPaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await productsAPI.getAll();
      
      let paints = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          paints = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          paints = response.data.data;
        } else if (response.data.paints && Array.isArray(response.data.paints)) {
          paints = response.data.paints;
        }
      }
      
      if (paints.length > 0) {
        const categories = [...new Set(paints.map(paint => paint.category))];
        const totalPrice = paints.reduce((sum, paint) => sum + (paint.price || 0), 0);
        const averagePrice = Math.round(totalPrice / paints.length);
        
        setStats({
          totalProducts: paints.length,
          categories: categories.length,
          averagePrice: averagePrice || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleWhatsAppOrder = (paintName, size) => {
    const message = `Hello Ruda Paints! I'm interested in ordering ${paintName} (${size}). Please provide more details.`;
    const whatsappUrl = `https://wa.me/254703538670?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Simple SEO data generation without Helmet issues
  const generateSEOData = () => {
    if (!featuredPaints.length) return null;
    
    const seoData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Ruda Paints Kenya",
      "url": window.location.origin,
      "description": "Premium Quality Paints & Coatings in Kenya"
    };
    
    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(seoData);
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  };

  // Call SEO data generation when featured paints load
  useEffect(() => {
    if (featuredPaints.length > 0) {
      const cleanup = generateSEOData();
      return cleanup;
    }
  }, [featuredPaints]);

  const features = [
    {
      icon: <BrushIcon sx={{ fontSize: 40 }} />,
      title: 'Premium Quality Paints',
      description: 'High-quality interior and exterior paints with excellent coverage and durability. VOC-free options available.',
      color: '#1976d2',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Same-Day Delivery Nairobi',
      description: 'Fast and reliable delivery across Kenya. Free delivery for orders over KES 10,000 in Nairobi.',
      color: '#2e7d32',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Expert Support',
      description: 'Professional painting advice and customer support. WhatsApp consultation available.',
      color: '#ed6c02',
    },
    {
      icon: <NatureIcon sx={{ fontSize: 40 }} />,
      title: 'Eco-Friendly Solutions',
      description: 'Environmentally friendly paints with low VOC content. Safe for families and pets.',
      color: '#4caf50',
    }
  ];

  const benefits = [
    {
      icon: <CheckCircleIcon color="success" />,
      title: '10-Year Durability',
      description: 'Our premium paints are formulated to last up to 10 years without fading or peeling.'
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Fast Drying Time',
      description: 'Quick-drying formulas allow for multiple coats in a single day.'
    },
    {
      icon: <SecurityIcon color="info" />,
      title: 'Weather Resistant',
      description: 'Excellent resistance to harsh weather conditions and UV rays.'
    },
    {
      icon: <EmojiNatureIcon color="success" />,
      title: 'Non-Toxic Formula',
      description: 'Safe for children and pets with low VOC emissions.'
    }
  ];

  const statsData = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: '🎨',
      description: 'Paint varieties',
    },
    {
      label: 'Categories',
      value: stats.categories,
      icon: '📊',
      description: 'Different types',
    },
    {
      label: 'Avg Price',
      value: `KES ${stats.averagePrice.toLocaleString()}`,
      icon: '💰',
      description: 'Per product',
    },
    {
      label: 'Support',
      value: '24/7',
      icon: '💬',
      description: 'WhatsApp available',
    },
  ];

  const categories = [
    { name: 'Interior Paints', description: 'For indoor walls and ceilings' },
    { name: 'Exterior Paints', description: 'Weather-resistant outdoor paints' },
    { name: 'Waterproofing', description: 'Waterproof coatings and sealants' },
    { name: 'Industrial Coatings', description: 'Heavy-duty protective coatings' },
    { name: 'Primers', description: 'Surface preparation products' },
    { name: 'Varnishes', description: 'Wood protection and finishing' }
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* API Status Indicator */}
      {apiStatus && (
        <Alert 
          severity={apiStatus.status === 'online' ? 'success' : 'error'}
          sx={{ 
            mb: 2, 
            mx: 'auto', 
            maxWidth: 'lg',
            borderRadius: 2,
            boxShadow: 1,
          }}
          icon={apiStatus.status === 'online' ? <StarIcon /> : null}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2">
                System Status: <strong>{apiStatus.status === 'online' ? 'All Systems Go!' : 'System Offline'}</strong>
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                Database: {apiStatus.database === 'connected' ? 'Connected ✓' : 'Disconnected ✗'} | 
                Uptime: {apiStatus.uptime ? `${Math.floor(apiStatus.uptime / 3600)}h` : 'N/A'}
              </Typography>
            </Box>
            {apiStatus.status === 'online' && (
              <Chip 
                label="LIVE" 
                color="success" 
                size="small" 
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
        </Alert>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                mb: 2,
              }}
            >
              Premium Quality Paints & Coatings in Kenya
            </Typography>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                mb: 4,
                fontWeight: 300,
                opacity: 0.95,
                fontSize: { xs: '1.25rem', md: '1.75rem' },
              }}
            >
              Your Trusted Partner for Professional Painting Solutions
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                opacity: 0.9,
                fontSize: '1.1rem',
              }}
            >
              Discover premium quality interior and exterior paints, waterproofing solutions, and industrial coatings. 
              Serving Nairobi and across Kenya with same-day delivery available.
            </Typography>
            <Box sx={{ 
              mt: 4,
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/products"
                startIcon={<ShoppingCartIcon />}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Browse Products
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                to="/price-list"
                startIcon={<DownloadIcon />}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Download Price List
              </Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<WhatsAppIcon />}
                onClick={() => handleWhatsAppOrder('General Inquiry', 'Any Size')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Chat on WhatsApp
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            color: 'primary.main',
            mb: 1,
          }}
        >
          Trusted by Thousands in Kenya
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          Quality products and excellent service have made us the preferred paint supplier in Kenya
        </Typography>
        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                  },
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            color: 'primary.main',
            mb: 1,
          }}
        >
          Why Choose Ruda Paints
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          We combine premium quality products with exceptional service to deliver the best painting solutions in Kenya
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  borderTop: `4px solid ${feature.color}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${feature.color}40`,
                  },
                }}
              >
                <Box sx={{ 
                  color: feature.color, 
                  mb: 2,
                  p: 2,
                  borderRadius: '50%',
                  backgroundColor: `${feature.color}15`,
                }}>
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            color: 'primary.main',
            mb: 6,
          }}
        >
          Key Benefits of Our Paints
        </Typography>
        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                p: 3,
                height: '100%',
              }}>
                <Box sx={{ mb: 2 }}>
                  {benefit.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                color: 'primary.main',
              }}
            >
              Featured Paint Products
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Best selling premium quality paints in Kenya
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/products"
            size="large"
            sx={{ 
              fontWeight: 'bold',
              borderRadius: 2,
              px: 4,
            }}
          >
            View All Products
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : featuredPaints.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              No products available yet
            </Typography>
            <Typography>
              Add some paint products from the Products page to see them featured here.
            </Typography>
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {featuredPaints.map((paint) => (
              <Grid item xs={12} sm={6} lg={3} key={paint._id || paint.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                  },
                }}>
                  {paint.image && (
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(paint.image)}
                        alt={paint.name || 'Paint'}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231976d2"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Ruda Paints</text></svg>`;
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(25, 118, 210, 0.9)',
                        color: 'white',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {paint.size || 'Standard'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, pr: 1 }}>
                        {paint.name || 'Paint Name'}
                      </Typography>
                      <Chip 
                        label={paint.category || 'General'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      {paint.brand || 'Ruda Paints'}
                    </Typography>
                    
                    {paint.description && (
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {paint.description}
                      </Typography>
                    )}
                    
                    {paint.features && paint.features.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        {paint.features.slice(0, 2).map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            sx={{ 
                              mr: 0.5, 
                              mb: 0.5,
                              bgcolor: 'primary.light',
                              color: 'white',
                              fontWeight: 'medium',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    <Typography variant="h5" color="primary" sx={{ 
                      fontWeight: 'bold',
                      mt: 'auto',
                      textAlign: 'right',
                    }}>
                      KES {(paint.price || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCartIcon />}
                      component={Link}
                      to="/products"
                      sx={{ 
                        fontWeight: 'bold',
                        borderRadius: 2,
                        py: 1.5,
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            color: 'primary.main',
            mb: 6,
          }}
        >
          Paint Categories
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: '1px solid #dee2e6',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                >
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    component={Link}
                    to={`/products?category=${category.name.split(' ')[0]}`}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Browse Products →
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          mb: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Start Your Painting Project Today
          </Typography>
          <Typography 
            variant="h5" 
            align="center" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontWeight: 300,
              opacity: 0.95,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Get the perfect paint for your project. Download our price list or contact us for a custom quote.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to="/contact"
              startIcon={<WhatsAppIcon />}
              sx={{ 
                px: 5,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                '&:hover': {
                  boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
              }}
            >
              Contact Us
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={Link}
              to="/price-list"
              startIcon={<DownloadIcon />}
              sx={{ 
                px: 5,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                transition: 'all 0.3s',
              }}
            >
              Get Price List
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<ShoppingCartIcon />}
              component={Link}
              to="/products"
              sx={{ 
                px: 5,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                '&:hover': {
                  boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
              }}
            >
              Shop Now
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 4,
              opacity: 0.8,
              fontStyle: 'italic',
            }}
          >
            WhatsApp: +254 703 538 670 | Email: info@rudapaints.com | Nairobi, Kenya
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;