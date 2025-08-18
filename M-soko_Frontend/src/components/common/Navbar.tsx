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
  Menu, 
  MenuItem, 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; 
import HomeIcon from '@mui/icons-material/Home'; 
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; 
import StoreIcon from '@mui/icons-material/Store'; 
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; 
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; 

import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // 👈 New state for menu
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, logout } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navLinks = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'Products', path: '/products', icon: <StoreIcon /> },
    { title: 'Cart', path: '/cart', icon: <ShoppingCartIcon /> },
    { title: 'Orders', path: '/orders', icon: <LocalShippingIcon /> },
  ];

  const getIsActive = (path: string) => {
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  };

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        p: 2,
        backgroundColor: theme.palette.background.default,
      }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ width: '100%' }}>
        {navLinks.map((link) => (
          <ListItem
            key={link.title}
            button
            component={Link}
            to={link.path}
            selected={getIsActive(link.path)}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
                borderRadius: 1,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {link.icon && <Box sx={{ mr: 2 }}>{link.icon}</Box>}
              <ListItemText primary={link.title} />
            </Box>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {isAuthenticated ? (
          <>
            <ListItem button component={Link} to="/profile" onClick={handleDrawerToggle} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountCircleIcon sx={{ mr: 2 }} />
                <ListItemText primary="Profile" />
              </Box>
            </ListItem>
            <ListItem button onClick={() => { logout(); handleDrawerToggle(); }} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ExitToAppIcon sx={{ mr: 2 }} />
                <ListItemText primary="Logout" />
              </Box>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={handleDrawerToggle} sx={{ py: 1.5 }}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={handleDrawerToggle} sx={{ py: 1.5 }}>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
      <Box sx={{
        mt: 'auto',
        width: '100%',
        textAlign: 'center',
        pb: 2,
      }}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} M-soko
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: 3 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
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
              <MenuIcon />
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
                    ml: 3,
                    fontWeight: getIsActive(link.path) ? 'bold' : 'normal',
                    borderBottom: getIsActive(link.path) ? '2px solid' : 'none',
                    borderColor: 'white',
                    borderRadius: 0,
                    textTransform: 'none',
                    transition: 'border-bottom 0.3s',
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
              {isAuthenticated ? (
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={handleMenu}
                    sx={{ ml: 2, p: 0 }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleClose} component={Link} to="/profile">
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => { logout(); handleClose(); }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ ml: 2 }}>
                  <Button component={Link} to="/login" color="inherit" sx={{ fontWeight: 'bold' }}>
                    Login
                  </Button>
                  <Button variant="contained" component={Link} to="/register" sx={{ ml: 2, bgcolor: theme.palette.secondary.main }}>
                    Register
                  </Button>
                </Box>
              )}
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