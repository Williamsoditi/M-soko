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
} from '@mui/material';

const CheckoutPage: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/orders/carts/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      const cartData = response.data[0] || null;
      if (cartData) {
        setCart(cartData);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to fetch cart data.");
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
      
      // ✅ FIX: Show a native alert and then navigate immediately.
      // Removed setCart(null) to prevent the empty cart state from rendering.
      alert('Items added successfully!');
      navigate('/orders');

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Checkout failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleStartShopping = () => {
    navigate('/products');
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
      <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Your cart is empty.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Looks like you haven't added any items yet.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartShopping}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Order Summary
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
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