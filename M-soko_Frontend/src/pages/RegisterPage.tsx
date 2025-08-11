import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

const RegistrationPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError("Passwords don't match.");
      return;
    }

    try {
      // Send registration data to the Django backend
      const response = await axios.post('http://localhost:8000/api/register/', { username, email, password, password2 });
      
      // On successful registration, log the user in automatically with the token from the backend
      login(response.data.token, { username: response.data.username, email: response.data.email });
      
      navigate('/'); // Redirect to the home page
    } catch (err) {
      setError('Registration failed. Please check your details and try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'grey.100',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 450,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}
        >
          Create an Account
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          Join us and start shopping!
        </Typography>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </form>
        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Typography component="span" color="primary" sx={{ fontWeight: 'bold' }}>
              Log In
            </Typography>
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegistrationPage;