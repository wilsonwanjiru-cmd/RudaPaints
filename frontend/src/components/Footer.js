// frontend/src/components/Footer.js
import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  WhatsApp, 
  Email, 
  LocationOn, 
  Phone, 
  AccessTime,
  Send,
  Brush,
  Pinterest,
  LinkedIn,
  YouTube,
  Telegram,
  Download,
  ArrowForward,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { newsletterAPI } from '../services/api';

const Footer = () => {
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '254703538670';
  const email = process.env.REACT_APP_EMAIL || 'rudapaints@gmail.com';
  const companyName = process.env.REACT_APP_COMPANY_NAME || 'Ruda Paints Enterprise';
  const companyAddress = process.env.REACT_APP_COMPANY_ADDRESS || 'Nairobi, Kenya';
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterAlert, setNewsletterAlert] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleWhatsAppClick = () => {
    const message = `Hello ${companyName}! I would like to inquire about your products.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}?subject=Inquiry from ${companyName} Website`;
  };

  const handleSocialMediaClick = (platform) => {
    const urls = {
      facebook: 'https://facebook.com/rudapaints',
      instagram: 'https://instagram.com/rudapaints',
      twitter: 'https://twitter.com/rudapaints',
      pinterest: 'https://pinterest.com/rudapaints',
      linkedin: 'https://linkedin.com/company/rudapaints',
      youtube: 'https://youtube.com/c/rudapaints',
      telegram: 'https://t.me/rudapaints',
    };
    window.open(urls[platform], '_blank');
  };

  const validateNewsletterForm = () => {
    const errors = {};
    
    if (!newsletterEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newsletterEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (newsletterName && newsletterName.length > 100) {
      errors.name = 'Name cannot exceed 100 characters';
    }
    
    return errors;
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateNewsletterForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setNewsletterLoading(true);
    setFormErrors({});
    
    try {
      // Create the data object to send
      const subscriberData = {
        email: newsletterEmail,
        name: newsletterName || ''
      };
      
      console.log('Subscribing with data:', subscriberData);
      
      // Call the API with the correct data format
      const response = await newsletterAPI.subscribe(subscriberData);
      
      console.log('Subscription response:', response);
      
      setNewsletterAlert({
        open: true,
        message: response.data?.message || 'Successfully subscribed to newsletter!',
        severity: 'success',
      });
      
      // Clear form
      setNewsletterEmail('');
      setNewsletterName('');
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      let errorMessage = 'Failed to subscribe. Please try again.';
      
      // Handle different error formats
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data) {
          errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : JSON.stringify(error.response.data);
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      setNewsletterAlert({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleNewsletterAlertClose = () => {
    setNewsletterAlert({ ...newsletterAlert, open: false });
  };

  const businessHours = [
    { day: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', time: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ];

  const quickLinks = [
    { text: 'Home', path: '/' },
    { text: 'Products', path: '/products' },
    { text: 'Price List', path: '/price-list' },
    { text: 'Contact Us', path: '/contact' },
  ];

  const services = [
    'Interior Painting',
    'Exterior Painting',
    'Commercial Painting',
    'Residential Painting',
    'Color Consultation',
    'Paint Supply',
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a1a2e',
        color: 'white',
        pt: 8,
        pb: 4,
        mt: 'auto',
        borderTop: '4px solid',
        borderColor: 'primary.main',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2, #2196f3, #42a5f5)',
        },
      }}
    >
      <Snackbar
        open={newsletterAlert.open}
        autoHideDuration={6000}
        onClose={handleNewsletterAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNewsletterAlertClose}
          severity={newsletterAlert.severity}
          sx={{ width: '100%' }}
          icon={newsletterAlert.severity === 'success' ? <CheckCircle /> : <ErrorIcon />}
        >
          {newsletterAlert.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl">
        {/* Main Footer Content */}
        <Grid container spacing={6}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Brush sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
                {companyName}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.8 }}>
              Your trusted partner for premium quality paints and professional painting solutions. 
              We provide exceptional products and services for residential and commercial projects.
            </Typography>
            
            {/* Newsletter Subscription */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.light' }}>
                Subscribe to Our Newsletter
              </Typography>
              <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  placeholder="Your email address *"
                  variant="outlined"
                  size="small"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={newsletterLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
                
                <TextField
                  placeholder="Your name (optional)"
                  variant="outlined"
                  size="small"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={newsletterLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  endIcon={newsletterLoading ? <CircularProgress size={20} /> : <Send />}
                  disabled={newsletterLoading}
                  sx={{ 
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    py: 1,
                  }}
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe Now'}
                </Button>
                
                <Typography variant="caption" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
                  Get updates on new products, promotions, and painting tips.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.light' }}>
              Quick Links
            </Typography>
            <List dense sx={{ p: 0 }}>
              {quickLinks.map((link, index) => (
                <ListItem 
                  key={index} 
                  component={Link}
                  to={link.path}
                  sx={{ 
                    p: 0, 
                    mb: 1.5,
                    '&:hover': { 
                      '& .MuiListItemText-primary': { 
                        color: 'primary.light',
                        transform: 'translateX(5px)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.light',
                      },
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                    <ArrowForward sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={link.text}
                    sx={{ 
                      '& .MuiTypography-root': {
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 500,
                        transition: 'all 0.3s',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.light' }}>
              Our Services
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {services.map((service, index) => (
                <Chip
                  key={index}
                  label={service}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    color: 'primary.light',
                    border: '1px solid rgba(25, 118, 210, 0.3)',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </Box>
            
            {/* Download Price List */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Download />}
                component={Link}
                to="/price-list"
                fullWidth
                sx={{ 
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 },
                  fontWeight: 'bold',
                }}
              >
                Download Price List
              </Button>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.light' }}>
              Contact Info
            </Typography>
            
            <List dense sx={{ p: 0 }}>
              <ListItem sx={{ p: 0, mb: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText 
                  primary="Address"
                  secondary={companyAddress}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'primary.light',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </ListItem>
              
              <ListItem sx={{ p: 0, mb: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <Phone />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone"
                  secondary="+254 703 538 670"
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'primary.light',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </ListItem>
              
              <ListItem sx={{ p: 0, mb: 2.5 }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary={email}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'primary.light',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </ListItem>
              
              <ListItem sx={{ p: 0 }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <AccessTime />
                </ListItemIcon>
                <Box>
                  <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 600 }}>
                    Business Hours
                  </Typography>
                  {businessHours.map((hour, index) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                      {hour.day}: {hour.time}
                    </Typography>
                  ))}
                </Box>
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Footer */}
        <Grid container spacing={4} alignItems="center">
          {/* Social Media */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
                Follow us:
              </Typography>
              {[
                { icon: <Facebook />, platform: 'facebook', color: '#1877F2' },
                { icon: <Instagram />, platform: 'instagram', color: '#E4405F' },
                { icon: <Twitter />, platform: 'twitter', color: '#1DA1F2' },
                { icon: <Pinterest />, platform: 'pinterest', color: '#BD081C' },
                { icon: <LinkedIn />, platform: 'linkedin', color: '#0A66C2' },
                { icon: <YouTube />, platform: 'youtube', color: '#FF0000' },
                { icon: <Telegram />, platform: 'telegram', color: '#0088CC' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  onClick={() => handleSocialMediaClick(social.platform)}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: social.color,
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s',
                    width: 40,
                    height: 40,
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Contact Buttons */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end' }, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsApp />}
                onClick={handleWhatsAppClick}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  backgroundColor: '#25D366',
                  '&:hover': {
                    backgroundColor: '#128C7E',
                    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.3)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                WhatsApp Chat
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Email />}
                onClick={handleEmailClick}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Send Email
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Phone />}
                onClick={() => window.location.href = 'tel:+254703538670'}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Call Now
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ opacity: 0.7, textAlign: { xs: 'center', md: 'left' } }}>
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: { xs: 'center', md: 'flex-end' },
              flexWrap: 'wrap',
            }}>
              <MuiLink
                component={Link}
                to="/"
                sx={{ 
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.light' },
                  transition: 'color 0.3s',
                }}
              >
                Privacy Policy
              </MuiLink>
              <MuiLink
                component={Link}
                to="/"
                sx={{ 
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.light' },
                  transition: 'color 0.3s',
                }}
              >
                Terms of Service
              </MuiLink>
              <MuiLink
                component={Link}
                to="/"
                sx={{ 
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.light' },
                  transition: 'color 0.3s',
                }}
              >
                Sitemap
              </MuiLink>
              <MuiLink
                component={Link}
                to="/"
                sx={{ 
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.light' },
                  transition: 'color 0.3s',
                }}
              >
                FAQ
              </MuiLink>
            </Box>
          </Grid>
        </Grid>

        {/* Credits */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              opacity: 0.5,
              fontSize: '0.75rem',
            }}
          >
            Website developed with ❤️ by Wilson Muita Wanjiru | Powered by MERN Stack Technology
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              opacity: 0.5,
              fontSize: '0.75rem',
              mt: 0.5,
            }}
          >
            Domain: rudapaintsenterprise.com | Email: {email} | Phone: +254 703 538 670
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;