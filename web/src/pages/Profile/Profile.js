import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  DevicesOther as DevicesIcon,
  ExitToApp as LogoutIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { userApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const Profile = () => {
  const { user, logout, updateUserInfo } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [devices, setDevices] = useState([]);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutType, setLogoutType] = useState('current'); // 'current' or 'all'
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userApi.getCurrentUser();
      setProfileData(response.data);
      setProfileImagePreview(response.data.profileImage || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionHistory = async () => {
    try {
      const response = await userApi.getSessionHistory();
      setSessionHistory(response.data.sessions);
    } catch (err) {
      console.error('Error fetching session history:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load session history',
        severity: 'error',
      });
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await userApi.getDevices();
      setDevices(response.data.devices);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load devices',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSessionHistory();
    fetchDevices();
  }, []);

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    currentPassword: Yup.string().when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Current password is required to set a new password'),
      otherwise: Yup.string(),
    }),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .test('not-same-as-current', 'New password must be different from current password', function(value) {
        return !value || value !== this.parent.currentPassword;
      }),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      
      if (values.currentPassword && values.newPassword) {
        formData.append('currentPassword', values.currentPassword);
        formData.append('newPassword', values.newPassword);
      }
      
      // Add profile image if changed
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await userApi.updateProfile(formData);
      
      // Update auth context with new user info
      updateUserInfo({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        profileImage: response.data.profileImage || null,
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      
      // Reset password fields
      values.currentPassword = '';
      values.newPassword = '';
      values.confirmPassword = '';
      
      // Update profile data
      setProfileData(response.data);
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setSnackbar({
          open: true,
          message: err.response.data.message,
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update profile. Please try again.',
          severity: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleOpenSessionHistory = () => {
    fetchSessionHistory();
    setShowSessionHistory(true);
  };

  const handleCloseSessionHistory = () => {
    setShowSessionHistory(false);
  };

  const handleOpenDevices = () => {
    fetchDevices();
    setShowDevices(true);
  };

  const handleCloseDevices = () => {
    setShowDevices(false);
  };

  const handleLogoutDevice = async (deviceId) => {
    try {
      await userApi.logoutDevice(deviceId);
      fetchDevices();
      setSnackbar({
        open: true,
        message: 'Device logged out successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error logging out device:', err);
      setSnackbar({
        open: true,
        message: 'Failed to logout device',
        severity: 'error',
      });
    }
  };

  const handleOpenLogoutConfirm = (type) => {
    setLogoutType(type);
    setConfirmLogout(true);
  };

  const handleCloseLogoutConfirm = () => {
    setConfirmLogout(false);
  };

  const handleLogout = async () => {
    try {
      if (logoutType === 'all') {
        await userApi.logoutAllDevices();
      }
      logout();
    } catch (err) {
      console.error('Error logging out:', err);
      setSnackbar({
        open: true,
        message: 'Failed to logout',
        severity: 'error',
      });
      setConfirmLogout(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Formik
              initialValues={{
                firstName: profileData?.firstName || '',
                lastName: profileData?.lastName || '',
                email: profileData?.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
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
                  <Grid container spacing={3}>
                    <Grid item xs={12} display="flex" justifyContent="center">
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={profileImagePreview}
                          sx={{ width: 100, height: 100, mb: 2 }}
                        >
                          {!profileImagePreview && (
                            <AccountCircleIcon sx={{ fontSize: 60 }} />
                          )}
                        </Avatar>
                        <input
                          accept="image/*"
                          id="profile-image-input"
                          type="file"
                          onChange={handleProfileImageChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="profile-image-input">
                          <IconButton
                            color="primary"
                            aria-label="upload picture"
                            component="span"
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              right: -10,
                              backgroundColor: 'background.paper',
                              '&:hover': { backgroundColor: 'background.default' },
                            }}
                          >
                            <PhotoCameraIcon />
                          </IconButton>
                        </label>
                      </Box>
                    </Grid>

                    {profileImagePreview && (
                      <Grid item xs={12} display="flex" justifyContent="center">
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={handleRemoveProfileImage}
                        >
                          Remove Photo
                        </Button>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Change Password
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="currentPassword"
                        name="currentPassword"
                        label="Current Password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.currentPassword && Boolean(errors.currentPassword)}
                        helperText={touched.currentPassword && errors.currentPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.newPassword && Boolean(errors.newPassword)}
                        helperText={touched.newPassword && errors.newPassword}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Account Information" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Username:</strong> {profileData?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Role:</strong> {profileData?.role?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Account Created:</strong> {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Last Login:</strong> {profileData?.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Security & Sessions" />
            <List>
              <ListItem button onClick={handleOpenSessionHistory}>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText primary="Login History" secondary="View your recent login activity" />
              </ListItem>
              
              <ListItem button onClick={handleOpenDevices}>
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText primary="Active Sessions" secondary="Manage your active sessions" />
              </ListItem>
              
              <ListItem button onClick={() => handleOpenLogoutConfirm('current')}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" secondary="Sign out from current session" />
              </ListItem>
              
              <ListItem button onClick={() => handleOpenLogoutConfirm('all')}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Logout from All Devices" secondary="Sign out from all active sessions" />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Session History Dialog */}
      <Dialog
        open={showSessionHistory}
        onClose={handleCloseSessionHistory}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Login History</DialogTitle>
        <DialogContent>
          {sessionHistory.length === 0 ? (
            <Typography>No login history available</Typography>
          ) : (
            <List>
              {sessionHistory.map((session, index) => (
                <ListItem key={index} divider={index < sessionHistory.length - 1}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {new Date(session.timestamp).toLocaleString()}
                        </Typography>
                        {session.current && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          IP: {session.ipAddress}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Device: {session.device}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Browser: {session.browser}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSessionHistory}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Active Devices Dialog */}
      <Dialog
        open={showDevices}
        onClose={handleCloseDevices}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Active Sessions</DialogTitle>
        <DialogContent>
          {devices.length === 0 ? (
            <Typography>No active sessions</Typography>
          ) : (
            <List>
              {devices.map((device) => (
                <ListItem
                  key={device.id}
                  secondaryAction={
                    device.current ? (
                      <Chip label="Current Session" color="primary" size="small" />
                    ) : (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleLogoutDevice(device.id)}
                      >
                        Logout
                      </Button>
                    )
                  }
                  divider
                >
                  <ListItemIcon>
                    <DevicesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={device.device}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          Last active: {new Date(device.lastActive).toLocaleString()}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          IP: {device.ipAddress}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Browser: {device.browser}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDevices}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={confirmLogout}
        onClose={handleCloseLogoutConfirm}
      >
        <DialogTitle>
          {logoutType === 'all' ? 'Logout from All Devices?' : 'Logout?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {logoutType === 'all'
              ? 'This will terminate all active sessions across all your devices. You will need to log in again on each device.'
              : 'Are you sure you want to log out from your current session?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogoutConfirm}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

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

export default Profile;