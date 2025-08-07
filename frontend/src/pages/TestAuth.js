import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  TextField
} from '@mui/material';

const TestAuth = () => {
  const { login, register, user, isAuthenticated, error } = useAuth();
  const [testEmail, setTestEmail] = useState('admin@eventmate.com');
  const [testPassword, setTestPassword] = useState('admin123');

  const handleTestLogin = async () => {
    try {
      const result = await login({
        email: testEmail,
        password: testPassword
      });
      console.log('Login result:', result);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleTestRegister = async () => {
    try {
      const result = await register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!'
      });
      console.log('Register result:', result);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Authentication Test
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          <Typography>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Typography>
          {user && (
            <Typography>User: {user.name} ({user.email}) - Role: {user.role}</Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Login
          </Typography>
          <TextField
            fullWidth
            label="Email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleTestLogin}>
            Test Login
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Register
          </Typography>
          <Button variant="contained" onClick={handleTestRegister}>
            Test Register
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default TestAuth;
