import React from 'react';
import { Link } from 'react-router-dom'; 
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import type { Product } from '../../api/product-api';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                    component="img"
                    height="140"
                    image={product.image_url || "https://via.placeholder.com/150"}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                        {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ${product.price}
                    </Typography>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ProductCard;