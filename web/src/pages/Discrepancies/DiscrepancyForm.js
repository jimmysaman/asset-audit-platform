import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Autocomplete,
  Chip,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { discrepancyApi, assetApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const DiscrepancyForm = () => {
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
    description: Yup.string().required('Description is required'),
    discrepancyDate: Yup.date().required('Discrepancy date is required'),
    severity: Yup.string().required('Severity is required'),
  });

  const formik = useFormik({
    initialValues: {
      assetId: '',
      description: '',
      discrepancyDate: new Date().toISOString().split('T')[0],
      severity: 'Medium',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const discrepancyData = {
          ...values,
          reportedBy: user.id,
        };
        
        if (isEditMode) {
          await discrepancyApi.updateDiscrepancy(id, discrepancyData);
          setSnackbar({
            open: true,
            message: 'Discrepancy updated successfully',
            severity: 'success',
          });
        } else {
          await discrepancyApi.createDiscrepancy(discrepancyData);
          setSnackbar({
            open: true,
            message: 'Discrepancy reported successfully',
            severity: 'success',
          });
          formik.resetForm();
          // Reset to current date
          formik.setFieldValue('discrepancyDate', new Date().toISOString().split('T')[0]);
          formik.setFieldValue('severity', 'Medium');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save discrepancy');
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to save discrepancy',
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
    const fetchDiscrepancy = async () => {
      if (isEditMode || isViewMode) {
        try {
          const response = await discrepancyApi.getDiscrepancy(id);
          const discrepancy = response.data;
          
          // Format date for the form
          if (discrepancy.discrepancyDate) {
            const date = new Date(discrepancy.discrepancyDate);
            discrepancy.discrepancyDate = date.toISOString().split('T')[0];
          }
          
          formik.setValues({
            assetId: discrepancy.assetId,
            description: discrepancy.description,
            discrepancyDate: discrepancy.discrepancyDate,
            severity: discrepancy.severity || 'Medium',
            notes: discrepancy.notes || '',
          });
        } catch (err) {
          setError('Failed to fetch discrepancy details');
          setSnackbar({
            open: true,
            message: 'Failed to fetch discrepancy details',
            severity: 'error',
          });
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };

    fetchDiscrepancy();
  }, [id, isEditMode, isViewMode]);

  const handleCancel = () => {
    navigate('/discrepancies');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low':
        return 'info';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'error';
      default:
        return 'default';
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
          onClick={() => navigate('/discrepancies')}
        >
          Discrepancies
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'Edit Discrepancy' : isViewMode ? 'View Discrepancy' : 'Report Discrepancy'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Discrepancy' : isViewMode ? 'View Discrepancy' : 'Report Discrepancy'}
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
              <TextField
                fullWidth
                id="discrepancyDate"
                name="discrepancyDate"
                label="Discrepancy Date"
                type="date"
                value={formik.values.discrepancyDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.discrepancyDate && Boolean(formik.errors.discrepancyDate)}
                helperText={formik.touched.discrepancyDate && formik.errors.discrepancyDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled={loading || isViewMode}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Severity *
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['Low', 'Medium', 'High'].map((severity) => (
                    <Chip
                      key={severity}
                      label={severity}
                      color={getSeverityColor(severity)}
                      onClick={() => !isViewMode && formik.setFieldValue('severity', severity)}
                      variant={formik.values.severity === severity ? 'filled' : 'outlined'}
                      sx={{ cursor: isViewMode ? 'default' : 'pointer' }}
                    />
                  ))}
                </Box>
                {formik.touched.severity && formik.errors.severity && (
                  <Typography color="error" variant="caption">
                    {formik.errors.severity}
                  </Typography>
                )}
              </Box>
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
                rows={3}
                disabled={loading || isViewMode}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Additional Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                margin="normal"
                multiline
                rows={2}
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
                {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Report'}
              </Button>
            )}
            {isViewMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/discrepancies/edit/${id}`)}
                disabled={formik.values.resolved}
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

export default DiscrepancyForm;