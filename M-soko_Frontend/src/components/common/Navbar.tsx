import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Products', path: '/products' },
    { title: 'Cart', path: '/cart' },
    { title: 'Orders', path: '/orders' },
  ];

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        backgroundColor: theme.palette.background.paper,
      }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <List sx={{ width: '100%' }}>
        {navLinks.map((link) => (
          <ListItem
            key={link.title}
            button
            component={Link}
            to={link.path}
            selected={location.pathname === link.path}
            sx={{
              justifyContent: 'center',
              py: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {link.icon && <Box sx={{ mr: 1 }}>{link.icon}</Box>}
            <ListItemText primary={link.title} />
          </ListItem>
        ))}
      </List>
      <Box sx={{
        position: 'absolute',
        bottom: theme.spacing(2),
        width: '100%',
      }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © {new Date().getFullYear()} M-soko
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: 3 }}>
        <Toolbar>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            M-soko 
          </Typography>

          {isMobile ? (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              {drawerOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Button
                  key={link.title}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: 'white',
                    ml: 2,
                    fontWeight: 'bold',
                    borderBottom: location.pathname === link.path ? '2px solid' : 'none',
                    borderRadius: 0,
                    transition: 'border-color 0.3s',
                    '&:hover': {
                      borderBottom: '2px solid',
                      borderColor: 'white',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;