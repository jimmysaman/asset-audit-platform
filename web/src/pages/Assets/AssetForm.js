import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { assetApi } from '../../services/api';

const assetCategories = [
  'Electronics',
  'Furniture',
  'Office Equipment',
  'IT Equipment',
  'Vehicles',
  'Tools',
  'Machinery',
  'Other',
];

const assetStatuses = [
  'Available',
  'In Use',
  'In Maintenance',
  'Reserved',
  'Retired',
  'Lost',
  'Stolen',
];

const AssetForm = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams();
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  
  const [loading, setLoading] = useState(isEditMode || isViewMode);
  const [initialLoading, setInitialLoading] = useState(isEditMode || isViewMode);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    serialNumber: Yup.string(),
    category: Yup.string().required('Category is required'),
    location: Yup.string().required('Location is required'),
    status: Yup.string().required('Status is required'),
    purchaseDate: Yup.date(),
    purchasePrice: Yup.number().positive('Price must be positive'),
    notes: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      serialNumber: '',
      category: '',
      location: '',
      status: 'Available',
      purchaseDate: '',
      purchasePrice: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        if (isEditMode) {
          await assetApi.updateAsset(id, values);
          setSnackbar({
            open: true,
            message: 'Asset updated successfully',
            severity: 'success',
          });
        } else {
          await assetApi.createAsset(values);
          setSnackbar({
            open: true,
            message: 'Asset created successfully',
            severity: 'success',
          });
          formik.resetForm();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save asset');
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to save asset',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchAsset = async () => {
      if (isEditMode || isViewMode) {
        try {
          const response = await assetApi.getAsset(id);
          const asset = response.data;
          
          // Format date for the form
          if (asset.purchaseDate) {
            const date = new Date(asset.purchaseDate);
            asset.purchaseDate = date.toISOString().split('T')[0];
          }
          
          formik.setValues(asset);
        } catch (err) {
          setError('Failed to fetch asset details');
          setSnackbar({
            open: true,
            message: 'Failed to fetch asset details',
            severity: 'error',
          });
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };

    fetchAsset();
  }, [id, isEditMode, isViewMode]);

  const handleCancel = () => {
    navigate('/assets');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/assets')}
        >
          Assets
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'Edit Asset' : isViewMode ? 'View Asset' : 'Create Asset'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Asset' : isViewMode ? 'View Asset' : 'Create Asset'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Asset Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
                disabled={loading || isViewMode}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="serialNumber"
                name="serialNumber"
                label="Serial Number"
                value={formik.values.serialNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.serialNumber && Boolean(formik.errors.serialNumber)}
                helperText={formik.touched.serialNumber && formik.errors.serialNumber}
                margin="normal"
                disabled={loading || isViewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category *</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  label="Category"
                  disabled={loading || isViewMode}
                  required
                >
                  {assetCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status *</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  label="Status"
                  disabled={loading || isViewMode}
                  required
                >
                  {assetStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
                margin="normal"
                disabled={loading || isViewMode}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="purchaseDate"
                name="purchaseDate"
                label="Purchase Date"
                type="date"
                value={formik.values.purchaseDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purchaseDate && Boolean(formik.errors.purchaseDate)}
                helperText={formik.touched.purchaseDate && formik.errors.purchaseDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled={loading || isViewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="purchasePrice"
                name="purchasePrice"
                label="Purchase Price"
                type="number"
                value={formik.values.purchasePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purchasePrice && Boolean(formik.errors.purchasePrice)}
                helperText={formik.touched.purchasePrice && formik.errors.purchasePrice}
                margin="normal"
                disabled={loading || isViewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                margin="normal"
                multiline
                rows={2}
                disabled={loading || isViewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                margin="normal"
                multiline
                rows={3}
                disabled={loading || isViewMode}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              {isViewMode ? 'Back' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
              </Button>
            )}
            {isViewMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/assets/edit/${id}`)}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssetForm;