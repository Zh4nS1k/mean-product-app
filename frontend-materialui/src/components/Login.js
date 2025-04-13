import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import API_BASE_URL from '../config';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (data.success) {
        login(data.token, username);
        navigate('/products');
      } else {
        setMessage(data.message || 'Authentication failed');
        setMessageType('error');
      }
    } catch (error) {
      setIsLoading(false);
      setMessage('Login failed. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: isMobile ? 3 : 5,
          width: '100%',
          borderRadius: 3,
          boxShadow: theme.shadows[10],
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            align="center"
            fontWeight={700}
            color="primary"
            sx={{ mb: 3 }}
          >
            Admin Login
          </Typography>

          {message && (
            <Alert
              severity={messageType === 'error' ? 'error' : 'success'}
              sx={{
                mb: 2,
                border: `1px solid ${theme.palette[messageType].light}`,
                bgcolor: theme.palette[messageType].lighter,
              }}
            >
              {message}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            InputProps={{
              style: { borderRadius: 8 },
            }}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              style: { borderRadius: 8 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 2,
              mb: 2,
              borderRadius: 20,
              py: 1.5,
              boxShadow: theme.shadows[4],
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
            }}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
