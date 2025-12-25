import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'JOB_SEEKER',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Prevent admin registration for other emails
    if (formData.role === 'ADMIN' && formData.email !== 'sravanikelam27@gmail.com') {
      setError('Admin registration is restricted to authorized personnel only.');
      setLoading(false);
      return;
    }

    try {
      await register(formData);

      // Store user profile data immediately after registration
      const userProfile = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        companyName: formData.companyName || '',
        location: '',
        skills: [],
        experience: [],
        resumeUrl: ''
      };
      localStorage.setItem(`userProfile_${formData.email}`, JSON.stringify(userProfile));

      setSuccess('Registration successful! You can now login with your credentials.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      let errorMessage = err.message || 'Registration failed. Please try again.';

      // Parse backend validation errors to show user-friendly message
      if (errorMessage.includes('Validation failed') && errorMessage.includes('default message [')) {
        const matches = errorMessage.match(/default message \[(.*?)\]/g);
        if (matches && matches.length > 0) {
          // Get the last match which usually contains the text message
          const lastMatch = matches[matches.length - 1];
          // Extract text between "default message [" and "]"
          errorMessage = lastMatch.replace('default message [', '').slice(0, -1);
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box textAlign="center" mb={4}>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a202c' }}>
          Join RevJobs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Create your account and start your career journey
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
          >
            <MenuItem value="JOB_SEEKER">Job Seeker</MenuItem>
            <MenuItem value="RECRUITER">Employer</MenuItem>
            {formData.email === 'sravanikelam27@gmail.com' && (
              <MenuItem value="ADMIN">🛡️ Admin</MenuItem>
            )}
          </Select>
        </FormControl>
        {formData.role === 'RECRUITER' && (
          <TextField
            fullWidth
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            margin="normal"
            required
          />
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2, py: 1.8, fontSize: '1.1rem' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Benefits Badge */}
        <Box className="badge-container" sx={{ justifyContent: 'center', mt: 2 }}>
          <Box className="achievement-badge" sx={{ fontSize: '0.85rem', py: 0.5, px: 2 }}>
            🎓 Free Profile
          </Box>
          <Box className="achievement-badge" sx={{ fontSize: '0.85rem', py: 0.5, px: 2 }}>
            💼 1000+ Jobs
          </Box>
          <Box className="achievement-badge" sx={{ fontSize: '0.85rem', py: 0.5, px: 2 }}>
            ⚡ Instant Apply
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default Register;