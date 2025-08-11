import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import ProductList from '../components/products/ProductList';
import HeroSection from '../components/home/HeroSection';
import { getProducts, type Product } from '../api/product-api';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        // You might want to get only a few products for the home page
        // For example, setProducts(data.slice(0, 8));
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <HeroSection />

      {/* Products Section */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, my: 8 }}>
        <Typography
          variant="h3" 
          component="h2"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'primary.main', 
            mb: 2,
          }}
        >
          Featured Products
        </Typography>

        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: 'md',
            mx: 'auto',
            mb: 6, 
          }}
        >
          Discover our curated selection of high-quality items.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 10 }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ ml: 2, color: 'text.secondary' }}>
              Loading products...
            </Typography>
          </Box>
        ) : error ? (
          <Box textAlign="center" my={10}>
            <Alert severity="error">{error}</Alert> 
          </Box>
        ) : (
          <ProductList products={products} loading={loading} error={error} />
        )}
      </Container>
    </>
  );
};

export default HomePage;