import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import BrushIcon from '@mui/icons-material/Brush';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { 
      name: 'Home', 
      path: '/',
      icon: <HomeIcon />
    },
    { 
      name: 'Products', 
      path: '/products',
      icon: <StoreIcon />
    },
    { 
      name: 'Price List', 
      path: '/price-list',
      icon: <PriceCheckIcon />
    },
    { 
      name: 'Contact', 
      path: '/contact',
      icon: <ContactPhoneIcon />
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const whatsappClick = () => {
    window.open(`https://wa.me/254703538670?text=Hello%20Ruda%20Paints%20Enterprise,%20I%20would%20like%20to%20inquire%20about%20your%20products`, '_blank');
  };

  const drawer = (
    <Box sx={{ 
      width: 250, 
      backgroundColor: theme.palette.primary.main,
      height: '100%',
      color: 'white'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BrushIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Ruda Paints
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.name}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              py: 2,
              borderLeft: location.pathname === item.path ? '4px solid white' : 'none',
              backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        ))}
        <ListItem 
          button 
          onClick={whatsappClick}
          sx={{
            py: 2,
            mt: 2,
            backgroundColor: '#25D366',
            '&:hover': {
              backgroundColor: '#128C7E',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <WhatsAppIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Chat on WhatsApp"
            primaryTypographyProps={{ fontWeight: 'bold' }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={3}
      sx={{ 
        backgroundColor: 'white',
        color: 'primary.main',
        borderBottom: '2px solid',
        borderColor: 'primary.main'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile Menu Button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: 'primary.main'
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexGrow: { xs: 1, md: 0 },
            mr: { md: 4 }
          }}>
            <BrushIcon sx={{ 
              mr: 1, 
              fontSize: 32,
              color: 'primary.main'
            }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 800,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                letterSpacing: '-0.5px',
                '&:hover': {
                  color: 'primary.dark',
                }
              }}
            >
              RUDA PAINTS
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1,
            gap: 1
          }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  mx: 0.5,
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  borderBottom: location.pathname === item.path ? '3px solid' : 'none',
                  borderColor: 'primary.main',
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                  }
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* WhatsApp Button - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={whatsappClick}
              sx={{
                backgroundColor: '#25D366',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                '&:hover': {
                  backgroundColor: '#128C7E',
                }
              }}
            >
              WhatsApp Order
            </Button>
          </Box>

          {/* WhatsApp Badge - Mobile */}
          <IconButton
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              backgroundColor: '#25D366',
              color: 'white',
              '&:hover': {
                backgroundColor: '#128C7E',
              }
            }}
            onClick={whatsappClick}
          >
            <Badge 
              color="error" 
              variant="dot"
              invisible={false}
            >
              <WhatsAppIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navigation;