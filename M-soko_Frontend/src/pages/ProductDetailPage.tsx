import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, type Product } from '../api/product-api';
import { Container, Grid, Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

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
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          
          {/* Product Image Section */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.image_url || "https://via.placeholder.com/600"}
              alt={product.name}
              sx={{ 
                width: '100%', 
                height: { xs: 'auto', md: 500 }, // Fixed height on desktop
                objectFit: 'contain', 
                borderRadius: 2, 
                border: '1px solid #e0e0e0'
              }}
            />
          </Grid>

          {/* Product Details Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {product.name}
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              Kshs {product.price}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 4, lineHeight: 1.6 }}>
              {product.description}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              startIcon={<ShoppingCartIcon />}
            >
              Add to Cart
            </Button>
          </Grid>
        
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetailPage;