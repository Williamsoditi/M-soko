import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';

// Type definition for a product object
interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
  category_id: number;
}

// Type definition for a category object
interface Category {
  id: string | number;
  name: string;
}

const ProductsPage = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: 'All', name: 'All' }]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  // Effect to fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const response = await axios.get('http://localhost:8000/api/categories/');
        const fetchedCategories: Category[] = response.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }));
        setCategories([{ id: 'All', name: 'All' }, ...fetchedCategories]);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setErrorCategories('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Effect to fetch products based on search term and selected category
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        if (selectedCategory !== 'All') {
          queryParams.append('category', String(selectedCategory));
        }
        const API_URL = `http://localhost:8000/api/products/?${queryParams.toString()}`;
        const response = await axios.get(API_URL);
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setErrorProducts('Failed to load products. Please try again later.');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/orders/cart-items/',
        {
          product_id: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      if (axios.isAxiosError(err) && err.response) {
        alert(
          `Failed to add item to cart: ${err.response.data.detail || 'An unexpected error occurred.'}`
        );
      } else {
        alert('Failed to add item to cart. Please check your login status or try again.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.grey[50],
        p: { xs: 2, md: 4 },
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            textAlign: 'center',
            color: 'text.primary',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Our Products
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 6,
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: 'md',
            mx: 'auto',
          }}
        >
          Explore a wide range of high-quality products tailored to your needs. Find exactly what you're looking for with our smart search and category filters.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 6,
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            {loadingCategories ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 56,
                  color: 'text.secondary',
                }}
              >
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading...
              </Box>
            ) : errorCategories ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 56,
                  color: 'error.main',
                }}
              >
                Error
              </Box>
            ) : (
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
                sx={{ borderRadius: 2 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </Box>

        {loadingProducts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ ml: 2, color: 'text.secondary' }}>
              Loading products...
            </Typography>
          </Box>
        ) : errorProducts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <Typography variant="h5" color="error">
              Error: {errorProducts}
            </Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <Typography variant="h5" color="text.secondary">
              No products found matching your criteria.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ display: 'flex' }}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 4,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8,
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={product.image_url || 'https://placehold.co/400x400/CCCCCC/000000?text=No+Image'}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover',
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ minHeight: '64px' }}> 
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 'medium', mb: 1, color: 'text.primary', lineHeight: 1.3 }}
                      >
                        {product.name}
                      </Typography>
                    </Box>
                    <Box sx={{ minHeight: '40px' }}> 
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.description}
                      </Typography>
                    </Box>
                    <Box sx={{ minHeight: '36px', display: 'flex', alignItems: 'center' }}> {/* Fixed height for price */}
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        Kshs {product.price ? parseFloat(String(product.price)).toFixed(2) : '0.00'}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, justifyContent: 'flex-end', mt: 'auto' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="medium"
                      sx={{
                        borderRadius: 2,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ProductsPage;