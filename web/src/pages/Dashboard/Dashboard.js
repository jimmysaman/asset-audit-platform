import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  SwapHoriz as SwapHorizIcon,
  Error as ErrorIcon,
  Photo as PhotoIcon,
} from '@mui/icons-material';
import { assetApi, movementApi, discrepancyApi, photoApi } from '../../services/api';

const StatCard = ({ title, value, icon, color, loading, error }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 1,
              p: 1,
              display: 'flex',
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            Failed to load data
          </Alert>
        ) : (
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    assets: { count: 0, loading: true, error: false },
    movements: { count: 0, loading: true, error: false },
    discrepancies: { count: 0, loading: true, error: false },
    photos: { count: 0, loading: true, error: false },
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch asset count
      try {
        const assetResponse = await assetApi.getAssets({ limit: 1 });
        setStats((prev) => ({
          ...prev,
          assets: {
            count: assetResponse.data.total || 0,
            loading: false,
            error: false,
          },
        }));
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          assets: { ...prev.assets, loading: false, error: true },
        }));
      }

      // Fetch movement count
      try {
        const movementResponse = await movementApi.getMovements({ limit: 1 });
        setStats((prev) => ({
          ...prev,
          movements: {
            count: movementResponse.data.total || 0,
            loading: false,
            error: false,
          },
        }));
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          movements: { ...prev.movements, loading: false, error: true },
        }));
      }

      // Fetch discrepancy count
      try {
        const discrepancyResponse = await discrepancyApi.getDiscrepancies({ limit: 1 });
        setStats((prev) => ({
          ...prev,
          discrepancies: {
            count: discrepancyResponse.data.total || 0,
            loading: false,
            error: false,
          },
        }));
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          discrepancies: { ...prev.discrepancies, loading: false, error: true },
        }));
      }

      // Fetch photo count
      try {
        const photoResponse = await photoApi.getPhotos({ limit: 1 });
        setStats((prev) => ({
          ...prev,
          photos: {
            count: photoResponse.data.total || 0,
            loading: false,
            error: false,
          },
        }));
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          photos: { ...prev.photos, loading: false, error: true },
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to the Asset Audit & Reconciliation Platform. Here's an overview of your system.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={stats.assets.count}
            icon={<InventoryIcon sx={{ color: 'primary.main' }} />}
            color="primary"
            loading={stats.assets.loading}
            error={stats.assets.error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Movements"
            value={stats.movements.count}
            icon={<SwapHorizIcon sx={{ color: 'success.main' }} />}
            color="success"
            loading={stats.movements.loading}
            error={stats.movements.error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Discrepancies"
            value={stats.discrepancies.count}
            icon={<ErrorIcon sx={{ color: 'error.main' }} />}
            color="error"
            loading={stats.discrepancies.loading}
            error={stats.discrepancies.error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Photos"
            value={stats.photos.count}
            icon={<PhotoIcon sx={{ color: 'info.main' }} />}
            color="info"
            loading={stats.photos.loading}
            error={stats.photos.error}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Start Guide
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          Welcome to the Asset Audit & Reconciliation Platform. This system helps you track and manage your assets, record movements, identify discrepancies, and maintain a comprehensive audit trail.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Getting Started:</strong>
        </Typography>
        <Typography component="div">
          <ul>
            <li>Use the sidebar to navigate between different sections</li>
            <li>Add new assets in the Assets section</li>
            <li>Record asset movements in the Movements section</li>
            <li>Document discrepancies in the Discrepancies section</li>
            <li>Upload and manage photos in the Photos section</li>
            <li>Administrators can manage users and roles in their respective sections</li>
            <li>View the audit trail in the Audit Logs section</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;