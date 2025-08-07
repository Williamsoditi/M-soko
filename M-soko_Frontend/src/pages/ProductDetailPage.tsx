// src/pages/ProductDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import { getProductById, type Product } from '../api/product-api';
import { Container, Grid, Box, Typography, CircularProgress, Button } from '@mui/material';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
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
            src={product.image_url || "https://via.placeholder.com/600"}
            alt={product.name}
            sx={{ width: '100%', borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom>{product.name}</Typography>
          <Typography variant="h5" color="primary" gutterBottom>${product.price}</Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
            {product.description}
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;