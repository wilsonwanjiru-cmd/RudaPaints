// frontend/src/components/SEODashboard.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box
} from '@mui/material';

// Mock SEO calculation function (replace with your actual implementation)
const calculateSEOScore = async () => {
  // Simulate API call or SEO analysis
  // For now, returning a mock score
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock calculation - replace with actual SEO checking logic
      // Check page speed, meta tags, alt text, etc.
      const mockScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      resolve(mockScore);
    }, 1000);
  });
};

const SEODashboard = () => {
  const [seoScore, setSeoScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const checkSEO = async () => {
    try {
      setLoading(true);
      const score = await calculateSEOScore();
      setSeoScore(score);
    } catch (error) {
      console.error('Error calculating SEO score:', error);
      setSeoScore(0);
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

  return (
    <Card sx={{ minWidth: 275, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          SEO Health Score
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Analyzing SEO...
            </Typography>
            <LinearProgress sx={{ flexGrow: 1 }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                {seoScore}/100
              </Typography>
              <Typography 
                variant="body1" 
                color={getScoreColor(seoScore)}
                sx={{ fontWeight: 'bold' }}
              >
                {getScoreText(seoScore)}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={seoScore} 
              color={getScoreColor(seoScore)}
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary">
              {seoScore >= 80 
                ? 'Your website SEO is in excellent condition!'
                : seoScore >= 60
                ? 'Your SEO is good but could use some improvements.'
                : 'Your website needs SEO optimization. Consider checking meta tags, page speed, and content quality.'
              }
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SEODashboard;