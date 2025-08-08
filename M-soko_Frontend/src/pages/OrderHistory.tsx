import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const OrderHistoryPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/api/orders/history/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setOrders(response.data.results);
      } catch (err) {
        setError('Failed to fetch order history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (orders.length === 0) {
    return (
      <Typography variant="h6" textAlign="center" mt={4}>
        You have no past orders.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Your Order History
      </Typography>
      {orders.map((order) => (
        <Paper key={order.id} elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Order #{order.id}</Typography>
          <Typography variant="body1" color="text.secondary">
            Date: {new Date(order.created_at).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Status: {order.status}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List dense>
            {order.items.map((item: any) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={`${item.product.name} x ${item.quantity}`}
                  secondary={`Kshs. ${item.total_price.toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" textAlign="right">
            Total: Kshs. {order.total_price.toFixed(2)}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default OrderHistoryPage;