import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as UserIcon,
  Assignment as AuditorIcon,
} from '@mui/icons-material';
import { roleApi } from '../../services/api';

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRoles, setTotalRoles] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await roleApi.getRoles({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
      });
      setRoles(response.data.roles);
      setTotalRoles(response.data.total);
    } catch (err) {
      setError('Failed to fetch roles. Please try again.');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handleSearch = () => {
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchRoles();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchRoles();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddRole = () => {
    navigate('/roles/create');
  };

  const handleEditRole = (id) => {
    navigate(`/roles/edit/${id}`);
  };

  const handleViewRole = (id) => {
    navigate(`/roles/view/${id}`);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await roleApi.deleteRole(roleToDelete.id);
      setSnackbar({
        open: true,
        message: 'Role deleted successfully',
        severity: 'success',
      });
      fetchRoles();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete role',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getRoleIcon = (name) => {
    switch (name) {
      case 'Admin':
        return <AdminIcon color="primary" />;
      case 'Auditor':
        return <AuditorIcon color="secondary" />;
      case 'User':
        return <UserIcon color="success" />;
      default:
        return <UserIcon color="action" />;
    }
  };

  const getRoleChip = (name) => {
    let color = 'default';
    switch (name) {
      case 'Admin':
        color = 'primary';
        break;
      case 'Auditor':
        color = 'secondary';
        break;
      case 'User':
        color = 'success';
        break;
      default:
        color = 'default';
    }
    return <Chip label={name} color={color} size="small" icon={getRoleIcon(name)} />;
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Role Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => getRoleChip(params.value),
    },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 250 },
    {
      field: 'userCount',
      headerName: 'Users',
      flex: 0.5,
      minWidth: 100,
      valueGetter: (params) => params.row.users?.length || 0,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => {
        // Don't allow deleting default roles
        const isDefaultRole = ['Admin', 'User', 'Auditor'].includes(params.row.name);
        const hasUsers = params.row.users?.length > 0;

        return (
          <Box>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleViewRole(params.row.id)}
              title="View"
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              color="secondary"
              size="small"
              onClick={() => handleEditRole(params.row.id)}
              title="Edit"
              disabled={isDefaultRole}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              disabled={isDefaultRole || hasUsers}
              title={
                isDefaultRole
                  ? "Can't delete default role"
                  : hasUsers
                  ? 'Role has users assigned'
                  : 'Delete'
              }
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Roles</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
        >
          Add Role
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Roles"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={roles}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          rowCount={totalRoles}
          paginationMode="server"
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete role <strong>{roleToDelete?.name}</strong>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default RoleList;