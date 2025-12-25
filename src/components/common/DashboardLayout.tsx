import React from 'react';
import { Box, Container, Typography } from '@mui/material';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle, icon, children }) => {
  return (
    <Box className="theme-section animate-fade-in">
      <Container maxWidth="xl">
        <Box className="animate-slide-up" sx={{ mb: 4 }}>
          <Typography variant="h3" className="theme-text-gradient" sx={{ fontWeight: 700, mb: 1 }}>
            {icon} {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box className="animate-scale-in animate-delay-1">
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardLayout;
