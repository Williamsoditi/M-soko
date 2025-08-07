// src/pages/HomePage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
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
        setProducts(data);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <HeroSection /> {/* <-- Use the new HeroSection component here */}
      
      <Container maxWidth="xl" sx={{ my: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Featured Products
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Check out our latest and greatest items.
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" my={10}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <ProductList products={products} loading={loading} error={error} />
        )}
      </Container>
    </>
  );
};

export default HomePage;