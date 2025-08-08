import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, type Product } from '../api/product-api';
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Button,
  Rating,
  Divider,
} from '@mui/material';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided.');
        setLoading(false);
        return;
      }
      try {
        const productData = await getProductById(parseInt(id));
        setProduct(productData);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <Typography>Product not found.</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ my: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={product.image_url || 'https://via.placeholder.com/600'}
            alt={product.name}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 3,
              aspectRatio: '1 / 1', // Maintain aspect ratio
              objectFit: 'cover', // Ensures image fills the box
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Rating name="read-only" value={4} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (150 reviews)
            </Typography>
          </Box>
          <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
            Kshs{(product.price * 1.2).toFixed(2)}
          </Typography>
          <Typography variant="h3" color="primary" sx={{ my: 1, fontWeight: 'bold' }}>
            Kshs {product.price}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
            Shipping calculated at checkout.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Product Description
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 4, color: 'text.secondary' }}>
            {product.description}
          </Typography>
          <Button variant="contained" color="primary" size="large" fullWidth>
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;