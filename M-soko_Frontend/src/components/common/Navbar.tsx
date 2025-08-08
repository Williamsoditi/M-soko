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

// 👈 New: Import the useAuth hook
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 👈 New: Use the auth hook to get state and logout function
  const { isAuthenticated, logout } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 👈 New: Conditionally show profile link if authenticated
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
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          position: 'absolute',
          top: theme.spacing(1),
          right: theme.spacing(1),
          color: theme.palette.text.primary,
        }}
      >
        <CloseIcon />
      </IconButton>

      <List sx={{ width: '100%' }}>
        {navLinks.map((link) => {
          const isActive = link.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(link.path);

          return (
            <ListItem
              key={link.title}
              button
              component={Link}
              to={link.path}
              selected={isActive}
              sx={{
                justifyContent: 'center',
                py: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                  fontWeight: 'bold',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemText primary={link.title} />
            </ListItem>
          );
        })}
        {/* 👈 New: Profile and Logout links in the mobile drawer */}
        {isAuthenticated ? (
            <>
                <ListItem
                    button
                    component={Link}
                    to="/profile"
                    selected={location.pathname === '/profile'}
                    sx={{ justifyContent: 'center', py: 2 }}
                >
                    <ListItemText primary="Profile" />
                </ListItem>
                <ListItem
                    button
                    onClick={logout}
                    sx={{ justifyContent: 'center', py: 2 }}
                >
                    <ListItemText primary="Logout" />
                </ListItem>
            </>
        ) : (
            <>
                <ListItem
                    button
                    component={Link}
                    to="/login"
                    selected={location.pathname === '/login'}
                    sx={{ justifyContent: 'center', py: 2 }}
                >
                    <ListItemText primary="Login" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/register"
                    selected={location.pathname === '/register'}
                    sx={{ justifyContent: 'center', py: 2 }}
                >
                    <ListItemText primary="Register" />
                </ListItem>
            </>
        )}
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
                    borderBottom: location.pathname.startsWith(link.path) && link.path !== '/' ? '2px solid' : 'none',
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
              {/* 👈 New: Profile and Logout links in the desktop navbar */}
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/profile"
                    sx={{
                        color: 'white',
                        ml: 2,
                        fontWeight: 'bold',
                        borderBottom: location.pathname === '/profile' ? '2px solid' : 'none',
                        borderRadius: 0,
                    }}
                  >
                    Profile
                  </Button>
                  <Button color="inherit" onClick={logout} sx={{ ml: 2, fontWeight: 'bold' }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={{ color: 'white', ml: 2, fontWeight: 'bold' }}>
                    Login
                  </Button>
                  <Button component={Link} to="/register" sx={{ color: 'white', ml: 2, fontWeight: 'bold' }}>
                    Register
                  </Button>
                </>
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