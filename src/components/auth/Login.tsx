import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Link, Divider } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);

      // Get user data from localStorage after successful login
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        switch (user.role) {
          case 'JOB_SEEKER':
            navigate('/jobs');
            break;
          case 'RECRUITER':
            navigate('/employer/dashboard');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/jobs');
        }
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box textAlign="center" mb={4}>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a202c' }}>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Sign in to find your dream job
        </Typography>
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
          <Box textAlign="right">
            <Link component={RouterLink} to="/forgot-password" sx={{ fontSize: '0.9rem', color: 'error.main', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </Box>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          variant="outlined"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 1, py: 1.8, fontSize: '1.1rem' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <Button
          component={RouterLink}
          to="/forgot-password"
          fullWidth
          variant="text"
          sx={{ mb: 2, textTransform: 'none', fontSize: '0.95rem', color: 'text.secondary' }}
        >
          Forgot Password?
        </Button>

        {/* Quick Tip */}
        <Box className="tips-card" sx={{ mt: 3, p: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff6b6b', mb: 1 }}>
            💡 Career Tip:
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Update your profile regularly to increase your chances of being discovered by recruiters!
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Login;