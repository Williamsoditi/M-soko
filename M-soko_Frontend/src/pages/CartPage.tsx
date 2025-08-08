import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

const CartPage: React.FC = () => {
  const { isAuthenticated, token, user } = useAuth();
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
      const response = await axios.get('http://localhost:8000/api/orders/carts/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      // 👈 The fix is here: check if the results array exists and has a length
      if (response.data && response.data.results && response.data.results.length > 0) {
        setCart(response.data.results[0]);
      } else {
        setCart(null); // Set cart to null if no active cart is found
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, token]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://localhost:8000/api/orders/cart-items/${itemId}/`,
        { quantity: newQuantity, cart: cart?.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      // Re-fetch the cart to get the most up-to-date data and total
      fetchCart();
    } catch (err) {
      setError('Failed to update item quantity.');
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/orders/cart-items/${itemId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      // Re-fetch the cart after removing an item
      fetchCart();
    } catch (err) {
      setError('Failed to remove item.');
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/checkout/',
        { cart_id: cart?.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      alert('Checkout successful! Your order has been placed.');
      setCart(null); // Clear the cart after a successful checkout
      navigate('/orders'); // Redirect to order history
    } catch (err) {
      setError('Checkout failed. Please try again.');
      console.error(err);
    }
  };

  if (loading) return <Typography>Loading cart...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!user) return <Typography>Please log in to view your cart.</Typography>;
  if (!cart || cart.items.length === 0) return <Typography>Your cart is empty.</Typography>;

  return (
    <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Your Shopping Cart
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <List>
          {cart.items.map((item: any) => (
            <React.Fragment key={item.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                    <IconButton onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                      <AddIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleRemoveItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={item.product.name}
                  secondary={`Kshs. ${item.product.price.toFixed(2)}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="h6">
            Total: Kshs. {cart.total_price.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" fullWidth onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CartPage;