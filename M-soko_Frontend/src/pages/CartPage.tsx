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
  IconButton,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the DeleteIcon

// Define interfaces for better type safety
interface Product {
  id: number;
  name: string;
  price: number;
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

const CartPage: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        const processedCart = {
          ...cartData,
          items: cartData.items.map((item: any) => ({
            ...item,
            product: {
              ...item.product,
              price: parseFloat(item.product.price),
            },
            total_price: parseFloat(item.total_price),
          })),
          total_price: parseFloat(cartData.total_price),
        };
        setCart(processedCart);
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

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (cart) {
      const updatedItems = cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity, total_price: newQuantity * item.product.price } : item
      );
      const newTotal = updatedItems.reduce((acc, item) => acc + item.total_price, 0);

      setCart({ ...cart, items: updatedItems, total_price: newTotal });
    }

    try {
      await axios.patch(
        `http://localhost:8000/api/orders/cart-items/${itemId}/`,
        { quantity: newQuantity },
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update cart item:", err);
      setError("Failed to update item quantity. Please try again.");
      fetchCart();
    }
  };

  const handleRemoveItem = async (itemId: number, productName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from your cart?`)) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8000/api/orders/cart-items/${itemId}/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      // ✅ FIX: Update the local state to remove the item instantly
      if (cart) {
        const updatedItems = cart.items.filter(item => item.id !== itemId);
        const newTotal = updatedItems.reduce((acc, item) => acc + item.total_price, 0);
        setCart({ ...cart, items: updatedItems, total_price: newTotal });
      }
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      setError("Failed to remove item. Please try again.");
      fetchCart();
    }
  };

  const handleCheckout = async () => {
    if (!cart) {
      return;
    }
    try {
      await axios.post(
        'http://localhost:8000/api/checkout/',
        { cart_id: cart.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      setIsModalOpen(true);
    } catch (err: unknown) {
      let errorMessage = 'Checkout failed. Please try again.';
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setError(errorMessage);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/orders');
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
        Your Shopping Cart
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <List>
          {cart.items.map((item) => (
            <ListItem 
              key={item.id}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleRemoveItem(item.id, item.product.name)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${item.product.name} x ${item.quantity}`}
                secondary={`Unit Price: Kshs. ${item.product.price.toFixed(2)}`}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Kshs. {item.total_price.toFixed(2)}
                </Typography>
              </Box>
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
          Proceed to Checkout
        </Button>
      </Paper>

      {/* The Modal is displayed after successful checkout */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isModalOpen}
        onClose={handleModalClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: 300, sm: 400 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Order Placed Successfully!
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2, mb: 3 }}>
              Your items have been successfully purchased. You are now being redirected to your order history.
            </Typography>
            <Button
              onClick={handleModalClose}
              variant="contained"
              color="primary"
            >
              View Orders
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CartPage;