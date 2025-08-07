import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Products', path: '/products' },
    { title: 'Cart', path: '/cart' },
    { title: 'Orders', path: '/orders' },
  ];

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* M-soko Title (Link to Home) */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}
          >
            M-soko
          </Typography>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navLinks.map((link) => (
              <Button
                key={link.title}
                component={Link}
                to={link.path}
                sx={{ color: 'white', ml: 2 }}
              >
                {link.title}
              </Button>
            ))}
          </Box>

          {/* Mobile Hamburger Menu Icon */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer (Hidden on desktop) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { width: 250 },
        }}
      >
        <List>
          {navLinks.map((link) => (
            <ListItem button key={link.title} component={Link} to={link.path} onClick={handleDrawerToggle}>
              <ListItemText primary={link.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;