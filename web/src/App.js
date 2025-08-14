import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';

// Layout components
import Layout from './components/Layout/Layout';
import MobileLayout from './components/MobileLayout';

// Authentication pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard pages
import Dashboard from './pages/Dashboard/Dashboard';

// Asset pages
import AssetList from './pages/Assets/AssetList';
import AssetDetail from './pages/Assets/AssetDetail';
import AssetForm from './pages/Assets/AssetForm';

// Movement pages
import MovementList from './pages/Movements/MovementList';
import MovementDetail from './pages/Movements/MovementDetail';
import MovementForm from './pages/Movements/MovementForm';

// Discrepancy pages
import DiscrepancyList from './pages/Discrepancies/DiscrepancyList';
import DiscrepancyDetail from './pages/Discrepancies/DiscrepancyDetail';

// User management pages
import UserList from './pages/Users/UserList';
import UserDetail from './pages/Users/UserDetail';
import UserForm from './pages/Users/UserForm';

// Role management pages
import RoleList from './pages/Roles/RoleList';
import RoleDetail from './pages/Roles/RoleDetail';
import RoleForm from './pages/Roles/RoleForm';

// Audit log pages
import AuditLogList from './pages/AuditLogs/AuditLogList';
import AuditLogDetail from './pages/AuditLogs/AuditLogDetail';

// Photo pages
import PhotoList from './pages/Photos/PhotoList';
import PhotoUpload from './pages/Photos/PhotoUpload';

// Profile page
import Profile from './pages/Profile/Profile';

// Services
import { AuthProvider, useAuth } from './services/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Choose layout based on device
  const LayoutComponent = isMobile ? MobileLayout : Layout;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      <Route path="/" element={isAuthenticated ? <LayoutComponent /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        
        {/* Asset routes */}
        <Route path="assets" element={<AssetList />} />
        <Route path="assets/:id" element={<AssetDetail />} />
        <Route path="assets/new" element={<AssetForm />} />
        <Route path="assets/edit/:id" element={<AssetForm />} />
        
        {/* Movement routes */}
        <Route path="movements" element={<MovementList />} />
        <Route path="movements/:id" element={<MovementDetail />} />
        <Route path="movements/new" element={<MovementForm />} />
        <Route path="movements/edit/:id" element={<MovementForm />} />
        
        {/* Discrepancy routes */}
        <Route path="discrepancies" element={<DiscrepancyList />} />
        <Route path="discrepancies/:id" element={<DiscrepancyDetail />} />

        {/* Photo routes */}
        <Route path="photos" element={<PhotoList />} />
        <Route path="photos/upload" element={<PhotoUpload />} />

        {/* User management routes - Admin only */}
        <Route path="users" element={user?.role === 'Admin' ? <UserList /> : <Navigate to="/" />} />
        <Route path="users/:id" element={user?.role === 'Admin' ? <UserDetail /> : <Navigate to="/" />} />
        <Route path="users/new" element={user?.role === 'Admin' ? <UserForm /> : <Navigate to="/" />} />
        <Route path="users/edit/:id" element={user?.role === 'Admin' ? <UserForm /> : <Navigate to="/" />} />
        
        {/* Role management routes - Admin only */}
        <Route path="roles" element={user?.role === 'Admin' ? <RoleList /> : <Navigate to="/" />} />
        <Route path="roles/:id" element={user?.role === 'Admin' ? <RoleDetail /> : <Navigate to="/" />} />
        <Route path="roles/new" element={user?.role === 'Admin' ? <RoleForm /> : <Navigate to="/" />} />
        <Route path="roles/edit/:id" element={user?.role === 'Admin' ? <RoleForm /> : <Navigate to="/" />} />
        
        {/* Audit log routes - Admin and Auditor only */}
        <Route 
          path="audit-logs" 
          element={['Admin', 'Auditor'].includes(user?.role) ? <AuditLogList /> : <Navigate to="/" />} 
        />
        <Route 
          path="audit-logs/:id" 
          element={['Admin', 'Auditor'].includes(user?.role) ? <AuditLogDetail /> : <Navigate to="/" />} 
        />
        
        {/* Profile route - accessible to all authenticated users */}
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;