import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Divider } from '@mui/material';
import { Work, Business, TrendingUp, Search, CheckCircle, Speed, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  lineHeight: 1.3,
                  mb: 2,
                  color: 'white'
                }}
              >
                Advance Your Professional Career
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  maxWidth: '80%',
                  color: '#cbd5e1'
                }}
              >
                Connect with leading employers and discover opportunities that match your expertise.
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap" sx={{ mt: 1 }}>
                {!user ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': { 
                          bgcolor: '#2563eb',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(59,130,246,0.3)'
                        },
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/jobs')}
                      sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': { 
                          bgcolor: '#2563eb',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(59,130,246,0.3)'
                        },
                      }}
                    >
                      Browse Jobs
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/jobs')}
                    sx={{
                      bgcolor: '#3b82f6',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { 
                        bgcolor: '#2563eb',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(59,130,246,0.3)'
                      },
                    }}
                  >
                    Browse Jobs
                  </Button>
                )}
              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6, bgcolor: '#ffffff', borderRadius: '16px', mt: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Why Professionals Choose RevJobs
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Advanced tools and personalized support to accelerate your career growth
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              p: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                borderColor: '#3b82f6'
              },
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#dbeafe',
                  mb: 3,
                }}>
                  <Search sx={{ fontSize: 32, color: '#3b82f6' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Smart Matching
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  AI-powered job recommendations based on your skills, experience, and career preferences.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              p: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                borderColor: '#10b981'
              },
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#d1fae5',
                  mb: 3,
                }}>
                  <Speed sx={{ fontSize: 32, color: '#10b981' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Quick Apply
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Streamlined application process with one-click apply and real-time status tracking.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              p: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                borderColor: '#8b5cf6'
              },
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#ede9fe',
                  mb: 3,
                }}>
                  <Security sx={{ fontSize: 32, color: '#8b5cf6' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Trusted Network
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Connect directly with verified recruiters from top-tier companies and startups.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: '#f1f5f9', py: 6, mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                10K+
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                Active Jobs
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                5K+
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                Partner Companies
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
                50K+
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                Professionals Hired
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444', mb: 1 }}>
                95%
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                Success Rate
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Success Stories */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Success Stories
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Real professionals, real career transformations
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: 4, 
              height: '100%',
              border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
            }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: '#3b82f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    mr: 2
                  }}
                >
                  JS
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    John Smith
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Senior Software Engineer
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#475569' }}>
                "RevJobs connected me with my dream role at a Fortune 500 company. The process was seamless and professional."
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: 4, 
              height: '100%',
              border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
            }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: '#10b981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    mr: 2
                  }}
                >
                  SJ
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sarah Johnson
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Product Manager
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#475569' }}>
                "The platform's career guidance and networking opportunities helped me secure a 40% salary increase."
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: 4, 
              height: '100%',
              border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
            }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: '#8b5cf6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    mr: 2
                  }}
                >
                  MC
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Mike Chen
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data Analyst
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#475569' }}>
                "As a recent graduate, RevJobs gave me the confidence and connections to launch my tech career."
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#ffffff', py: 6, mt: 4 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
              Ready to Advance Your Career?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Join thousands of professionals who have transformed their careers through our platform
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(user ? '/jobs' : '/register')}
              sx={{
                bgcolor: '#3b82f6',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '12px',
                '&:hover': { 
                  bgcolor: '#2563eb',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(59,130,246,0.4)'
                },
              }}
            >
              {user ? 'Explore Opportunities' : 'Start Your Journey'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;