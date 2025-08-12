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
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number | string;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number | string;
}

interface Order {
  id: number;
  items: OrderItem[];
  total_price: number | string;
  status: string;
  created_at: string;
}

// Helper function to safely parse a string into a float, removing non-numeric chars
const safeParseFloat = (value: number | string): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanedValue) || 0;
  }
  return 0;
};

const OrderHistoryPage = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isAuthenticated || !token) {
      setLoading(false);
      setError('Please log in to view your order history.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/orders/history/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      // Ensure the response is an array before setting state
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        // If the backend returns something other than an array, treat it as an error
        console.error('API did not return an array:', response.data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cumulativeTotal = orders.reduce((sum, order) => {
    return sum + safeParseFloat(order.total_price);
  }, 0);

  // --- Start of TWEAKED rendering logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} color="primary" />
        <Typography variant="h5" sx={{ ml: 2, color: 'text.secondary' }}>Loading orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center', p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error: {error}
        </Typography>
        {!isAuthenticated && (
          <Button onClick={() => navigate('/login')} sx={{ mt: 3 }} variant="contained" color="primary">
            Go to Login
          </Button>
        )}
      </Container>
    );
  }

  // This is the tweaked "empty" state. It will now render correctly if orders is an empty array.
  if (orders.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center', p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          You haven't placed any orders yet. 😔
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start exploring our products to make your first purchase!
        </Typography>
        <Button onClick={() => navigate('/')} variant="contained" color="primary" size="large">
          Start Shopping
        </Button>
      </Container>
    );
  }

  // If we reach this point, orders.length is > 0, so we render the content.
  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 'bold',
          mb: 5,
          color: 'text.primary',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        Your Order History
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card
              sx={{
                boxShadow: 6,
                borderRadius: 3,
                p: 3,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8,
                },
                backgroundColor: (theme) => theme.palette.background.paper,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Order #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed on: {new Date(order.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Status:{' '}
                  <Box
                    component="span"
                    sx={{
                      textTransform: 'capitalize',
                      fontWeight: 'medium',
                      color: order.status === 'processing' ? 'orange' : 'success.main',
                    }}
                  >
                    {order.status}
                  </Box>
                </Typography>
                <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'medium' }}>
                  Ordered Items:
                </Typography>
                <List dense sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, backgroundColor: 'grey.50' }}>
                  {order.items.map((item) => (
                    <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'normal' }}>
                            {item.product.name}{' '}
                            <Box component="span" sx={{ fontWeight: 'bold' }}>
                              x{item.quantity}
                            </Box>
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Unit Price: Kshs {safeParseFloat(item.price).toFixed(2)}
                          </Typography>
                        }
                      />
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Kshs {(item.quantity * safeParseFloat(item.price)).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 3, textAlign: 'right', pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="primary">
                    Order Total: Kshs {safeParseFloat(order.total_price).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{
        mt: 8,
        p: 3,
        textAlign: 'right',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        boxShadow: 2,
      }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Total Amount Spent on All Orders
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="primary">
          Kshs {cumulativeTotal.toFixed(2)}
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderHistoryPage;