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
  Avatar,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { userApi, auditLogApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user details
      const userResponse = await userApi.getById(id);
      setUser(userResponse.data);

      // Fetch recent audit logs for this user
      try {
        const logsResponse = await auditLogApi.getUserLogs(id);
        setRecentLogs(logsResponse.data.slice(0, 10) || []);
      } catch (logError) {
        // Audit logs might not be accessible, continue without them
        console.warn('Could not fetch audit logs:', logError);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setUpdating(true);
    try {
      const updatedUser = await userApi.update(id, {
        isActive: !user.isActive,
      });

      setUser(updatedUser.data);
      setSnackbar({
        open: true,
        message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
        severity: 'success',
      });
      setToggleDialogOpen(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update user status',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = () => {
    navigate(`/users/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/users');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const canEdit = () => {
    return currentUser?.role === 'Admin' && currentUser?.id !== id;
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

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">User not found</Alert>
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
          Users
        </Link>
        <Typography color="text.primary">{user.firstName} {user.lastName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              bgcolor: user.isActive ? 'primary.main' : 'grey.400',
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              @{user.username}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Users
          </Button>
          {canEdit() && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit User
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1">{user.username}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      label={user.role?.name || 'No role assigned'}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(user.createdAt)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(user.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentLogs.length > 0 ? (
              <List>
                {recentLogs.map((log) => (
                  <ListItem key={log.id} divider>
                    <ListItemText
                      primary={`${log.action} - ${log.entityType}`}
                      secondary={`${formatDateTime(log.timestamp)} - ${log.description || 'No description'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No recent activity</Typography>
            )}
          </Paper>
        </Grid>

        {/* Status and Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {user.isActive ? (
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
              ) : (
                <BlockIcon sx={{ mr: 1, color: 'error.main' }} />
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  color={user.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            </Box>

            {canEdit() && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={user.isActive}
                      onChange={() => setToggleDialogOpen(true)}
                      color="primary"
                    />
                  }
                  label={user.isActive ? 'Deactivate User' : 'Activate User'}
                />
              </Box>
            )}
          </Paper>

          {/* Role Permissions */}
          {user.role && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Role & Permissions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">{user.role.name}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">
                  {user.role.description || 'No description available'}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/roles/${user.role.id}`)}
              >
                View Role Details
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Toggle Status Dialog */}
      <Dialog open={toggleDialogOpen} onClose={() => setToggleDialogOpen(false)}>
        <DialogTitle>
          {user.isActive ? 'Deactivate User' : 'Activate User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {user.isActive ? 'deactivate' : 'activate'} this user?
            {user.isActive && ' The user will no longer be able to access the system.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleToggleStatus}
            color={user.isActive ? 'error' : 'success'}
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : (user.isActive ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetail;
