// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, LinearProgress, Alert, Typography, Button } from '@mui/material';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import PriceListPage from './pages/PriceListPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/AdminLogin';
import AdminProductsPage from './pages/AdminProductsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    info: {
      main: '#2196f3',
      light: '#6ec6ff',
      dark: '#0069c0',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9e9e9e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
      '@media (min-width:900px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      '@media (min-width:600px)': {
        fontSize: '2.25rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2.5rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.07)',
    '0px 6px 12px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.09)',
    '0px 10px 20px rgba(0,0,0,0.10)',
    '0px 12px 24px rgba(0,0,0,0.12)',
    '0px 14px 28px rgba(0,0,0,0.14)',
    '0px 16px 32px rgba(0,0,0,0.16)',
    '0px 18px 36px rgba(0,0,0,0.18)',
    '0px 20px 40px rgba(0,0,0,0.20)',
    '0px 22px 44px rgba(0,0,0,0.22)',
    '0px 24px 48px rgba(0,0,0,0.24)',
    '0px 26px 52px rgba(0,0,0,0.26)',
    '0px 28px 56px rgba(0,0,0,0.28)',
    '0px 30px 60px rgba(0,0,0,0.30)',
    '0px 32px 64px rgba(0,0,0,0.32)',
    '0px 34px 68px rgba(0,0,0,0.34)',
    '0px 36px 72px rgba(0,0,0,0.36)',
    '0px 38px 76px rgba(0,0,0,0.38)',
    '0px 40px 80px rgba(0,0,0,0.40)',
    '0px 42px 84px rgba(0,0,0,0.42)',
    '0px 44px 88px rgba(0,0,0,0.44)',
    '0px 46px 92px rgba(0,0,0,0.46)',
    '0px 48px 96px rgba(0,0,0,0.48)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
            boxShadow: 6,
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #dc004e 0%, #ff4081 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9a0036 0%, #dc004e 100%)',
            boxShadow: 6,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          '@media (min-width:600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center', p: 4 }}>
      <LinearProgress 
        sx={{ 
          height: 6, 
          borderRadius: 3,
          mb: 3,
          bgcolor: 'primary.light',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'primary.main',
          }
        }} 
      />
      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
        Ruda Paints Kenya
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Loading premium paint solutions...
      </Typography>
    </Box>
  </Box>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          py: 8,
          textAlign: 'center',
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: 600, 
              mb: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              We apologize for the inconvenience. Please try refreshing the page or contact support.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Layout wrapper component to conditionally show Navigation and Footer
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Don't show navigation on admin routes */}
      {!isAdminRoute && <Navigation />}
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      
      {/* Don't show footer on admin routes */}
      {!isAdminRoute && <Footer />}
    </Box>
  );
};

// 404 Page component
const NotFoundPage = () => (
  <Container sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '70vh',
    textAlign: 'center',
    py: 8,
  }}>
    <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 800, color: 'primary.light', mb: 2 }}>
      404
    </Typography>
    <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
      Page Not Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
      The page you are looking for doesn't exist or has been moved.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      href="/"
      size="large"
    >
      Back to Home
    </Button>
  </Container>
);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminStatus = localStorage.getItem('rudapaints_admin');
    setIsAdmin(!!adminStatus);
    setLoading(false);
  }, []);

  const handleAdminLogin = (status) => {
    setIsAdmin(status);
    if (status) {
      localStorage.setItem('rudapaints_admin', 'true');
    } else {
      localStorage.removeItem('rudapaints_admin');
    }
  };

  const PrivateRoute = ({ children }) => {
    if (loading) {
      return <LoadingFallback />;
    }
    return isAdmin ? children : <Navigate to="/admin" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <LayoutWrapper>
            <Container 
              maxWidth="xl" 
              sx={{ 
                py: { xs: 3, sm: 4, md: 5 },
                px: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/price-list" element={<PriceListPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    isAdmin ? (
                      <Navigate to="/admin/products" />
                    ) : (
                      <AdminLogin onLogin={handleAdminLogin} />
                    )
                  } 
                />
                <Route 
                  path="/admin/products" 
                  element={
                    <PrivateRoute>
                      <AdminProductsPage />
                    </PrivateRoute>
                  } 
                />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Container>
            
            {/* Scroll to Top Button */}
            <Box
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000,
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{
                  borderRadius: '50%',
                  minWidth: 48,
                  minHeight: 48,
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
                aria-label="Scroll to top"
              >
                ↑
              </Button>
            </Box>
          </LayoutWrapper>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;