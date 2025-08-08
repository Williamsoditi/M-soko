
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
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
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
          variant="h4"
          component="h2"
          sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}
        >
          Featured Products
        </Typography>
        
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