import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, Box } from '@mui/material';
import type { Product } from '../../api/product-api';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Card sx={{ 
            height: 350, // <-- Set a fixed height for all cards
            borderRadius: 2, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
            transition: 'transform 0.3s',
            '&:hover': {
                transform: 'translateY(-5px)',
            }
        }}>
            <CardActionArea component={Link} to={`/products/${product.id}`} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardMedia
                    component="img"
                    height="200" // <-- Fixed image height
                    image={product.image_url || "https://via.placeholder.com/200"}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="div"
                        sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.2,
                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                        {product.name}
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        color="primary" 
                        sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                        Kshs {product.price}
                    </Typography>
                    <Box sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            {product.description}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ProductCard;