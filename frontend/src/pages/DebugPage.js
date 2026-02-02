import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { testConnection, healthCheck } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const DebugPage = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [details, setDetails] = useState(null);

  const testBackendConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    setDetails(null);
    
    try {
      const status = await testConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        // Test a specific endpoint
        try {
          const health = await healthCheck();
          setDetails(health.data);
        } catch (healthError) {
          console.log('Health check failed:', healthError);
        }
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🐛 Connection Debugger
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Debug backend connection issues
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Backend Connection Status
          </Typography>
          <Button
            variant="contained"
            onClick={testBackendConnection}
            disabled={testing}
            startIcon={testing ? <CircularProgress size={20} /> : <WifiIcon />}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </Box>

        {connectionStatus && (
          <Alert
            severity={connectionStatus.connected ? 'success' : 'error'}
            icon={connectionStatus.connected ? <CheckCircleIcon /> : <ErrorIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {connectionStatus.connected ? '✅ Backend Connected!' : '❌ Backend Connection Failed'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {connectionStatus.error || connectionStatus.message}
            </Typography>
            {connectionStatus.suggestion && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                💡 {connectionStatus.suggestion}
              </Typography>
            )}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Connection Details
        </Typography>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <List>
              <ListItem>
                <ListItemText
                  primary="Frontend URL"
                  secondary={window.location.origin}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Backend API URL"
                  secondary={process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Backend Server URL"
                  secondary="http://localhost:5000"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Environment"
                  secondary={process.env.NODE_ENV}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Troubleshooting Steps
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              1. Check if backend server is running
            </Typography>
            <Typography variant="body2">
              In your terminal, go to <code>backend</code> folder and run <code>npm start</code>
            </Typography>
          </Alert>

          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              2. Check CORS configuration
            </Typography>
            <Typography variant="body2">
              Open browser DevTools → Console and look for CORS errors
            </Typography>
          </Alert>

          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              3. Test backend directly
            </Typography>
            <Typography variant="body2">
              Open <a href="http://localhost:5000/api/health" target="_blank" rel="noreferrer">http://localhost:5000/api/health</a> in your browser
            </Typography>
          </Alert>

          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              4. Check network tab
            </Typography>
            <Typography variant="body2">
              In DevTools → Network tab, check if requests are being blocked
            </Typography>
          </Alert>
        </Box>
      </Paper>

      {details && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Backend Health Status
          </Typography>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </Paper>
      )}
    </Container>
  );
};

export default DebugPage;