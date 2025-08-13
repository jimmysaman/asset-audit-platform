import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { roleApi } from '../../services/api';

const RoleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isViewMode = isEditMode && window.location.pathname.includes('/view/');

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [permissions, setPermissions] = useState([
    { name: 'assets', label: 'Assets', actions: ['view', 'create', 'edit', 'delete'] },
    { name: 'movements', label: 'Movements', actions: ['view', 'create', 'edit', 'delete'] },
    { name: 'discrepancies', label: 'Discrepancies', actions: ['view', 'create', 'edit', 'delete', 'resolve'] },
    { name: 'photos', label: 'Photos', actions: ['view', 'upload', 'delete'] },
    { name: 'users', label: 'Users', actions: ['view', 'create', 'edit', 'delete'] },
    { name: 'roles', label: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
    { name: 'auditLogs', label: 'Audit Logs', actions: ['view'] },
    { name: 'reports', label: 'Reports', actions: ['view', 'export'] },
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await roleApi.getRole(id);
        setRole(response.data);
      } catch (error) {
        console.error('Error fetching role:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load role. Please try again.',
          severity: 'error',
        });
        navigate('/roles');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchRole();
    } else {
      setLoading(false);
    }
  }, [id, isEditMode, navigate]);

  const initialValues = {
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || {},
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Role name is required').max(50, 'Role name must be less than 50 characters'),
    description: Yup.string().max(255, 'Description must be less than 255 characters'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await roleApi.updateRole(id, values);
        setSnackbar({
          open: true,
          message: 'Role updated successfully',
          severity: 'success',
        });
      } else {
        await roleApi.createRole(values);
        setSnackbar({
          open: true,
          message: 'Role created successfully',
          severity: 'success',
        });
      }

      // Navigate back to role list after a short delay
      setTimeout(() => {
        navigate('/roles');
      }, 1500);
    } catch (error) {
      console.error('Error saving role:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} role`,
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if this is a default role that shouldn't be editable
  const isDefaultRole = isEditMode && ['Admin', 'User', 'Auditor'].includes(role?.name);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isViewMode ? 'Role Details' : isEditMode ? 'Edit Role' : 'Create Role'}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Formik
          initialValues={initialValues}
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
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                id="name"
                name="name"
                label="Role Name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                disabled={isViewMode || isSubmitting || isDefaultRole}
              />

              <TextField
                fullWidth
                margin="normal"
                id="description"
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                disabled={isViewMode || isSubmitting || isDefaultRole}
                multiline
                rows={3}
              />

              {isDefaultRole && (
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  This is a default system role and cannot be modified.
                </Alert>
              )}

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Permissions
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                {permissions.map((permission) => (
                  <Grid item xs={12} sm={6} key={permission.name}>
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {permission.label}
                      </Typography>

                      {permission.actions.map((action) => {
                        const fieldName = `permissions.${permission.name}.${action}`;
                        const isChecked = values.permissions?.[permission.name]?.[action] || false;

                        return (
                          <FormControlLabel
                            key={action}
                            control={
                              <Checkbox
                                name={fieldName}
                                checked={isChecked}
                                onChange={(e) => {
                                  setFieldValue(fieldName, e.target.checked);
                                }}
                                disabled={isViewMode || isSubmitting || isDefaultRole}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                  {action}
                                </Typography>
                                {action === 'view' && (
                                  <Chip
                                    label="Required"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ ml: 1, height: 20, fontSize: '0.6rem' }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        );
                      })}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {!isViewMode && !isDefaultRole && (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                    startIcon={isSubmitting && <CircularProgress size={20} />}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : isEditMode
                      ? 'Update Role'
                      : 'Create Role'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/roles')}
                  disabled={isSubmitting}
                >
                  {isViewMode ? 'Back' : 'Cancel'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
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

export default RoleForm;