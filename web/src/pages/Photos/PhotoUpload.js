import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { photoApi, assetApi } from '../../services/api';
import MobileCamera from '../../components/MobileCamera';

const PhotoUpload = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await assetApi.getAssets({ limit: 1000 });
        setAssets(response.data.assets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load assets. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  const validationSchema = Yup.object({
    assetId: Yup.string().required('Asset is required'),
    description: Yup.string().max(500, 'Description must be less than 500 characters'),
    photo: Yup.mixed().required('Photo is required'),
  });

  const handleFileChange = (event, setFieldValue, setFieldTouched) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('photo', file);
      setFieldTouched('photo', true, true);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoData, setFieldValue, setFieldTouched) => {
    const { file, location } = photoData;

    setSelectedFile(file);
    setLocationData(location);
    setFieldValue('photo', file);
    setFieldTouched('photo', true, true);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setCameraOpen(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('assetId', values.assetId);
      formData.append('description', values.description || '');
      formData.append('photo', values.photo);

      await photoApi.uploadPhoto(formData);

      setSnackbar({
        open: true,
        message: 'Photo uploaded successfully',
        severity: 'success',
      });

      // Reset form and preview
      resetForm();
      setPreviewUrl('');

      // Navigate back to photo list after a short delay
      setTimeout(() => {
        navigate('/photos');
      }, 1500);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to upload photo',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Upload Asset Photo
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Formik
          initialValues={{
            assetId: '',
            description: '',
            photo: null,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            setFieldValue,
            setFieldTouched,
          }) => (
            <Form>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={touched.assetId && Boolean(errors.assetId)}
                    disabled={loadingAssets || isSubmitting}
                  >
                    <InputLabel id="asset-select-label">Asset</InputLabel>
                    <Select
                      labelId="asset-select-label"
                      id="assetId"
                      name="assetId"
                      value={values.assetId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Asset"
                    >
                      {loadingAssets ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading assets...
                        </MenuItem>
                      ) : assets.length === 0 ? (
                        <MenuItem disabled>No assets available</MenuItem>
                      ) : (
                        assets.map((asset) => (
                          <MenuItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.serialNumber || 'No S/N'})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {touched.assetId && errors.assetId && (
                      <FormHelperText>{errors.assetId}</FormHelperText>
                    )}
                  </FormControl>

                  <TextField
                    fullWidth
                    margin="normal"
                    id="description"
                    name="description"
                    label="Description (Optional)"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    disabled={isSubmitting}
                    multiline
                    rows={3}
                    placeholder="Describe what's in this photo, its condition, or any relevant details..."
                  />

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        type="file"
                        onChange={(e) => handleFileChange(e, setFieldValue, setFieldTouched)}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                          disabled={isSubmitting}
                        >
                          Select Photo
                        </Button>
                      </label>

                      {isMobile && (
                        <Button
                          variant="contained"
                          startIcon={<PhotoCameraIcon />}
                          onClick={() => setCameraOpen(true)}
                          disabled={isSubmitting}
                        >
                          Take Photo
                        </Button>
                      )}
                    </Box>

                    {locationData && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          📍 GPS: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                          (±{Math.round(locationData.accuracy)}m)
                        </Typography>
                      </Box>
                    )}

                    {touched.photo && errors.photo && (
                      <FormHelperText error>{errors.photo}</FormHelperText>
                    )}
                    {values.photo && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected: {values.photo.name} ({Math.round(values.photo.size / 1024)} KB)
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? <CircularProgress size={20} /> : <PhotoCameraIcon />
                      }
                    >
                      {isSubmitting ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/photos')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>

                {previewUrl && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Preview
                    </Typography>
                    <Card>
                      <CardMedia
                        component="img"
                        image={previewUrl}
                        alt="Photo preview"
                        sx={{ height: 300, objectFit: 'contain' }}
                      />
                    </Card>
                  </Box>
                )}
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      {/* Mobile Camera Component */}
      <MobileCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(photoData) => {
          // We'll handle this in a simpler way
          const { file, location } = photoData;
          setSelectedFile(file);
          setLocationData(location);

          // Create preview URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(file);

          setCameraOpen(false);
        }}
        title="Take Asset Photo"
      />

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

export default PhotoUpload;