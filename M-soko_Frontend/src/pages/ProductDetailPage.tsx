import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  CardMedia,
  Button,
} from '@mui/material';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // State for success/error messages

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle adding an item to the cart
  const handleAddToCart = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    if (!product) {
      setMessage('Product data is not available.');
      return;
    }

    try {
      // Send a POST request to add the item to the cart
      await axios.post(
        'http://localhost:8000/api/orders/cart-items/',
        { product_id: product.id, quantity: 1 },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setMessage('Item added to cart successfully!');
    } catch (err) {
      setMessage('Failed to add item to cart. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          {error || 'Product not found.'}
        </Typography>
      </Container>
    );
  }
  if (message) {
    return <Typography color={error ? "error" : "success"} textAlign="center">{message}</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
        <CardMedia
          component="img"
          sx={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }}
          image={product.image_url || 'https://placehold.co/600x400/CCCCCC/000000?text=No+Image'}
          alt={product.name}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" gutterBottom>{product.name}</Typography>
          <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
            ${parseFloat(String(product.price)).toFixed(2)}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {product.description}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;