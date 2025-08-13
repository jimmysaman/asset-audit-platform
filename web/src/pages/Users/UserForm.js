import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { userApi, roleApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isEditMode = Boolean(id);
  const isViewMode = isEditMode && window.location.pathname.includes('/view/');

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleApi.getRoles();
        setRoles(response.data.roles);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load roles. Please try again.',
          severity: 'error',
        });
      }
    };

    const fetchUser = async () => {
      try {
        const response = await userApi.getUser(id);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load user. Please try again.',
          severity: 'error',
        });
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
    if (isEditMode) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id, isEditMode, navigate]);

  const initialValues = {
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    roleId: user?.roleId || '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: isEditMode
      ? Yup.string()
      : Yup.string()
          .required('Password is required')
          .min(8, 'Password must be at least 8 characters'),
    confirmPassword: isEditMode
      ? Yup.string().oneOf([Yup.ref('password'), ''], 'Passwords must match')
      : Yup.string()
          .oneOf([Yup.ref('password'), ''], 'Passwords must match')
          .required('Confirm password is required'),
    roleId: Yup.string().required('Role is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Remove confirmPassword before sending to API
      const userData = { ...values };
      delete userData.confirmPassword;

      // If password is empty in edit mode, remove it
      if (isEditMode && !userData.password) {
        delete userData.password;
      }

      if (isEditMode) {
        await userApi.updateUser(id, userData);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        await userApi.createUser(userData);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      }

      // Navigate back to user list after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`,
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

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if current user is trying to edit their own role
  const isSelfEdit = isEditMode && currentUser?.id === parseInt(id);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isViewMode ? 'User Details' : isEditMode ? 'Edit User' : 'Create User'}
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
          }) => (
            <Form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                id="username"
                name="username"
                label="Username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
                disabled={isViewMode || isSubmitting}
              />

              <TextField
                fullWidth
                margin="normal"
                id="email"
                name="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={isViewMode || isSubmitting}
              />

              {!isViewMode && (
                <>
                  <TextField
                    fullWidth
                    margin="normal"
                    id="password"
                    name="password"
                    label={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    disabled={isSubmitting}
                  />
                </>
              )}

              <FormControl
                fullWidth
                margin="normal"
                error={touched.roleId && Boolean(errors.roleId)}
                disabled={isViewMode || isSubmitting || isSelfEdit}
              >
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="roleId"
                  name="roleId"
                  value={values.roleId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {touched.roleId && errors.roleId && (
                  <FormHelperText>{errors.roleId}</FormHelperText>
                )}
                {isSelfEdit && (
                  <FormHelperText>You cannot change your own role</FormHelperText>
                )}
              </FormControl>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {!isViewMode && (
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
                      ? 'Update User'
                      : 'Create User'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
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

export default UserForm;