import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Paper,
  Container,
  Chip,
  Avatar,
  CircularProgress,
  Stack,
  InputAdornment,
  alpha,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import MessageIcon from '@mui/icons-material/Message';
import MapIcon from '@mui/icons-material/Map';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { contactAPI } from '../services/api'; // Make sure this import is correct

const ContactPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [activeContact, setActiveContact] = useState('whatsapp');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // FIXED: Use sendMessage instead of submitContact
      const response = await contactAPI.sendMessage(formData);
      
      setAlert({
        open: true,
        message: response.message,
        severity: 'success',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general',
        priority: 'normal',
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      setAlert({
        open: true,
        message: error.message || 'Failed to send message. Please try again or contact us directly.',
        severity: 'error',
      });
      
      if (error.errors) {
        setErrors(error.errors.reduce((acc, err) => {
          acc[err.param] = err.msg;
          return acc;
        }, {}));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const handleQuickContact = (type) => {
    setActiveContact(type);
    switch(type) {
      case 'whatsapp':
        window.open(`https://wa.me/254703538670?text=Hello%20Ruda%20Paints%20Enterprise!%20I%20would%20like%20to%20inquire%20about%20your%20products.`, '_blank');
        break;
      case 'email':
        window.location.href = 'mailto:rudapaints@gmail.com?subject=Inquiry%20from%20Website&body=Hello%20Ruda%20Paints%20Team,';
        break;
      case 'phone':
        window.location.href = 'tel:+254703538670';
        break;
      default:
        break;
    }
  };

  const contactMethods = [
    {
      id: 'whatsapp',
      icon: <WhatsAppIcon />,
      title: 'WhatsApp Chat',
      value: '+254 703 538 670',
      description: 'Fast response, usually within minutes',
      color: '#25D366',
      action: () => handleQuickContact('whatsapp'),
    },
    {
      id: 'email',
      icon: <EmailIcon />,
      title: 'Email Us',
      value: 'rudapaints@gmail.com',
      description: 'For detailed inquiries and quotations',
      color: '#D44638',
      action: () => handleQuickContact('email'),
    },
    {
      id: 'phone',
      icon: <PhoneIcon />,
      title: 'Call Us',
      value: '0703 538 670',
      description: 'Available during business hours',
      color: theme.palette.primary.main,
      action: () => handleQuickContact('phone'),
    },
    {
      id: 'location',
      icon: <LocationOnIcon />,
      title: 'Our Location',
      value: 'Nairobi, Kenya',
      description: 'Visit our showroom',
      color: '#4CAF50',
      action: () => window.open('https://maps.google.com/?q=Nairobi+Kenya', '_blank'),
    },
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Products' },
    { value: 'support', label: 'Customer Support' },
    { value: 'technical', label: 'Technical Questions' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'feedback', label: 'Feedback' },
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
          icon={alert.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
        <Chip 
          label="GET IN TOUCH" 
          color="primary" 
          sx={{ mb: 2, fontWeight: 'bold' }}
        />
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 800,
            color: theme.palette.primary.main,
            mb: 2
          }}
        >
          Contact Ruda Paints
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Get expert advice, request quotes, or visit our showroom. Our team is ready to help you with your painting needs.
        </Typography>
      </Box>

      {/* Quick Contact Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {contactMethods.map((method) => (
          <Grid item xs={12} sm={6} md={3} key={method.id}>
            <Card 
              elevation={activeContact === method.id ? 3 : 1}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: activeContact === method.id ? `2px solid ${method.color}` : 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={method.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(method.color, 0.1), 
                    color: method.color,
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {method.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {method.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    mb: 1
                  }}
                >
                  {method.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <MessageIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Send us a Message
              </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="e.g., 0703 538 670"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject *"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SubjectIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      label="Priority"
                      startAdornment={
                        <InputAdornment position="start">
                          <PriorityHighIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {priorities.map((pri) => (
                        <MenuItem key={pri.value} value={pri.value}>
                          {pri.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Message *"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={errors.message}
                    multiline
                    rows={6}
                    placeholder="Tell us about your project, preferred products, quantity needed, etc."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{ 
                        px: 6, 
                        py: 1.5,
                        fontWeight: 'bold'
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      * Required fields
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Contact Info & Map */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <MapIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Visit Our Showroom
              </Typography>
            </Box>
            <Divider sx={{ mb: 4 }} />
            
            {/* Map Placeholder */}
            <Box 
              sx={{ 
                height: 200, 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
              onClick={() => window.open('https://maps.google.com/?q=Nairobi+Kenya', '_blank')}
            >
              <LocationOnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="primary.main">
                View on Google Maps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nairobi, Kenya
              </Typography>
            </Box>
            
            {/* Business Hours */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                Business Hours
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Monday - Friday</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>8:00 AM - 6:00 PM</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Saturday</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>9:00 AM - 4:00 PM</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Sunday</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>Closed</Typography>
                </Box>
              </Stack>
            </Box>
            
            {/* Response Time Info */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.success.main}`
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ⏱️ Quick Response Guarantee
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                We pride ourselves on quick response times. Most inquiries receive a response within 1 hour during business hours.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="caption">Average response time: 30 minutes</Typography>
              </Box>
            </Box>
            
            {/* Emergency Contact */}
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.warning.main}`
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                🚚 Urgent Delivery?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Need paint supplies urgently? Call us directly for same-day delivery arrangements.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={() => window.location.href = 'tel:+254703538670'}
                sx={{
                  backgroundColor: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: theme.palette.warning.dark,
                  }
                }}
              >
                Call for Urgent Delivery: 0703 538 670
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactPage;