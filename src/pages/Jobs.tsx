import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import JobList from '../components/jobs/JobList';

const Jobs: React.FC = () => {
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
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'white', 
              textAlign: 'center',
              mb: 2
            }}
          >
            Find Your Perfect Job
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            Discover opportunities that match your skills and aspirations
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <JobList />
      </Container>
    </Box>
  );
};

export default Jobs;