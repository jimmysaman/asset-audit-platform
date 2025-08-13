import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { auditLogApi } from '../../services/api';

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [exportLoading, setExportLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await auditLogApi.getAuditLogs({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
        action: actionFilter,
        entity: entityFilter,
      });
      setLogs(response.data.logs);
      setTotalLogs(response.data.total);
    } catch (err) {
      setError('Failed to fetch audit logs. Please try again.');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handleSearch = () => {
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchLogs();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('');
    setEntityFilter('');
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchLogs();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExportLogs = async () => {
    try {
      setExportLoading(true);
      const response = await auditLogApi.exportAuditLogs({
        search: searchTerm,
        action: actionFilter,
        entity: entityFilter,
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'Audit logs exported successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      setSnackbar({
        open: true,
        message: 'Failed to export audit logs',
        severity: 'error',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getActionChip = (action) => {
    let color = 'default';
    let icon = <InfoIcon fontSize="small" />;

    switch (action) {
      case 'CREATE':
        color = 'success';
        icon = <SuccessIcon fontSize="small" />;
        break;
      case 'UPDATE':
        color = 'primary';
        icon = <InfoIcon fontSize="small" />;
        break;
      case 'DELETE':
        color = 'error';
        icon = <ErrorIcon fontSize="small" />;
        break;
      case 'LOGIN':
      case 'LOGOUT':
        color = 'secondary';
        icon = <InfoIcon fontSize="small" />;
        break;
      case 'RESOLVE':
        color = 'success';
        icon = <SuccessIcon fontSize="small" />;
        break;
      default:
        color = 'default';
        icon = <InfoIcon fontSize="small" />;
    }

    return (
      <Chip
        label={action}
        color={color}
        size="small"
        icon={icon}
      />
    );
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => getActionChip(params.value),
    },
    { field: 'entity', headerName: 'Entity', flex: 1, minWidth: 120 },
    { field: 'entityId', headerName: 'Entity ID', flex: 0.7, minWidth: 100 },
    { field: 'username', headerName: 'User', flex: 1, minWidth: 150 },
    { field: 'ipAddress', headerName: 'IP Address', flex: 1, minWidth: 130 },
    {
      field: 'details',
      headerName: 'Details',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => {
        let details = params.value;
        if (typeof details === 'object') {
          details = JSON.stringify(details);
        }
        return (
          <Typography variant="body2" noWrap title={details}>
            {details}
          </Typography>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Audit Logs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExportLogs}
          disabled={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export CSV'}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            label="Search Logs"
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
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="action-filter-label">Action</InputLabel>
            <Select
              labelId="action-filter-label"
              id="action-filter"
              value={actionFilter}
              label="Action"
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="CREATE">Create</MenuItem>
              <MenuItem value="UPDATE">Update</MenuItem>
              <MenuItem value="DELETE">Delete</MenuItem>
              <MenuItem value="LOGIN">Login</MenuItem>
              <MenuItem value="LOGOUT">Logout</MenuItem>
              <MenuItem value="RESOLVE">Resolve</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="entity-filter-label">Entity</InputLabel>
            <Select
              labelId="entity-filter-label"
              id="entity-filter"
              value={entityFilter}
              label="Entity"
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <MenuItem value="">All Entities</MenuItem>
              <MenuItem value="asset">Asset</MenuItem>
              <MenuItem value="movement">Movement</MenuItem>
              <MenuItem value="discrepancy">Discrepancy</MenuItem>
              <MenuItem value="photo">Photo</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="role">Role</MenuItem>
              <MenuItem value="auth">Authentication</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear All
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={logs}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={totalLogs}
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

export default AuditLogList;