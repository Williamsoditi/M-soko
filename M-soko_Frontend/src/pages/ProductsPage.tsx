import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getProducts, type Product } from '../api/product-api'; 
import ProductList from '../components/products/ProductList';

const ProductsPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all products on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);
        setFilteredProducts(data); // Initially, all products are filtered
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter products whenever searchQuery or allProducts changes
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(lowercasedQuery) ||
      product.description.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, allProducts]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Container maxWidth="xl" sx={{ my: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Our Products
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Explore our wide range of high-quality items.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            maxWidth: 600, // Limit width of search bar
            '& .MuiOutlinedInput-root': {
              borderRadius: 8, // More rounded
              backgroundColor: 'background.paper',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Subtle shadow
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Product List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductList products={filteredProducts} loading={loading} error={error} />
      )}
    </Container>
  );
};

export default ProductsPage;