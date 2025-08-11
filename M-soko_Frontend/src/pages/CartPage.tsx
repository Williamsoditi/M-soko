import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Assuming these interfaces match your backend data structure
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_price: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  total_price: number;
}

const CartPage = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isAuthenticated || !token) {
      setLoading(false);
      setError("Please log in to view your cart.");
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/orders/carts/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      if (response.data && response.data.length > 0) {
        setCart(response.data[0]);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart data. Please try logging in again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveItem = async (itemId: number) => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/api/orders/cart-items/${itemId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      // Refetch cart to update the UI
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // If quantity is reduced to 0, call the remove function
      handleRemoveItem(itemId);
      return;
    }

    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    try {
      await axios.patch(`http://localhost:8000/api/orders/cart-items/${itemId}/`, {
        quantity: newQuantity,
      }, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleCheckout = async () => {
        if (!isAuthenticated || !token) {
            alert('Please log in to complete your order.');
            navigate('/login');
            return;
        }

        try {
            await axios.post(
                'http://localhost:8000/api/checkout/',
                {}, // The body can be empty as the backend uses the authenticated user's cart
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            alert('Checkout successful! Your order has been placed.');
            navigate('/order-history'); // Redirect to the order history page

        } catch (err) {
            console.error('Checkout failed:', err);
            let errorMessage = 'Failed to place your order. Please try again.';
            if (axios.isAxiosError(err) && err.response && err.response.data.detail) {
                errorMessage = err.response.data.detail;
            }
            alert(errorMessage);
        }
    };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Button onClick={() => navigate('/login')} sx={{ mt: 2 }} variant="contained">
          Log In
        </Button>
      </Container>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center', p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Your shopping cart is currently empty. 🛒
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No worries! If you've just placed an order, your items are now safe in your{' '}
          <Button 
            onClick={() => navigate('/orders')} 
            variant="text" 
            sx={{ textTransform: 'none', px: 0, py: 0, minWidth: 0 }}
          >
            orders
          </Button>
          . Otherwise, it's a great time to find some new favorites!
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }} variant="contained" color="primary" size="large">
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
        Your Shopping Cart
      </Typography>
      <Grid container spacing={3}>
        {cart.items.map((item) => (
          <Grid item xs={12} key={item.id}>
            <Card 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                boxShadow: 3, 
                borderRadius: 2, 
                p: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <CardMedia
                component="img"
                sx={{ 
                  width: { xs: '100%', sm: 120 },
                  height: { xs: 150, sm: 120 },
                  objectFit: 'contain', 
                  borderRadius: 1,
                  flexShrink: 0,
                  mb: { xs: 2, sm: 0 },
                  mr: { xs: 0, sm: 2 },
                }}
                image={item.product.image_url || 'https://placehold.co/120x120/CCCCCC/000000?text=No+Image'}
                alt={item.product.name}
              />
              <CardContent sx={{ flexGrow: 1, p: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                  {item.product.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Unit Price: Kshs {parseFloat(String(item.product.price)).toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body1">Quantity:</Typography>
                  <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body1" sx={{ mx: 1 }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Item Total: Kshs {item.total_price.toFixed(2)}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                <IconButton color="error" aria-label="delete item" onClick={() => handleRemoveItem(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 4, textAlign: 'right' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Cart Total: Kshs {cart.total_price.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2, px: 5, py: 1.5, borderRadius: 2, boxShadow: 3 }}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Container>
  );
};

export default CartPage;