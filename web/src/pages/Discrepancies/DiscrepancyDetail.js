import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Breadcrumbs,
  Link,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { discrepancyApi, assetApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const DiscrepancyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [discrepancy, setDiscrepancy] = useState(null);
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchDiscrepancyDetails();
  }, [id]);

  const fetchDiscrepancyDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch discrepancy details
      const discrepancyResponse = await discrepancyApi.getById(id);
      setDiscrepancy(discrepancyResponse.data);

      // Fetch associated asset
      if (discrepancyResponse.data.assetId) {
        const assetResponse = await assetApi.getById(discrepancyResponse.data.assetId);
        setAsset(assetResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch discrepancy details');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a resolution description',
        severity: 'error',
      });
      return;
    }

    setResolving(true);
    try {
      await discrepancyApi.updateDiscrepancy(id, {
        status: 'Resolved',
        resolution: resolution,
        resolvedAt: new Date().toISOString(),
        resolvedBy: user.id,
      });

      setSnackbar({
        open: true,
        message: 'Discrepancy resolved successfully',
        severity: 'success',
      });

      setResolveDialogOpen(false);
      fetchDiscrepancyDetails(); // Refresh data
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to resolve discrepancy',
        severity: 'error',
      });
    } finally {
      setResolving(false);
    }
  };

  const handleBack = () => {
    navigate('/discrepancies');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Open':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  const canResolve = () => {
    return (
      discrepancy &&
      discrepancy.status !== 'Resolved' &&
      discrepancy.status !== 'Closed' &&
      (user?.role === 'Admin' || user?.role === 'Auditor')
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!discrepancy) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Discrepancy not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ textDecoration: 'none' }}
        >
          Discrepancies
        </Link>
        <Typography color="text.primary">Discrepancy #{discrepancy.id.slice(-8)}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {discrepancy.type} Discrepancy
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Discrepancy ID: {discrepancy.id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Discrepancies
          </Button>
          {canResolve() && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => setResolveDialogOpen(true)}
              color="success"
            >
              Resolve
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Discrepancy Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Discrepancy Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">{discrepancy.type}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={discrepancy.priority}
                      color={getPriorityColor(discrepancy.priority)}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {discrepancy.description}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Expected Value
                </Typography>
                <Typography variant="body1">{discrepancy.expectedValue || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Actual Value
                </Typography>
                <Typography variant="body1">{discrepancy.actualValue || 'N/A'}</Typography>
              </Grid>

              {discrepancy.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {discrepancy.notes}
                  </Typography>
                </Grid>
              )}

              {discrepancy.resolution && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Resolution
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {discrepancy.resolution}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Asset Information */}
          {asset && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Related Asset
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Asset Tag
                  </Typography>
                  <Typography variant="body1">{asset.assetTag}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Asset Name
                  </Typography>
                  <Typography variant="body1">{asset.name}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{asset.category}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{asset.location}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  View Asset Details
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Status and Timeline */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status & Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status
              </Typography>
              <Chip
                label={discrepancy.status}
                color={getStatusColor(discrepancy.status)}
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Detected Date
              </Typography>
              <Typography variant="body1">
                {formatDateTime(discrepancy.detectedAt)}
              </Typography>
            </Box>

            {discrepancy.resolvedAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Resolved Date
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(discrepancy.resolvedAt)}
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDateTime(discrepancy.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDateTime(discrepancy.updatedAt)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Discrepancy</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide details about how this discrepancy was resolved.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Resolution Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Describe how the discrepancy was resolved..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleResolve}
            variant="contained"
            color="success"
            disabled={resolving || !resolution.trim()}
          >
            {resolving ? <CircularProgress size={20} /> : 'Resolve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DiscrepancyDetail;
