import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HeroSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 12,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
          }}
        >
          Discover Our Products
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{
            mb: 4,
            fontSize: { xs: '1.2rem', md: '1.5rem' },
          }}
        >
          Explore a world of quality items, from the latest gadgets to essential everyday goods.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/products"
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: 'secondary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'secondary.dark',
            },
            fontWeight: 'bold',
            fontSize: '1rem',
            px: 4,
            py: 1.5,
          }}
        >
          Shop Now
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;