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
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  QrCode as QrCodeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { assetApi, movementApi, photoApi } from '../../services/api';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [movements, setMovements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch asset details
      const assetResponse = await assetApi.getById(id);
      setAsset(assetResponse.data);

      // Fetch asset movements
      const movementsResponse = await movementApi.getMovements({ assetId: id });
      setMovements(movementsResponse.data.movements || []);

      // Fetch asset photos
      const photosResponse = await photoApi.getAssetPhotos(id);
      setPhotos(photosResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch asset details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/assets/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/assets');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Maintenance':
        return 'warning';
      default:
        return 'default';
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

  if (!asset) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Asset not found</Alert>
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
          Assets
        </Link>
        <Typography color="text.primary">{asset.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {asset.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Asset Tag: {asset.assetTag}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Assets
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Asset
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Asset Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Asset Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QrCodeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Asset Tag
                    </Typography>
                    <Typography variant="body1">{asset.assetTag}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">{asset.category}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">{asset.location}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Custodian
                    </Typography>
                    <Typography variant="body1">{asset.custodian || 'Not assigned'}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {asset.description || 'No description available'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Serial Number
                </Typography>
                <Typography variant="body1">{asset.serialNumber || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Model
                </Typography>
                <Typography variant="body1">{asset.model || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Manufacturer
                </Typography>
                <Typography variant="body1">{asset.manufacturer || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Purchase Date
                </Typography>
                <Typography variant="body1">
                  {asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Purchase Cost
                </Typography>
                <Typography variant="body1">
                  {asset.purchaseCost ? `$${asset.purchaseCost}` : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Warranty Expiry
                </Typography>
                <Typography variant="body1">
                  {asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Movements */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Movements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {movements.length > 0 ? (
              <List>
                {movements.slice(0, 5).map((movement) => (
                  <ListItem key={movement.id} divider>
                    <ListItemText
                      primary={`${movement.type}: ${movement.fromLocation} → ${movement.toLocation}`}
                      secondary={`${formatDate(movement.requestDate)} - Status: ${movement.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No movements recorded</Typography>
            )}
          </Paper>
        </Grid>

        {/* Status and Quick Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status & Quick Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={asset.status}
                color={getStatusColor(asset.status)}
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last Scanned
              </Typography>
              <Typography variant="body1">
                {asset.lastScannedAt ? formatDate(asset.lastScannedAt) : 'Never'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDate(asset.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(asset.updatedAt)}
              </Typography>
            </Box>

            {asset.hasDiscrepancy && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This asset has reported discrepancies
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
                      alt={photo.description || 'Asset photo'}
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

export default AssetDetail;
