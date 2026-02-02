import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { adminAPI, testBackendConnection } from '../services/api';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [createAdminData, setCreateAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [createErrors, setCreateErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [backendStatus, setBackendStatus] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    // Test backend connection on component mount
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await testBackendConnection();
      setBackendStatus({
        connected: true,
        database: response.data.database,
        uptime: response.data.uptime,
        message: 'Backend server is running'
      });
    } catch (error) {
      setBackendStatus({
        connected: false,
        database: 'disconnected',
        uptime: 0,
        message: 'Cannot connect to backend server'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) setLoginError('');
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateAdminData(prev => ({
      ...prev,
      [name]: value
    }));
    if (createErrors[name]) {
      setCreateErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const validateCreateForm = () => {
    const newErrors = {};
    
    if (!createAdminData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (createAdminData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!createAdminData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(createAdminData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!createAdminData.password) {
      newErrors.password = 'Password is required';
    } else if (createAdminData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!createAdminData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (createAdminData.password !== createAdminData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check backend connection first
    if (!backendStatus?.connected) {
      setLoginError('Cannot connect to backend server. Please ensure the backend is running.');
      await checkBackendConnection();
      return;
    }
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setLoginError('');
    
    try {
      console.log('🔐 Attempting admin login...');
      const response = await adminAPI.login(formData);
      
      if (response.data.success) {
        const { token, admin } = response.data;
        
        // Store authentication data
        adminAPI.storeAuthData(token, admin);
        
        console.log('✅ Admin login successful:', admin.email);
        
        // Call parent onLogin callback
        if (onLogin) {
          onLogin(true);
        }
        
        // Show success message
        setLoginError('success: Login successful! Redirecting...');
        
      } else {
        setLoginError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setLoginError('Invalid email or password');
      } else if (error.response?.status === 0 || !error.response) {
        setLoginError('Network error. Please check if backend server is running.');
      } else if (error.response?.status === 404) {
        setLoginError('No admin account found. Would you like to create one?');
        setTimeout(() => {
          setShowCreateAdmin(true);
        }, 2000);
      } else if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (error.message) {
        setLoginError(error.message);
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    const validationErrors = validateCreateForm();
    if (Object.keys(validationErrors).length > 0) {
      setCreateErrors(validationErrors);
      return;
    }
    
    setCreatingAdmin(true);
    
    try {
      console.log('👑 Creating first admin...');
      const response = await adminAPI.create({
        email: createAdminData.email,
        password: createAdminData.password,
        name: createAdminData.name
      });
      
      if (response.data.success) {
        const { token, admin } = response.data;
        
        // Store authentication data
        adminAPI.storeAuthData(token, admin);
        
        console.log('✅ Admin creation successful:', admin.email);
        
        // Show success and close dialog
        setCreateStep(2);
        
        // Auto-close after 2 seconds and redirect
        setTimeout(() => {
          setShowCreateAdmin(false);
          if (onLogin) {
            onLogin(true);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Admin creation error:', error);
      
      if (error.response?.status === 400) {
        setCreateErrors({ 
          general: error.response.data?.message || 'Admin already exists or validation failed' 
        });
      } else if (error.response?.data?.message) {
        setCreateErrors({ general: error.response.data.message });
      } else if (error.message) {
        setCreateErrors({ general: error.message });
      } else {
        setCreateErrors({ general: 'Failed to create admin. Please try again.' });
      }
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleRetryConnection = async () => {
    setLoginError('');
    await checkBackendConnection();
  };

  const steps = ['Enter Admin Details', 'Create Account', 'Success'];

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            width: '100%',
            borderRadius: 3,
            position: 'relative',
          }}
        >
          {/* Backend Status Indicator */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            {backendStatus?.connected ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main">
                  Backend Connected
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon color="error" fontSize="small" />
                <Typography variant="caption" color="error.main">
                  Backend Offline
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettingsIcon 
              sx={{ 
                fontSize: 56, 
                color: 'primary.main',
                mb: 2,
                backgroundColor: 'primary.light',
                borderRadius: '50%',
                p: 1,
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
              Ruda Paints Admin
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Access the admin dashboard
            </Typography>
            
            {backendStatus && !backendStatus.connected && (
              <Alert 
                severity="error" 
                sx={{ mt: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRetryConnection}
                  >
                    Retry
                  </Button>
                }
              >
                <Typography variant="body2">
                  Cannot connect to backend server at http://localhost:5000
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Please ensure the backend server is running.
                </Typography>
              </Alert>
            )}
          </Box>

          {loginError && (
            <Alert 
              severity={loginError.startsWith('success:') ? 'success' : 'error'} 
              sx={{ mb: 3 }}
              icon={loginError.startsWith('success:') ? <CheckCircleIcon /> : <ErrorIcon />}
            >
              {loginError.replace('success: ', '')}
              {loginError.includes('create one') && (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => setShowCreateAdmin(true)}
                  sx={{ ml: 1 }}
                >
                  Create Admin
                </Button>
              )}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Admin Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={!backendStatus?.connected || loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="admin@rudapaints.com"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={!backendStatus?.connected || loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={!backendStatus?.connected || loading}
              sx={{ 
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
                mb: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Login as Admin'
              )}
            </Button>

            <Button
              type="button"
              variant="outlined"
              color="secondary"
              fullWidth
              size="medium"
              onClick={() => setShowCreateAdmin(true)}
              disabled={loading}
              sx={{ 
                py: 1,
                fontWeight: 'medium',
              }}
            >
              Create First Admin Account
            </Button>
          </form>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              <strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1 }}>
              Ensure backend server is running on port 5000
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Create Admin Dialog */}
      <Dialog 
        open={showCreateAdmin} 
        onClose={() => !creatingAdmin && setShowCreateAdmin(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" component="div">
            Create First Admin Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Setup the first administrator account for Ruda Paints
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Stepper activeStep={createStep} sx={{ mb: 4, mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {createStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                This will create the first administrator account for the system. 
                You'll need this account to access the admin dashboard.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => setCreateStep(1)}
                sx={{ py: 1.5 }}
              >
                Continue to Setup
              </Button>
            </Box>
          )}

          {createStep === 1 && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {createErrors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {createErrors.general}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={createAdminData.name}
                onChange={handleCreateChange}
                error={!!createErrors.name}
                helperText={createErrors.name}
                disabled={creatingAdmin}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your full name"
              />
              
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={createAdminData.email}
                onChange={handleCreateChange}
                error={!!createErrors.email}
                helperText={createErrors.email}
                disabled={creatingAdmin}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="admin@rudapaints.com"
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showCreatePassword ? 'text' : 'password'}
                value={createAdminData.password}
                onChange={handleCreateChange}
                error={!!createErrors.password}
                helperText={createErrors.password}
                disabled={creatingAdmin}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        edge="end"
                        disabled={creatingAdmin}
                      >
                        {showCreatePassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Create a strong password"
              />
              
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={createAdminData.confirmPassword}
                onChange={handleCreateChange}
                error={!!createErrors.confirmPassword}
                helperText={createErrors.confirmPassword}
                disabled={creatingAdmin}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={creatingAdmin}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Confirm your password"
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This will create the first admin account. Make sure to save your credentials securely.
                </Typography>
              </Alert>
            </Box>
          )}

          {createStep === 2 && (
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <CardContent>
                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Admin Account Created Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You will be redirected to the admin dashboard in a moment.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Logged in as: <strong>{createAdminData.email}</strong>
                </Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {createStep === 1 && (
            <>
              <Button
                onClick={() => setShowCreateAdmin(false)}
                disabled={creatingAdmin}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateAdmin}
                disabled={creatingAdmin}
                startIcon={creatingAdmin ? <CircularProgress size={20} /> : null}
              >
                {creatingAdmin ? 'Creating...' : 'Create Admin Account'}
              </Button>
            </>
          )}
          {createStep === 0 && (
            <Button
              onClick={() => setShowCreateAdmin(false)}
              fullWidth
            >
              Cancel
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminLogin;