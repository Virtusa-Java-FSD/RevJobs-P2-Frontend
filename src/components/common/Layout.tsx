import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Avatar, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Work, AccountCircle, Dashboard, Message, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBadge from '../ui/NotificationBadge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  // Check for mobile device - md is 900px, so anything smaller triggers mobile view
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setAnchorEl(null);
    setMobileMenuOpen(false); // Close mobile menu on logout
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navButtonStyle = {
    transition: 'all 0.3s ease',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    '&:hover': {
      bgcolor: 'rgba(59, 130, 246, 0.1) !important',
      color: 'var(--primary-color) !important',
      transform: 'translateY(-2px)',
    }
  };

  // Common navigation items for reuse logic could go here, but for now we separate for styling differences

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" elevation={0} className="theme-nav" sx={{ zIndex: 1100 }}>
        <Toolbar>
          <Work sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 700 }}
            onClick={() => navigate('/')}>
            RevJobs
          </Typography>

          {/* Mobile Menu Icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileMenuToggle}
            sx={{ display: { md: 'none' } }} // Show only on small screens
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <Button color="inherit" onClick={() => navigate('/')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Home</Button>
            <Button color="inherit" onClick={() => navigate('/jobs')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/jobs') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Jobs</Button>
            <Button color="inherit" onClick={() => navigate('/companies')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/companies') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Companies</Button>
            <Button color="inherit" onClick={() => navigate('/services')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/services') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Services</Button>
            <Button color="inherit" onClick={() => navigate('/careers')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/careers') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Careers</Button>
            <Button color="inherit" onClick={() => navigate('/blog')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/blog') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Blog</Button>
            {user ? (
              <>
                {user.role === 'JOB_SEEKER' && (
                  <>
                    <Button color="inherit" onClick={() => navigate('/applications')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Applications</Button>
                    <Button color="inherit" onClick={() => navigate('/saved-jobs')} size="small" sx={{ ...navButtonStyle, bgcolor: isActive('/saved-jobs') ? 'rgba(255,255,255,0.2)' : 'transparent', minWidth: 'auto', px: 1.5 }}>Saved Jobs</Button>
                    <Button color="inherit" onClick={() => navigate('/profile')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Profile</Button>
                  </>
                )}
                {user.role === 'RECRUITER' && (
                  <>
                    <Button color="inherit" onClick={() => navigate('/employer/dashboard')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate('/recruiter/dashboard')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Recruiter</Button>
                    <Button color="inherit" onClick={() => navigate('/jobs/create')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Post Job</Button>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <Button color="inherit" onClick={() => navigate('/admin/dashboard')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Admin</Button>
                )}
                <Button color="inherit" onClick={() => navigate('/messages')} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Messages</Button>
                <NotificationBadge />
                <Button color="inherit" onClick={handleLogout} size="small" sx={{ ...navButtonStyle, minWidth: 'auto', px: 1.5 }}>Logout</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/login')}
                  size="small"
                  sx={{
                    ...navButtonStyle,
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'rgba(59, 130, 246, 0.1) !important',
                      borderColor: 'primary.main !important',
                      color: '#000000 !important'
                    }
                  }}
                >
                  Join Now
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: { width: '250px' }
        }}
      >
        <Box
          role="presentation"
          sx={{ width: 250 }}
        >
          <List>
            {/* Public Links */}
            <ListItem button onClick={() => handleMobileNavigation('/')}>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => handleMobileNavigation('/jobs')}>
              <ListItemText primary="Jobs" />
            </ListItem>
            <ListItem button onClick={() => handleMobileNavigation('/companies')}>
              <ListItemText primary="Companies" />
            </ListItem>
            <ListItem button onClick={() => handleMobileNavigation('/services')}>
              <ListItemText primary="Services" />
            </ListItem>
            {/* User Specific Links */}
            {user ? (
              <>
                <Box sx={{ my: 1, borderTop: '1px solid #eee' }} />
                {user.role === 'JOB_SEEKER' && (
                  <>
                    <ListItem button onClick={() => handleMobileNavigation('/applications')}>
                      <ListItemText primary="Applications" />
                    </ListItem>
                    <ListItem button onClick={() => handleMobileNavigation('/saved-jobs')}>
                      <ListItemText primary="Saved Jobs" />
                    </ListItem>
                    <ListItem button onClick={() => handleMobileNavigation('/profile')}>
                      <ListItemText primary="Profile" />
                    </ListItem>
                  </>
                )}
                {user.role === 'RECRUITER' && (
                  <>
                    <ListItem button onClick={() => handleMobileNavigation('/employer/dashboard')}>
                      <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button onClick={() => handleMobileNavigation('/recruiter/dashboard')}>
                      <ListItemText primary="Recruiter Area" />
                    </ListItem>
                    <ListItem button onClick={() => handleMobileNavigation('/jobs/create')}>
                      <ListItemText primary="Post Job" />
                    </ListItem>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <ListItem button onClick={() => handleMobileNavigation('/admin/dashboard')}>
                    <ListItemText primary="Admin Dashboard" />
                  </ListItem>
                )}
                <ListItem button onClick={() => handleMobileNavigation('/messages')}>
                  <ListItemText primary="Messages" />
                </ListItem>
                <Box sx={{ my: 1, borderTop: '1px solid #eee' }} />
                <ListItem button onClick={handleLogout}>
                  <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                </ListItem>
              </>
            ) : (
              <>
                <Box sx={{ my: 1, borderTop: '1px solid #eee' }} />
                <ListItem button onClick={() => handleMobileNavigation('/login')}>
                  <ListItemText primary="Join Now" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ minHeight: '100vh', paddingTop: '80px', position: 'relative', zIndex: 1, overflowX: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;