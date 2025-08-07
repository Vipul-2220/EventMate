import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  ButtonGroup
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // default to 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  useEffect(() => {
    // Clear any previous errors
    clearError();
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/events');
    }
  }, [isAuthenticated, navigate, clearError]);

  useEffect(() => {
    // Check password strength
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    // Validate password strength
    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
    if (!isPasswordStrong) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      if (result.success) {
        navigate('/events');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            Create Account
          </Typography>
          
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Join EventMate and start discovering amazing events
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error === 'User already exists' ? 'An account with this email already exists.' : error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />

            {/* Password strength indicator */}
            {formData.password && (
              <Box sx={{ mb: 2, ml: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Password requirements:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {passwordStrength.length ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                      <Typography variant="caption" color={passwordStrength.length ? 'success.main' : 'error.main'}>
                        At least 6 characters
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {passwordStrength.uppercase ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                      <Typography variant="caption" color={passwordStrength.uppercase ? 'success.main' : 'error.main'}>
                        One uppercase letter
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {passwordStrength.lowercase ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                      <Typography variant="caption" color={passwordStrength.lowercase ? 'success.main' : 'error.main'}>
                        One lowercase letter
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {passwordStrength.number ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                      <Typography variant="caption" color={passwordStrength.number ? 'success.main' : 'error.main'}>
                        One number
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formData.confirmPassword !== '' && !passwordsMatch}
              helperText={formData.confirmPassword !== '' && !passwordsMatch ? 'Passwords do not match' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Role selection as tab buttons (moved after password confirmation) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ButtonGroup variant="contained" sx={{ boxShadow: 'none' }}>
                <Button
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  sx={{
                    bgcolor: formData.role === 'user' ? 'primary.main' : 'grey.300',
                    color: formData.role === 'user' ? 'common.white' : 'grey.800',
                    '&:hover': {
                      bgcolor: formData.role === 'user' ? 'primary.dark' : 'grey.400',
                      color: formData.role === 'user' ? 'common.white' : 'grey.900',
                    },
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Audience
                </Button>
                <Button
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  sx={{
                    bgcolor: formData.role === 'admin' ? 'primary.main' : 'grey.300',
                    color: formData.role === 'admin' ? 'common.white' : 'grey.800',
                    '&:hover': {
                      bgcolor: formData.role === 'admin' ? 'primary.dark' : 'grey.400',
                      color: formData.role === 'admin' ? 'common.white' : 'grey.900',
                    },
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Organiser
                </Button>
              </ButtonGroup>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !isPasswordStrong || !passwordsMatch}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
