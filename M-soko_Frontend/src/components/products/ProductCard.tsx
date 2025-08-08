import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import type { Product } from '../../api/product-api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', height: '100%', width: '100%', display: 'flex' }}>
      <Card
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: 3,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 8,
          },
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={product.image_url || "https://placehold.co/400x400/CCCCCC/000000?text=No+Image"}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              lineHeight: 1.2
            }}
          >
            {product.name}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="h5" component="p" color="primary.main" sx={{ fontWeight: 'bold' }}>
              ${parseFloat(String(product.price)).toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;