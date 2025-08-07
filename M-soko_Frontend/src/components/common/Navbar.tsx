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
  ListItemText,
  ListItemIcon,
  Divider 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close'; 
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store'; 
import AssignmentIcon from '@mui/icons-material/Assignment';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinks = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'Products', path: '/products', icon: <StoreIcon /> },
    { title: 'Cart', path: '/cart', icon: <ShoppingCartIcon /> },
    { title: 'Orders', path: '/orders', icon: <AssignmentIcon /> },
  ];

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', fontWeight: 'bold' }}
          >
            M-soko
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navLinks.map((link) => (
              <Button
                key={link.title}
                component={Link}
                to={link.path}
                sx={{ color: 'white', ml: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                {link.title}
              </Button>
            ))}
          </Box>

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

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { width: 280, p: 2, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            M-soko
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {navLinks.map((link) => (
            <ListItem 
              button 
              key={link.title} 
              component={Link} 
              to={link.path} 
              onClick={handleDrawerToggle}
              sx={{ py: 1.5, px: 2, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText primary={
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {link.title}
                </Typography>
              } />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;