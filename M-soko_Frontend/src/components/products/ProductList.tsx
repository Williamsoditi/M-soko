import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress, Box, Typography, Card, CardContent } from '@mui/material';
import { getProducts, type Product } from '../../api/product-api';
import ProductCard from './ProductCard'; 

const ProductList: React.FC = () => {
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" my={10}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Box>
        );
    }
    
    // New "No Products" UI State
    if (products.length === 0) {
        return (
            <Box textAlign="center" my={10} sx={{ p: 4, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    No Products Found 😔
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    It looks like there are no products available at the moment. Please check back later!
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={4} sx={{ my: 4 }}>
            {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard product={product} />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList;