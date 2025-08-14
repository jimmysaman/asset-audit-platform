import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as AssetsIcon,
  SwapHoriz as MovementsIcon,
  PhotoCamera as PhotosIcon,
  People as UsersIcon,
  Assessment as AuditIcon,
  AccountCircle as ProfileIcon,
  PhotoCamera as CameraIcon,
  QrCodeScanner as ScanIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const MobileLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Assets', icon: <AssetsIcon />, path: '/assets' },
    { text: 'Movements', icon: <MovementsIcon />, path: '/movements' },
    { text: 'Photos', icon: <PhotosIcon />, path: '/photos' },
    { text: 'Sites', icon: <LocationIcon />, path: '/sites' },
    ...(user?.role?.name === 'Admin' ? [
      { text: 'Users', icon: <UsersIcon />, path: '/users' },
      { text: 'Audit Logs', icon: <AuditIcon />, path: '/audit-logs' },
    ] : []),
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  const bottomNavItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Assets', icon: <AssetsIcon />, path: '/assets' },
    { label: 'Movements', icon: <MovementsIcon />, path: '/movements' },
    { label: 'Photos', icon: <PhotosIcon />, path: '/photos' },
    { label: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const getCurrentBottomNavValue = () => {
    const currentPath = location.pathname;
    const matchingItem = bottomNavItems.find(item => 
      currentPath.startsWith(item.path)
    );
    return matchingItem ? matchingItem.path : '/dashboard';
  };

  const handleQuickPhoto = () => {
    navigate('/photos/upload');
  };

  const handleQuickScan = () => {
    // Implement QR scanning functionality
    navigate('/assets?scan=true');
  };

  if (!isMobile) {
    // Desktop layout - return children with standard layout
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Standard desktop sidebar would go here */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Asset Audit
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/profile')}>
            <ProfileIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        <Box sx={{ width: 250, pt: 8 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname.startsWith(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Account for app bar
          pb: 8, // Account for bottom navigation
          px: 2,
          minHeight: 'calc(100vh - 128px)',
        }}
      >
        {children}
      </Box>

      {/* Floating Action Buttons */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 80, 
        right: 16, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        zIndex: theme.zIndex.fab,
      }}>
        <Fab
          color="secondary"
          size="medium"
          onClick={handleQuickScan}
          sx={{ mb: 1 }}
        >
          <ScanIcon />
        </Fab>
        <Fab
          color="primary"
          onClick={handleQuickPhoto}
        >
          <CameraIcon />
        </Fab>
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={getCurrentBottomNavValue()}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {bottomNavItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default MobileLayout;
