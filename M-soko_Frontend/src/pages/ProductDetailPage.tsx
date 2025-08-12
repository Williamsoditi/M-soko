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
  Modal,
  Fade,
  Backdrop
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/products');
  };

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
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    if (!product) {
      alert('Product data is not available.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/orders/cart-items/',
        { product_id: product.id, quantity: 1 },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setAddedProductName(product.name);
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to add item to cart. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ✅ FIXED: Corrected the syntax error in this block
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
    <>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <CardMedia
            component="img"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 2,
              boxShadow: 3
            }}
            image={product.image_url || 'https://placehold.co/600x400/CCCCCC/000000?text=No+Image'}
            alt={product.name}
          />
          <Box sx={{ flex: 1, p: 2 }}>
            <Typography variant="h3" gutterBottom>{product.name}</Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              Kshs {parseFloat(String(product.price)).toFixed(2)}
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
      
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: 300, sm: 400 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography id="transition-modal-title" variant="h6" component="h2">
              ✅ Item Added to Cart!
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2, mb: 3 }}>
              "{addedProductName}" has been successfully added to your shopping cart.
            </Typography>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => navigate('/cart')}
              variant="contained"
              color="primary"
            >
              View Cart
            </Button>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default ProductDetailPage;