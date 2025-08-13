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
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { discrepancyApi } from '../../services/api';

const DiscrepancyList = () => {
  const navigate = useNavigate();
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalDiscrepancies, setTotalDiscrepancies] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discrepancyToDelete, setDiscrepancyToDelete] = useState(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [discrepancyToResolve, setDiscrepancyToResolve] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchDiscrepancies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await discrepancyApi.getDiscrepancies({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
      });
      setDiscrepancies(response.data.discrepancies);
      setTotalDiscrepancies(response.data.total);
    } catch (err) {
      setError('Failed to fetch discrepancies. Please try again.');
      console.error('Error fetching discrepancies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscrepancies();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handleSearch = () => {
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchDiscrepancies();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchDiscrepancies();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddDiscrepancy = () => {
    navigate('/discrepancies/create');
  };

  const handleEditDiscrepancy = (id) => {
    navigate(`/discrepancies/edit/${id}`);
  };

  const handleViewDiscrepancy = (id) => {
    navigate(`/discrepancies/view/${id}`);
  };

  const handleDeleteClick = (discrepancy) => {
    setDiscrepancyToDelete(discrepancy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await discrepancyApi.deleteDiscrepancy(discrepancyToDelete.id);
      setSnackbar({
        open: true,
        message: 'Discrepancy deleted successfully',
        severity: 'success',
      });
      fetchDiscrepancies();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete discrepancy',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDiscrepancyToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDiscrepancyToDelete(null);
  };

  const handleResolveClick = (discrepancy) => {
    setDiscrepancyToResolve(discrepancy);
    setResolutionNote('');
    setResolveDialogOpen(true);
  };

  const handleResolveConfirm = async () => {
    try {
      await discrepancyApi.resolveDiscrepancy(discrepancyToResolve.id, {
        resolutionNote,
        resolved: true,
        resolutionDate: new Date().toISOString(),
      });
      setSnackbar({
        open: true,
        message: 'Discrepancy resolved successfully',
        severity: 'success',
      });
      fetchDiscrepancies();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to resolve discrepancy',
        severity: 'error',
      });
    } finally {
      setResolveDialogOpen(false);
      setDiscrepancyToResolve(null);
      setResolutionNote('');
    }
  };

  const handleResolveCancel = () => {
    setResolveDialogOpen(false);
    setDiscrepancyToResolve(null);
    setResolutionNote('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getStatusColor = (status) => {
    return status ? 'success' : 'error';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'assetName',
      headerName: 'Asset',
      width: 200,
      valueGetter: (params) => params.row.asset?.name || 'N/A',
    },
    { field: 'description', headerName: 'Description', width: 250 },
    {
      field: 'discrepancyDate',
      headerName: 'Date Reported',
      width: 180,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: 'resolved',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Resolved' : 'Open'}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'reportedBy',
      headerName: 'Reported By',
      width: 150,
      valueGetter: (params) => params.row.user?.username || 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleViewDiscrepancy(params.row.id)}
            title="View"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="secondary"
            size="small"
            onClick={() => handleEditDiscrepancy(params.row.id)}
            title="Edit"
            disabled={params.row.resolved}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => handleResolveClick(params.row)}
            title="Resolve"
            disabled={params.row.resolved}
          >
            <CheckCircleIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Discrepancies</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDiscrepancy}
        >
          Report Discrepancy
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Discrepancies"
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
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={discrepancies}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            rowCount={totalDiscrepancies}
            paginationMode="server"
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this discrepancy record? This action cannot be undone.
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

      {/* Resolve Discrepancy Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={handleResolveCancel}
        aria-labelledby="resolve-dialog-title"
        aria-describedby="resolve-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="resolve-dialog-title">Resolve Discrepancy</DialogTitle>
        <DialogContent>
          <DialogContentText id="resolve-dialog-description" sx={{ mb: 2 }}>
            Please provide a resolution note for this discrepancy.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="resolutionNote"
            label="Resolution Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResolveCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleResolveConfirm}
            color="success"
            autoFocus
            disabled={!resolutionNote.trim()}
          >
            Resolve
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

export default DiscrepancyList;