import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { settingsApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await settingsApi.getSettings();
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const validationSchema = Yup.object({
    companyName: Yup.string().required('Company name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    auditLogRetentionDays: Yup.number()
      .integer('Must be a whole number')
      .min(1, 'Must be at least 1 day')
      .max(3650, 'Cannot exceed 10 years (3650 days)')
      .required('Retention period is required'),
    backupSchedule: Yup.string().required('Backup schedule is required'),
    maxFileSize: Yup.number()
      .integer('Must be a whole number')
      .min(1, 'Must be at least 1 MB')
      .max(100, 'Cannot exceed 100 MB')
      .required('Max file size is required'),
    allowedFileTypes: Yup.string().required('Allowed file types are required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await settingsApi.updateSettings(values);
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating settings:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update settings. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setBackupLoading(true);
      const response = await settingsApi.backupDatabase();
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `asset-audit-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'Database backup created successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error creating backup:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create database backup. Please try again.',
        severity: 'error',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreDatabase = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create a FormData object
    const formData = new FormData();
    formData.append('backup', file);

    try {
      setRestoreLoading(true);
      await settingsApi.restoreDatabase(formData);
      
      setSnackbar({
        open: true,
        message: 'Database restored successfully. The application will restart.',
        severity: 'success',
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Error restoring database:', err);
      setSnackbar({
        open: true,
        message: 'Failed to restore database. Please try again.',
        severity: 'error',
      });
    } finally {
      setRestoreLoading(false);
      // Reset the file input
      event.target.value = null;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has permission to access settings
  const canManageSettings = user?.permissions?.includes('settings.manage');

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!canManageSettings ? (
        <Alert severity="warning">
          You don't have permission to manage system settings.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Formik
                  initialValues={settings || {
                    companyName: '',
                    email: '',
                    enableAuditLog: true,
                    auditLogRetentionDays: 365,
                    backupSchedule: 'weekly',
                    maxFileSize: 10,
                    allowedFileTypes: 'jpg,jpeg,png,pdf',
                    enableEmailNotifications: false,
                    enableTwoFactorAuth: false,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Typography variant="h6" gutterBottom>
                        General Settings
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="companyName"
                            name="companyName"
                            label="Company Name"
                            value={values.companyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.companyName && Boolean(errors.companyName)}
                            helperText={touched.companyName && errors.companyName}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="System Email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="h6" gutterBottom>
                        Audit & Security
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                id="enableAuditLog"
                                name="enableAuditLog"
                                checked={values.enableAuditLog}
                                onChange={handleChange}
                              />
                            }
                            label="Enable Audit Logging"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="auditLogRetentionDays"
                            name="auditLogRetentionDays"
                            label="Audit Log Retention (Days)"
                            type="number"
                            value={values.auditLogRetentionDays}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.auditLogRetentionDays && Boolean(errors.auditLogRetentionDays)}
                            helperText={touched.auditLogRetentionDays && errors.auditLogRetentionDays}
                            margin="normal"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip title="Number of days to keep audit logs before automatic deletion">
                                    <InfoIcon color="action" fontSize="small" />
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                id="enableTwoFactorAuth"
                                name="enableTwoFactorAuth"
                                checked={values.enableTwoFactorAuth}
                                onChange={handleChange}
                              />
                            }
                            label="Enable Two-Factor Authentication"
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="h6" gutterBottom>
                        Backup & Maintenance
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="backupSchedule"
                            name="backupSchedule"
                            select
                            label="Automatic Backup Schedule"
                            value={values.backupSchedule}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.backupSchedule && Boolean(errors.backupSchedule)}
                            helperText={touched.backupSchedule && errors.backupSchedule}
                            margin="normal"
                            SelectProps={{
                              native: false,
                            }}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="never">Never</option>
                          </TextField>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="h6" gutterBottom>
                        File Upload Settings
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="maxFileSize"
                            name="maxFileSize"
                            label="Maximum File Size (MB)"
                            type="number"
                            value={values.maxFileSize}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.maxFileSize && Boolean(errors.maxFileSize)}
                            helperText={touched.maxFileSize && errors.maxFileSize}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="allowedFileTypes"
                            name="allowedFileTypes"
                            label="Allowed File Types"
                            value={values.allowedFileTypes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.allowedFileTypes && Boolean(errors.allowedFileTypes)}
                            helperText={
                              (touched.allowedFileTypes && errors.allowedFileTypes) ||
                              'Comma-separated list of file extensions (e.g., jpg,png,pdf)'
                            }
                            margin="normal"
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="h6" gutterBottom>
                        Notifications
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                id="enableEmailNotifications"
                                name="enableEmailNotifications"
                                checked={values.enableEmailNotifications}
                                onChange={handleChange}
                              />
                            }
                            label="Enable Email Notifications"
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={fetchSettings}
                          sx={{ mr: 2 }}
                          disabled={isSubmitting}
                        >
                          Reset
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </Box>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Database Management" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Create a backup of your database or restore from a previous backup.
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={backupLoading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                      onClick={handleBackupDatabase}
                      disabled={backupLoading || restoreLoading}
                    >
                      {backupLoading ? 'Creating Backup...' : 'Backup Database'}
                    </Button>

                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={restoreLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      disabled={backupLoading || restoreLoading}
                    >
                      {restoreLoading ? 'Restoring...' : 'Restore Database'}
                      <input
                        type="file"
                        hidden
                        accept=".zip"
                        onChange={handleRestoreDatabase}
                      />
                    </Button>
                  </Box>
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
                    Warning: Restoring from a backup will overwrite all current data. This action cannot be undone.
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardHeader title="System Information" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Version:</strong> {settings?.version || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Last Backup:</strong> {settings?.lastBackup ? new Date(settings.lastBackup).toLocaleString() : 'Never'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Database Size:</strong> {settings?.databaseSize || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Storage Used:</strong> {settings?.storageUsed || 'Unknown'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

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

export default Settings;