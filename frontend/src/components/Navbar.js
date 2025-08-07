import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MotionAppBar = motion(AppBar);
const MotionButton = motion(Button);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    handleProfileMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Events', path: '/events' },
    { label: 'Create Event', path: '/create-event', auth: true, adminOnly: true },
  ];

  const mobileMenuItems = [
    { label: 'Home', path: '/', icon: <EventIcon /> },
    { label: 'Events', path: '/events', icon: <EventIcon /> },
    { label: 'Create Event', path: '/create-event', icon: <AddIcon />, auth: true, adminOnly: true },
    { label: 'Profile', path: '/profile', icon: <PersonIcon />, auth: true }
  ];

  return (
    <>
      <MotionAppBar
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar>
          {/* Logo */}
          <MotionButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              mr: 4
            }}
          >
            <EventIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              EventMate
            </Typography>
          </MotionButton>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                if (item.adminOnly && user?.role !== 'admin') return null;
                return (
                  <MotionButton
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      position: 'relative',
                      '&::after': isActive(item.path) ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: 2,
                        bgcolor: 'primary.main',
                        borderRadius: 1
                      } : {}
                    }}
                  >
                    {item.label}
                  </MotionButton>
                );
              })}
            </Box>
          )}

          {/* Right side buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <MotionButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variant="outlined"
                    size="small"
                    onClick={() => handleNavigation('/create-event')}
                    startIcon={<AddIcon />}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Create Event
                  </MotionButton>
                )}
                
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      borderRadius: 2
                    }
                  }}
                >
                  <MenuItem onClick={() => handleNavigation('/profile')}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="outlined"
                  onClick={() => handleNavigation('/login')}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  Login
                </MotionButton>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  onClick={() => handleNavigation('/register')}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  Sign Up
                </MotionButton>
              </>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleMobileMenuToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </MotionAppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleMobileMenuToggle}
        ModalProps={{
          keepMounted: true
        }}
        PaperProps={{
          sx: {
            width: 280,
            pt: 2
          }
        }}
      >
        <List>
          {mobileMenuItems.map((item) => {
            if (item.auth && !isAuthenticated) return null;
            if (item.adminOnly && user?.role !== 'admin') return null;
            return (
              <ListItem
                key={item.path}
                button
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.light'
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive(item.path) ? 600 : 400
                    }
                  }}
                />
              </ListItem>
            );
          })}
          
          {isAuthenticated && (
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                mx: 1,
                borderRadius: 1,
                mt: 2,
                color: 'error.main'
              }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
