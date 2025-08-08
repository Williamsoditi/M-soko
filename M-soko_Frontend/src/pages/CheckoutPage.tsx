import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';

const CheckoutPage: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/orders/carts/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCart(response.data.results[0] || null);
    } catch (err) {
      setError('Failed to fetch cart data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, token]);

  const handleCheckout = async () => {
    if (!cart) return;
    try {
      await axios.post(
        'http://localhost:8000/api/checkout/',
        { cart_id: cart.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage('Checkout successful! Redirecting to your orders...');
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Checkout failed. Please try again.';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" textAlign="center">{error}</Typography>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Typography variant="h6" textAlign="center" mt={4}>
        Your cart is empty. Please add items before checking out.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Order Summary
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <List>
          {cart.items.map((item: any) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={`${item.product.name} x ${item.quantity}`}
                secondary={`Kshs. ${item.total_price.toFixed(2)}`}
              />
              <Typography variant="body1">Kshs. {(item.quantity * item.product.price).toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6">Kshs. {cart.total_price.toFixed(2)}</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleCheckout}
        >
          Place Order
        </Button>
      </Paper>
    </Box>
  );
};

export default CheckoutPage;