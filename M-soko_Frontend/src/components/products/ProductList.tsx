// src/components/products/ProductList.tsx

import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import type { Product } from '../../api/product-api';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const ProductList: React.FC<ProductListProps> = ({ products, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <Typography variant="h6" color="text.secondary">Loading products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" my={10}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <Box textAlign="center" my={10}>
        <Typography variant="h6" color="text.secondary">No products found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;