import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, Link, Divider } from '@mui/material';
import { LockReset, Security } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      setStep('otp');
      setMessage('OTP has been sent to your email address.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (!response.ok) {
        throw new Error('Invalid or expired OTP');
      }

      setStep('reset');
      setMessage('OTP verified. Please set your new password.');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };



  const renderEmailStep = () => (
    <>
      <Box textAlign="center" mb={4}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <LockReset sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a202c' }}>
          Reset Password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Enter your email address and we'll send you an OTP to reset your password
        </Typography>
      </Box>

      <form onSubmit={handleEmailSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          variant="outlined"
          placeholder="Enter your email address"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            mb: 2,
            py: 1.8,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #44a08d 0%, #396f6b 100%)',
              boxShadow: '0 6px 20px rgba(78, 205, 196, 0.6)',
              transform: 'translateY(-2px)'
            }
          }}
          disabled={loading}
        >
          {loading ? '⏳ Sending OTP...' : '📧 Send OTP'}
        </Button>
      </form>
    </>
  );

  const renderOtpStep = () => (
    <>
      <Box textAlign="center" mb={4}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Security sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a202c' }}>
          Enter OTP
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          We've sent a 6-digit OTP to <strong>{email}</strong>
        </Typography>
      </Box>

      <form onSubmit={handleOtpSubmit}>
        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          margin="normal"
          required
          variant="outlined"
          placeholder="Enter 6-digit OTP"
          inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            mb: 2,
            py: 1.8,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #44a08d 0%, #396f6b 100%)',
              boxShadow: '0 6px 20px rgba(78, 205, 196, 0.6)',
              transform: 'translateY(-2px)'
            }
          }}
          disabled={loading}
        >
          {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
        </Button>
      </form>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Didn't receive OTP?{' '}
          <Link
            component="button"
            onClick={() => {
              setStep('email');
              setOtp('');
              setMessage('');
            }}
            sx={{ fontWeight: 600 }}
          >
            Resend OTP
          </Link>
        </Typography>
      </Box>
    </>
  );

  const renderResetStep = () => (
    <>
      <Box textAlign="center" mb={4}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <LockReset sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a202c' }}>
          Set New Password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Create a strong password for your account
        </Typography>
      </Box>

      <form onSubmit={handlePasswordReset}>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          required
          variant="outlined"
          placeholder="Enter new password"
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          variant="outlined"
          placeholder="Confirm new password"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            mb: 2,
            py: 1.8,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #44a08d 0%, #396f6b 100%)',
              boxShadow: '0 6px 20px rgba(78, 205, 196, 0.6)',
              transform: 'translateY(-2px)'
            }
          }}
          disabled={loading}
        >
          {loading ? '⏳ Resetting Password...' : '🔒 Reset Password'}
        </Button>
      </form>
    </>
  );

  return (
    <Box
      className="auth-page"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        padding: { xs: 2, sm: 4 }
      }}
    >
      <Paper
        className="auth-container"
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 500,
          width: '100%'
        }}
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'reset' && renderResetStep()}

        <Divider sx={{ my: 2 }} />

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
              Back to Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;