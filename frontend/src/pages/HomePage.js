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
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await testBackendConnection();
      setApiStatus({
        status: 'online',
        database: response.data?.database || response.database || 'unknown',
        message: 'API is connected and working',
        uptime: response.data?.uptime || response.uptime || 0,
      });
    } catch (error) {
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
      
      // Handle different response structures
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
      
      // Get latest 4 paints as featured, or if less than 4, get all
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

  const features = [
    {
      icon: <BrushIcon sx={{ fontSize: 40 }} />,
      title: 'Premium Quality Paints',
      description: 'High-quality interior and exterior paints with excellent coverage and durability.',
      color: '#1976d2',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Delivery',
      description: 'Same-day delivery available in Nairobi. Reliable service across Kenya.',
      color: '#2e7d32',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: 'Expert Support',
      description: 'Professional advice and customer support. WhatsApp ready for instant queries.',
      color: '#ed6c02',
    },
    {
      icon: <DownloadIcon sx={{ fontSize: 40 }} />,
      title: 'Easy Price Lists',
      description: 'Download updated price lists in CSV or Excel format anytime.',
      color: '#9c27b0',
    },
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

  const categories = ['Interior', 'Exterior', 'Primer', 'Varnish', 'Enamel'];

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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E")',
            opacity: 0.1,
          },
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
              Welcome to Ruda Paints Enterprise
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
              Your Trusted Partner for Quality Paints & Professional Solutions
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
              Discover premium quality paints for every surface. From interior elegance to exterior durability, 
              we provide solutions that last.
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
          Why Choose Us
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          We combine quality products with exceptional service to deliver the best painting solutions
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
              Featured Products
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Our most popular and latest paint selections
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
              '& .MuiAlert-icon': { fontSize: '2rem' },
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
                        alt={paint.name}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200/1976d2/ffffff?text=Ruda+Paints';
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
        <Grid container spacing={2} justifyContent="center">
          {categories.map((category) => (
            <Grid item key={category}>
              <Button
                variant="outlined"
                component={Link}
                to={`/products?category=${category}`}
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                  transition: 'all 0.3s',
                }}
              >
                {category} Paints
              </Button>
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
            Ready to Start Your Project?
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
            WhatsApp: 0703538670 | Email: rudapaints@gmail.com
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;