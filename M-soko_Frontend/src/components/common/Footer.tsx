import React from 'react';
import { Box, Typography, Container, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto', // Pushes the footer to the bottom of the page
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          
          {/* Copyright Section */}
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="body1">
              &copy; {new Date().getFullYear()} M-soko. All rights reserved.
            </Typography>
          </Grid>
          
          {/* Social Media Links */}
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <IconButton href="#" color="inherit" aria-label="facebook">
              <FacebookIcon />
            </IconButton>
            <IconButton href="#" color="inherit" aria-label="twitter">
              <TwitterIcon />
            </IconButton>
            <IconButton href="#" color="inherit" aria-label="instagram">
              <InstagramIcon />
            </IconButton>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;