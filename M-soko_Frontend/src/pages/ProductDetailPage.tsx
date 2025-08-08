import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch product details on component load
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle adding an item to the cart
  // const handleAddToCart = async () => {
  //   if (!isAuthenticated || !token) {
  //     navigate('/login'); // Redirect to login if not authenticated
  //     return;
  //   }

  //   try {
  //     // Send a POST request to add the item to the cart
  //     await axios.post(
  //       'http://localhost:8000/api/orders/cart-items/',
  //       { product: product.id, quantity: 1 },
  //       {
  //         headers: {
  //           Authorization: `Token ${token}`,
  //         },
  //       }
  //     );
  //     setMessage('Item added to cart successfully!');
  //   } catch (err) {
  //     setMessage('Failed to add item to cart. Please try again.');
  //     console.error(err);
  //   }
  // };

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

  if (!product) {
    return <Typography>Product not found.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 800, mx: "auto", p: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {product.name}
        </Typography>
        {message && (
          <Alert
            severity={message.includes("success") ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}
        <Typography variant="h6" color="text.secondary">
          Kshs. {parseFloat(product.price).toFixed(2) || "N/A"}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {product.description}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductDetailPage;