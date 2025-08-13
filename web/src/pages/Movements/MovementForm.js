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
  Autocomplete,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { movementApi, assetApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const movementTypes = [
  'Check-in',
  'Check-out',
  'Transfer',
  'Maintenance',
  'Disposal',
];

const MovementForm = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams();
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(isEditMode || isViewMode);
  const [initialLoading, setInitialLoading] = useState(isEditMode || isViewMode);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const validationSchema = Yup.object({
    assetId: Yup.string().required('Asset is required'),
    type: Yup.string().required('Movement type is required'),
    fromLocation: Yup.string().required('From location is required'),
    toLocation: Yup.string().when('type', {
      is: (val) => val !== 'Disposal',
      then: Yup.string().required('To location is required'),
      otherwise: Yup.string(),
    }),
    movementDate: Yup.date().required('Movement date is required'),
    notes: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      assetId: '',
      type: '',
      fromLocation: '',
      toLocation: '',
      movementDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const movementData = {
          ...values,
          performedBy: user.id,
        };
        
        if (isEditMode) {
          await movementApi.updateMovement(id, movementData);
          setSnackbar({
            open: true,
            message: 'Movement updated successfully',
            severity: 'success',
          });
        } else {
          await movementApi.createMovement(movementData);
          setSnackbar({
            open: true,
            message: 'Movement recorded successfully',
            severity: 'success',
          });
          formik.resetForm();
          // Reset to current date
          formik.setFieldValue('movementDate', new Date().toISOString().split('T')[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save movement');
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to save movement',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchAssets = async () => {
      setLoadingAssets(true);
      try {
        const response = await assetApi.getAssets({ limit: 100 });
        setAssets(response.data.assets);
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    const fetchMovement = async () => {
      if (isEditMode || isViewMode) {
        try {
          const response = await movementApi.getMovement(id);
          const movement = response.data;
          
          // Format date for the form
          if (movement.movementDate) {
            const date = new Date(movement.movementDate);
            movement.movementDate = date.toISOString().split('T')[0];
          }
          
          formik.setValues({
            assetId: movement.assetId,
            type: movement.type,
            fromLocation: movement.fromLocation,
            toLocation: movement.toLocation || '',
            movementDate: movement.movementDate,
            notes: movement.notes || '',
          });
        } catch (err) {
          setError('Failed to fetch movement details');
          setSnackbar({
            open: true,
            message: 'Failed to fetch movement details',
            severity: 'error',
          });
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };

    fetchMovement();
  }, [id, isEditMode, isViewMode]);

  const handleCancel = () => {
    navigate('/movements');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Handle movement type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    formik.setFieldValue('type', type);
    
    // Clear toLocation for Disposal type
    if (type === 'Disposal') {
      formik.setFieldValue('toLocation', 'Disposed');
    } else if (formik.values.toLocation === 'Disposed') {
      formik.setFieldValue('toLocation', '');
    }
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
          onClick={() => navigate('/movements')}
        >
          Movements
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'Edit Movement' : isViewMode ? 'View Movement' : 'Record Movement'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Movement' : isViewMode ? 'View Movement' : 'Record Movement'}
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
              <Autocomplete
                id="assetId"
                options={assets}
                getOptionLabel={(option) => option.name || ''}
                loading={loadingAssets}
                value={assets.find(asset => asset.id === formik.values.assetId) || null}
                onChange={(event, newValue) => {
                  formik.setFieldValue('assetId', newValue ? newValue.id : '');
                  // If this is a new movement, set the fromLocation to the asset's current location
                  if (!isEditMode && newValue) {
                    formik.setFieldValue('fromLocation', newValue.location || '');
                  }
                }}
                disabled={loading || isViewMode}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Asset"
                    margin="normal"
                    required
                    error={formik.touched.assetId && Boolean(formik.errors.assetId)}
                    helperText={formik.touched.assetId && formik.errors.assetId}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loadingAssets ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="type-label">Movement Type *</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={handleTypeChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  label="Movement Type"
                  disabled={loading || isViewMode}
                  required
                >
                  {movementTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="fromLocation"
                name="fromLocation"
                label="From Location"
                value={formik.values.fromLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fromLocation && Boolean(formik.errors.fromLocation)}
                helperText={formik.touched.fromLocation && formik.errors.fromLocation}
                margin="normal"
                disabled={loading || isViewMode}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="toLocation"
                name="toLocation"
                label="To Location"
                value={formik.values.toLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.toLocation && Boolean(formik.errors.toLocation)}
                helperText={formik.touched.toLocation && formik.errors.toLocation}
                margin="normal"
                disabled={loading || isViewMode || formik.values.type === 'Disposal'}
                required={formik.values.type !== 'Disposal'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="movementDate"
                name="movementDate"
                label="Movement Date"
                type="datetime-local"
                value={formik.values.movementDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.movementDate && Boolean(formik.errors.movementDate)}
                helperText={formik.touched.movementDate && formik.errors.movementDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled={loading || isViewMode}
                required
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
                {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Record Movement'}
              </Button>
            )}
            {isViewMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/movements/edit/${id}`)}
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

export default MovementForm;