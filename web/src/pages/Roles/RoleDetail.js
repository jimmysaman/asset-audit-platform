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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { roleApi, userApi } from '../../services/api';

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoleDetails();
  }, [id]);

  const fetchRoleDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch role details
      const roleResponse = await roleApi.getById(id);
      setRole(roleResponse.data);

      // Fetch users with this role
      try {
        const usersResponse = await userApi.getAll({ roleId: id });
        setUsers(usersResponse.data.users || []);
      } catch (userError) {
        console.warn('Could not fetch users:', userError);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch role details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/roles/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/roles');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderPermissionValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
      ) : (
        <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
      );
    }
    return String(value);
  };

  const renderPermissions = (permissions) => {
    if (!permissions || typeof permissions !== 'object') {
      return <Typography color="text.secondary">No permissions defined</Typography>;
    }

    const permissionCategories = Object.keys(permissions);

    return (
      <Box>
        {permissionCategories.map((category) => (
          <Accordion key={category} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {category}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Permission</strong></TableCell>
                      <TableCell align="center"><strong>Granted</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(permissions[category] || {}).map(([permission, value]) => (
                      <TableRow key={permission}>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {permission}
                        </TableCell>
                        <TableCell align="center">
                          {renderPermissionValue(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
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

  if (!role) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Role not found</Alert>
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
          Roles
        </Link>
        <Typography color="text.primary">{role.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BadgeIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              {role.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Role ID: {role.id}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Roles
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Role
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Role Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Role Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role Name
                    </Typography>
                    <Typography variant="body1">{role.name}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {role.description || 'No description provided'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(role.createdAt)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(role.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Permissions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Permissions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {renderPermissions(role.permissions)}
          </Paper>
        </Grid>

        {/* Users with this Role */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Users with this Role ({users.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {users.length > 0 ? (
              <List>
                {users.map((user) => (
                  <ListItem
                    key={user.id}
                    divider
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No users assigned to this role
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleDetail;
