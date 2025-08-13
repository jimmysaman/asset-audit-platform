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
  Card,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { siteApi } from '../../services/api';

const SiteList = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalSites, setTotalSites] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 12,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [siteTypes, setSiteTypes] = useState([]);

  useEffect(() => {
    fetchSites();
    fetchSiteTypes();
  }, [paginationModel, searchTerm, typeFilter, statusFilter]);

  const fetchSites = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await siteApi.getAll({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
        type: typeFilter,
        isActive: statusFilter,
      });
      setSites(response.data.sites);
      setTotalSites(response.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteTypes = async () => {
    try {
      const response = await siteApi.getTypes();
      setSiteTypes(response.data.types);
    } catch (err) {
      console.error('Error fetching site types:', err);
    }
  };

  const handleAddSite = () => {
    navigate('/sites/new');
  };

  const handleEditSite = (site) => {
    navigate(`/sites/${site.id}/edit`);
  };

  const handleViewSite = (site) => {
    navigate(`/sites/${site.id}`);
  };

  const handleDeleteClick = (site) => {
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await siteApi.delete(siteToDelete.id);
      setSnackbar({
        open: true,
        message: 'Site deleted successfully',
        severity: 'success',
      });
      fetchSites();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete site',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSiteToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const formatAddress = (site) => {
    const parts = [site.city, site.state, site.country].filter(Boolean);
    return parts.join(', ') || 'No address';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sites & Locations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSite}
        >
          Add Site
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search sites..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {siteTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
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
            height: '300px',
          }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : sites.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
          }}
        >
          <BusinessIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Sites Found
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            {searchTerm || typeFilter || statusFilter
              ? 'No sites match your search criteria. Try adjusting your filters.'
              : 'Start by creating your first site to organize your assets.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSite}
            sx={{ mt: 2 }}
          >
            Add Site
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sites.map((site) => (
            <Grid item xs={12} sm={6} md={4} key={site.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" noWrap>
                      {site.name}
                    </Typography>
                    <Chip
                      label={getStatusText(site.isActive)}
                      color={getStatusColor(site.isActive)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Code: {site.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type: {site.type}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatAddress(site)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Assets: {site.assetCount || 0} | Locations: {site.locationCount || 0}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewSite(site)}
                    title="View Details"
                  >
                    <LocationIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleEditSite(site)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(site)}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Site</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{siteToDelete?.name}"? This action cannot be undone.
            All locations and assets associated with this site must be moved first.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
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

export default SiteList;
