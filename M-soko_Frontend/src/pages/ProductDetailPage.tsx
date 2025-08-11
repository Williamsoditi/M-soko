// src/pages/ProductDetailPage.tsx

import React, { useState, useEffect } from 'react';
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) {
      alert('Product details not available.');
      return;
    }
    
    try {
      await axios.post(
        'http://localhost:8000/api/orders/cart-items/',
        { 
          // FIX: Changed 'product' back to 'product_id'
          product_id: product.id, 
          quantity: 1 
        }
      );
      
      setTimeout(() => {
        navigate('/cart');
      }, 500); 
    } catch (err: any) { 
      console.error('Failed to add item to cart:', err);

      if (err.response && err.response.status === 400) {
        console.error('Backend validation errors:', err.response.data);
        alert('Could not add item to cart. Please see console for details.');
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
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