import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { servicesData } from '../data/servicesData';

const Services: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Professional Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          py: 4,
          mb: 4
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2
            }}
          >
            Our Services
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400
            }}
          >
            Comprehensive career solutions designed to help you succeed in your professional journey
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ px: 3 }}>
        {servicesData.map((service, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{
              height: '100%',
              backgroundColor: '#ffffff',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6
              }
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{
                  color: '#1976d2',
                  mb: 3
                }}>
                  {service.icon}
                </Box>

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
                  {service.title}
                </Typography>

                <Typography variant="body1" sx={{ color: '#757575' }} paragraph>
                  {service.description}
                </Typography>

                <Box sx={{ textAlign: 'left', mb: 3 }}>
                  {service.features.map((feature, idx) => (
                    <Typography key={idx} variant="body2" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      color: '#212121',
                      '&:before': {
                        content: '"✓"',
                        color: '#4caf50',
                        fontWeight: 'bold',
                        mr: 1
                      }
                    }}>
                      {feature}
                    </Typography>
                  ))}
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Box sx={{ py: 6, mt: 6, textAlign: 'center', backgroundColor: '#ffffff' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
          Ready to Get Started?
        </Typography>
        <Typography variant="h6" sx={{ color: '#757575' }} paragraph>
          Join thousands of professionals who have transformed their careers with RevJobs
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 2, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#1e40af' } }}
        >
          Start Your Journey
        </Button>
      </Box>
    </Box>
  );
};

export default Services;