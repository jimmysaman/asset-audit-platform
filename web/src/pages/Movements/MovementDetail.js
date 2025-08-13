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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  SwapHoriz as SwapHorizIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { movementApi, assetApi, photoApi } from '../../services/api';

const MovementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movement, setMovement] = useState(null);
  const [asset, setAsset] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovementDetails();
  }, [id]);

  const fetchMovementDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch movement details
      const movementResponse = await movementApi.getById(id);
      setMovement(movementResponse.data);

      // Fetch associated asset
      if (movementResponse.data.assetId) {
        const assetResponse = await assetApi.getById(movementResponse.data.assetId);
        setAsset(assetResponse.data);
      }

      // Fetch movement photos
      const photosResponse = await photoApi.getMovementPhotos(id);
      setPhotos(photosResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch movement details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/movements/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/movements');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Approved':
        return 'info';
      case 'Requested':
        return 'warning';
      case 'Rejected':
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Transfer':
        return <SwapHorizIcon />;
      case 'Checkout':
        return <CheckCircleIcon />;
      case 'Return':
        return <CheckCircleIcon />;
      case 'Maintenance':
        return <EditIcon />;
      case 'Disposal':
        return <CancelIcon />;
      default:
        return <SwapHorizIcon />;
    }
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

  if (!movement) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Movement not found</Alert>
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
          Movements
        </Link>
        <Typography color="text.primary">Movement #{movement.id.slice(-8)}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {movement.type} Movement
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Movement ID: {movement.id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Movements
          </Button>
          {movement.status === 'Requested' && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Movement
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Movement Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Movement Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getTypeIcon(movement.type)}
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Movement Type
                    </Typography>
                    <Typography variant="body1">{movement.type}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      From Location
                    </Typography>
                    <Typography variant="body1">{movement.fromLocation}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      To Location
                    </Typography>
                    <Typography variant="body1">{movement.toLocation}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      From Custodian
                    </Typography>
                    <Typography variant="body1">{movement.fromCustodian || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      To Custodian
                    </Typography>
                    <Typography variant="body1">{movement.toCustodian || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Reason
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {movement.reason || 'No reason provided'}
                </Typography>
              </Grid>

              {movement.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {movement.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Asset Information */}
          {asset && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Asset Information
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
                    Current Location
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
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status & Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status
              </Typography>
              <Chip
                label={movement.status}
                color={getStatusColor(movement.status)}
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Request Date
              </Typography>
              <Typography variant="body1">
                {formatDateTime(movement.requestDate)}
              </Typography>
            </Box>

            {movement.approvalDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Approval Date
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(movement.approvalDate)}
                </Typography>
              </Box>
            )}

            {movement.completionDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Completion Date
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(movement.completionDate)}
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDateTime(movement.createdAt)}
              </Typography>
            </Box>

            {movement.hasDiscrepancy && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This movement has reported discrepancies
              </Alert>
            )}
          </Paper>

          {/* Photos */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photos ({photos.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {photos.length > 0 ? (
              <Grid container spacing={1}>
                {photos.slice(0, 4).map((photo) => (
                  <Grid item xs={6} key={photo.id}>
                    <img
                      src={photoApi.getPhotoUrl(photo.id)}
                      alt={photo.description || 'Movement photo'}
                      style={{
                        width: '100%',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">No photos available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MovementDetail;
