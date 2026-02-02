import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GridViewIcon from '@mui/icons-material/GridView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { priceListAPI, downloadFile } from '../services/api';

const PriceListPage = () => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchPriceList();
  }, []);

  const fetchPriceList = async () => {
    try {
      setLoading(true);
      const response = await priceListAPI.get();
      setPriceData(response.data);
    } catch (err) {
      setError('Failed to fetch price list. Please try again later.');
      console.error('Error fetching price list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      setDownloadLoading(true);
      const response = await priceListAPI.download(format);
      
      const filename = format === 'excel' 
        ? `ruda-paints-price-list-${new Date().toISOString().split('T')[0]}.xlsx`
        : `ruda-paints-price-list-${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadFile(response.data, filename);
    } catch (err) {
      setError('Failed to download price list. Please try again.');
      console.error('Error downloading price list:', err);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Price List
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Last updated: {new Date(priceData.lastUpdated).toLocaleDateString()} at{' '}
            {new Date(priceData.lastUpdated).toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            startIcon={<GridViewIcon />}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            startIcon={<PictureAsPdfIcon />}
          >
            Table View
          </Button>
          
          <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload('csv')}
              disabled={downloadLoading}
            >
              {downloadLoading ? 'Downloading...' : 'CSV'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload('excel')}
              disabled={downloadLoading}
            >
              {downloadLoading ? 'Downloading...' : 'Excel'}
            </Button>
          </Box>
        </Box>
      </Box>

      {viewMode === 'grid' ? (
        // Grid View
        Object.entries(priceData.paints).map(([category, categoryPaints]) => (
          <Box key={category} sx={{ mb: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ 
              mb: 3, 
              pb: 1, 
              borderBottom: '2px solid', 
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Chip 
                label={category} 
                color="primary" 
                size="small" 
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="h6" component="span" color="text.secondary">
                ({categoryPaints.length} products)
              </Typography>
            </Typography>
            
            <Grid container spacing={3}>
              {categoryPaints.map((paint) => (
                <Grid item xs={12} sm={6} md={4} key={paint._id}>
                  <Card sx={{ 
                    height: '100%', 
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {paint.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {paint.brand} • {paint.size}
                      </Typography>
                      <Typography variant="h5" color="primary" sx={{ 
                        fontWeight: 'bold',
                        mt: 2,
                        textAlign: 'right'
                      }}>
                        KES {paint.price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      ) : (
        // Table View
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Size</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'right' }}>Price (KES)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(priceData.paints).flatMap(([category, categoryPaints]) =>
                categoryPaints.map((paint) => (
                  <TableRow 
                    key={paint._id}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>{paint.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>{paint.brand}</TableCell>
                    <TableCell>{paint.size}</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'primary.main' }}>
                      {paint.price.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        bgcolor: 'primary.light', 
        borderRadius: 1,
        color: 'white'
      }}>
        <Typography variant="h6" gutterBottom>
          Price List Summary
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(priceData.paints).map(([category, categoryPaints]) => (
            <Grid item xs={6} sm={4} md={2} key={category}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {categoryPaints.length}
                </Typography>
                <Typography variant="body2">
                  {category} Paints
                </Typography>
              </Box>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ textAlign: 'right', opacity: 0.9 }}>
              Total Products: {Object.values(priceData.paints).flat().length}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PriceListPage;