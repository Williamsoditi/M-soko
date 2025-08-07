import { Box, Typography, Button, Container, Grid } from '@mui/material';

const HomePage = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 16 },
          px: { xs: 2, md: 4 },
          textAlign: 'center',
          backgroundColor: 'background.default',
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
            Discover and Shop Unique Products
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: 'text.secondary',
            }}
          >
            Your one-stop destination for the best products online.
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Shop Now
          </Button>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, my: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}
        >
          Featured Products
        </Typography>
        
        {/* This is a placeholder for your product grid */}
        <Grid container spacing={4}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Box
                sx={{
                  p: 4,
                  height: 300,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Product Placeholder
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;