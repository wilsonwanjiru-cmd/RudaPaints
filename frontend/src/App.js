import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import PriceListPage from './pages/PriceListPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/AdminLogin';
import AdminProductsPage from './pages/AdminProductsPage';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

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
  };

  const PrivateRoute = ({ children }) => {
    if (loading) {
      return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div>Loading...</div>
        </Container>
      );
    }
    return isAdmin ? children : <Navigate to="/admin" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Don't show navigation on admin login page */}
          {!window.location.pathname.startsWith('/admin') && <Navigation />}
          
          <Container 
            component="main" 
            maxWidth="xl" 
            sx={{ 
              flexGrow: 1, 
              py: 4,
              px: { xs: 2, sm: 3, md: 4 }
            }}
          >
            <Routes>
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
              
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
          
          {/* Don't show footer on admin pages */}
          {!window.location.pathname.startsWith('/admin') && <Footer />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;