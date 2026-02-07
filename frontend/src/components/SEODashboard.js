// frontend/src/components/SEODashboard.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Article as ArticleIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Mock SEO analysis function
const analyzeSEO = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        score: Math.floor(Math.random() * 40) + 60,
        metrics: {
          pageSpeed: Math.floor(Math.random() * 40) + 60,
          mobileFriendly: Math.random() > 0.3,
          metaTags: Math.random() > 0.2,
          altText: Math.random() > 0.4,
          sitemap: true,
          robotsTxt: true,
          googleAnalytics: process.env.NODE_ENV === 'production',
          searchConsole: true,
          structuredData: true
        },
        pages: [
          { url: '/', visitors: 1500, status: 'Excellent' },
          { url: '/products', visitors: 1200, status: 'Good' },
          { url: '/price-list', visitors: 800, status: 'Good' },
          { url: '/contact', visitors: 500, status: 'Fair' },
          { url: '/admin', visitors: 100, status: 'Poor' }
        ],
        recommendations: [
          'Add more product descriptions',
          'Optimize image sizes',
          'Improve page load speed',
          'Add more internal links'
        ],
        lastUpdated: new Date().toISOString()
      };
      resolve(mockData);
    }, 1500);
  });
};

const SEODashboard = () => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('G-XXXXXXXXXX');
  
  const checkSEO = async () => {
    try {
      setLoading(true);
      const data = await analyzeSEO();
      setSeoData(data);
    } catch (error) {
      console.error('Error analyzing SEO:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { 
    checkSEO(); 
  }, []);
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    return 'error';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case true: return <CheckCircleIcon color="success" fontSize="small" />;
      case false: return <ErrorIcon color="error" fontSize="small" />;
      default: return <WarningIcon color="warning" fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Card sx={{ minWidth: 275, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Analyzing SEO...
            </Typography>
            <LinearProgress sx={{ flexGrow: 1 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* SEO Score Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  SEO Health Score
                </Typography>
                <IconButton onClick={checkSEO} size="small">
                  <RefreshIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Typography variant="h2" color={getScoreColor(seoData.score)}>
                      {seoData.score}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: -20, left: 0, right: 0, textAlign: 'center' }}>
                      /100
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" color={getScoreColor(seoData.score)}>
                    {getScoreText(seoData.score)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(seoData.lastUpdated).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={seoData.score} 
                color={getScoreColor(seoData.score)}
                sx={{ height: 10, borderRadius: 5, mb: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Google Analytics Status */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Google Analytics
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<CheckCircleIcon />}
                  label="Connected"
                  color="success"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ID: {googleAnalyticsId}
                </Typography>
              </Box>
              
              <Button 
                variant="outlined" 
                size="small"
                href="https://analytics.google.com/"
                target="_blank"
                sx={{ mr: 1 }}
              >
                Open Analytics
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                href="https://search.google.com/search-console"
                target="_blank"
              >
                Search Console
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* SEO Metrics */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                SEO Metrics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <SpeedIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="body2">Page Speed</Typography>
                    <Typography variant="h6">{seoData.metrics.pageSpeed}/100</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <VisibilityIcon color={seoData.metrics.mobileFriendly ? "success" : "error"} sx={{ mb: 1 }} />
                    <Typography variant="body2">Mobile Friendly</Typography>
                    <Typography variant="body1">
                      {seoData.metrics.mobileFriendly ? 'Yes' : 'No'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <ArticleIcon color={seoData.metrics.metaTags ? "success" : "error"} sx={{ mb: 1 }} />
                    <Typography variant="body2">Meta Tags</Typography>
                    <Typography variant="body1">
                      {seoData.metrics.metaTags ? 'Complete' : 'Incomplete'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <LinkIcon color={seoData.metrics.sitemap ? "success" : "error"} sx={{ mb: 1 }} />
                    <Typography variant="body2">Sitemap</Typography>
                    <Typography variant="body1">
                      {seoData.metrics.sitemap ? 'Active' : 'Missing'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Page Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Page Performance
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Page</TableCell>
                      <TableCell align="right">Visitors</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seoData.pages.map((page) => (
                      <TableRow key={page.url}>
                        <TableCell>
                          <Typography variant="body2">{page.url}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{page.visitors.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={page.status}
                            size="small"
                            color={page.status === 'Excellent' ? 'success' : 
                                   page.status === 'Good' ? 'primary' : 
                                   page.status === 'Fair' ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              
              <Box>
                {seoData.recommendations.map((rec, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SearchIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">{rec}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
              
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Google Search Console:</strong> Verified ✓
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Sitemap:</strong> https://rudapaints.com/sitemap.xml
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Robots.txt:</strong> https://rudapaints.com/robots.txt
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SEODashboard;