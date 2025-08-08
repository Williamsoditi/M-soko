import { Box, Typography, Button, Container } from '@mui/material';
import ProductList from '../components/products/ProductList';
import HeroSection from '../components/home/HeroSection';

const HomePage = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
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
        
        <ProductList />

      </Container>
    </Box>
  );
};

export default HomePage;