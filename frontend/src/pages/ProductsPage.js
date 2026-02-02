import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Rating,
  Badge,
  Container,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { productsAPI } from '../services/api';

const ProductsPage = () => {
  const [paints, setPaints] = useState([]);
  const [filteredPaints, setFilteredPaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPaints();
  }, []);

  useEffect(() => {
    filterPaints();
  }, [paints, searchTerm, categoryFilter, activeTab]);

  const fetchPaints = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      
      // Handle the new API response structure
      if (response.data && response.data.success) {
        setPaints(response.data.data || []);
        setFilteredPaints(response.data.data || []);
      } else {
        // Fallback for old structure
        setPaints(Array.isArray(response.data) ? response.data : []);
        setFilteredPaints(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      setError('Failed to fetch paints. Please try again later.');
      console.error('Error fetching paints:', err);
      setPaints([]);
      setFilteredPaints([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPaints = () => {
    let filtered = Array.isArray(paints) ? paints : [];

    if (searchTerm) {
      filtered = filtered.filter(paint =>
        paint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paint.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(paint => paint.category === categoryFilter);
    }

    // Filter by tab (featured/newArrival)
    if (activeTab === 1) { // Featured
      filtered = filtered.filter(paint => paint.featured);
    } else if (activeTab === 2) { // New Arrivals
      filtered = filtered.filter(paint => paint.newArrival); // Changed from isNew to newArrival
    } else if (activeTab === 3) { // On Sale
      filtered = filtered.filter(paint => 
        paint.originalPrice && paint.originalPrice > paint.price
      );
    }

    setFilteredPaints(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleWhatsAppOrder = (paint) => {
    const message = `Hello Ruda Paints! I'm interested in ordering ${paint.name} (${paint.size}) for KES ${paint.price?.toLocaleString() || '0'}. Please provide more details.`;
    const whatsappUrl = `https://wa.me/254703538670?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const categories = ['all', 'Interior', 'Exterior', 'Primer', 'Varnish', 'Enamel', 'Others'];

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 800,
          color: 'primary.main'
        }}>
          Premium Paint Collection
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Explore our wide range of high-quality paints for every surface and need. 
          From interior walls to exterior surfaces, we have the perfect paint for your project.
        </Typography>
      </Box>

      {/* Tabs for Product Categories */}
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': {
              fontWeight: 600,
              py: 2,
            }
          }}
        >
          <Tab icon={<InventoryIcon />} label="All Products" />
          <Tab icon={<WhatshotIcon />} label="Featured" />
          <Tab icon={<NewReleasesIcon />} label="New Arrivals" />
          <Tab icon={<LocalOfferIcon />} label="On Sale" />
        </Tabs>
      </Paper>

      {/* Filters Section */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <TextField
          placeholder="Search paints by name, brand, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="medium"
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Filter by Category"
            onChange={handleCategoryChange}
            size="medium"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Products Count */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            Showing {filteredPaints.length} of {paints.length} products
          </Typography>
        </Box>
        
        {activeTab === 3 && (
          <Chip 
            label="Discounts Available" 
            color="error" 
            variant="outlined"
            icon={<LocalOfferIcon />}
          />
        )}
      </Box>

      {/* Products Grid */}
      {!Array.isArray(filteredPaints) || filteredPaints.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 4,
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
        >
          <Typography variant="h6" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No products available at the moment. Please check back later.'}
          </Typography>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPaints.map((paint) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={paint._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  '& .product-image': {
                    transform: 'scale(1.05)'
                  }
                }
              }}>
                {/* Product Badges */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10, 
                  right: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  zIndex: 2
                }}>
                  <Stack direction="column" spacing={0.5}>
                    {paint.featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    )}
                    {paint.newArrival && (
                      <Chip
                        label="New"
                        color="success"
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    )}
                  </Stack>
                  
                  {paint.originalPrice && paint.originalPrice > paint.price && (
                    <Chip
                      label={`${Math.round(((paint.originalPrice - paint.price) / paint.originalPrice) * 100)}% OFF`}
                      color="error"
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  )}
                </Box>
                
                {/* Product Image */}
                <Box sx={{ 
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {paint.image ? (
                    <CardMedia
                      component="img"
                      image={`http://localhost:5000${paint.image}`}
                      alt={paint.name}
                      sx={{ 
                        objectFit: 'contain',
                        width: '80%',
                        height: '80%',
                        transition: 'transform 0.3s ease-in-out',
                        className: 'product-image'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}>
                      <LocalOfferIcon sx={{ fontSize: 60, mb: 1 }} />
                      <Typography variant="body2">No Image</Typography>
                    </Box>
                  )}
                  
                  {!paint.available && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                      }}
                    >
                      <Typography variant="h6" color="white" sx={{ fontWeight: 'bold' }}>
                        Out of Stock
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      lineHeight: 1.3
                    }}>
                      {paint.name}
                    </Typography>
                    <Chip
                      label={paint.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                    {paint.brand} • {paint.size}
                  </Typography>
                  
                  {paint.description && (
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary',
                      mb: 2,
                      height: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontSize: '0.875rem'
                    }}>
                      {paint.description}
                    </Typography>
                  )}
                  
                  {/* Features */}
                  {paint.features && paint.features.length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      {paint.features.slice(0, 2).map((feature, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 0.5 
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {/* Price Section */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        KES {paint.price?.toLocaleString() || '0'}
                      </Typography>
                      {paint.originalPrice && paint.originalPrice > paint.price && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textDecoration: 'line-through',
                            color: 'text.secondary',
                            fontSize: '0.875rem'
                          }}
                        >
                          KES {paint.originalPrice.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating 
                        value={paint.rating || 0} 
                        readOnly 
                        size="small" 
                        precision={0.5}
                      />
                      <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
                        ({paint.reviewCount || 0})
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                {/* Action Buttons */}
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleWhatsAppOrder(paint)}
                    disabled={!paint.available}
                    fullWidth
                    sx={{ 
                      py: 1.2,
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      borderRadius: 2
                    }}
                  >
                    {paint.available ? 'Order on WhatsApp' : 'Out of Stock'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Call to Action */}
      {Array.isArray(filteredPaints) && filteredPaints.length > 0 && (
        <Box sx={{ 
          mt: 8, 
          mb: 4,
          p: 5, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            zIndex: 0
          }
        }}>
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <LocalOfferIcon sx={{ fontSize: 60, mb: 3, opacity: 0.9 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Need Bulk Order or Custom Colors?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Contact us directly for wholesale prices, custom color mixing, and large project quotes. 
              We offer special discounts for contractors and bulk purchases.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<WhatsAppIcon />}
                onClick={() => window.open('https://wa.me/254703538670', '_blank')}
                sx={{ 
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                WhatsApp for Bulk Order
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => window.location.href = '/contact'}
                sx={{ 
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Contact Sales Team
              </Button>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default ProductsPage;