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
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { photoApi } from '../../services/api';

const PhotoList = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 12,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editDescription, setEditDescription] = useState('');

  const fetchPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await photoApi.getPhotos({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
      });
      setPhotos(response.data.photos);
      setTotalPhotos(response.data.total);
    } catch (err) {
      setError('Failed to fetch photos. Please try again.');
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handleSearch = () => {
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchPhotos();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
    fetchPhotos();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddPhoto = () => {
    navigate('/photos/upload');
  };

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (photo) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await photoApi.deletePhoto(photoToDelete.id);
      setSnackbar({
        open: true,
        message: 'Photo deleted successfully',
        severity: 'success',
      });
      fetchPhotos();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete photo',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPhotoToDelete(null);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedPhoto(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleLoadMore = () => {
    setPaginationModel({
      ...paginationModel,
      page: paginationModel.page + 1,
    });
  };

  const handleEditDescription = (photo) => {
    setEditingPhoto(photo);
    setEditDescription(photo.description || '');
  };

  const handleSaveDescription = async () => {
    try {
      await photoApi.updatePhoto(editingPhoto.id, { description: editDescription });
      setSnackbar({
        open: true,
        message: 'Photo description updated successfully',
        severity: 'success',
      });
      fetchPhotos();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update description',
        severity: 'error',
      });
    } finally {
      setEditingPhoto(null);
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingPhoto(null);
    setEditDescription('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Asset Photos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPhoto}
        >
          Upload Photo
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Photos"
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

      {loading && photos.length === 0 ? (
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
      ) : photos.length === 0 ? (
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
          <PhotoCameraIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Photos Found
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            {searchTerm
              ? 'No photos match your search criteria. Try a different search term.'
              : 'Start by uploading photos of your assets.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPhoto}
            sx={{ mt: 2 }}
          >
            Upload Photo
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url}
                    alt={photo.caption || 'Asset photo'}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => handleViewPhoto(photo)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {photo.asset?.name || 'Unknown Asset'}
                    </Typography>
                    {editingPhoto?.id === photo.id ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1, mb: 1 }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          mb: 1,
                          minHeight: '40px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {photo.description || 'No description'}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      Uploaded: {formatDate(photo.createdAt)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewPhoto(photo)}
                      title="View"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {editingPhoto?.id === photo.id ? (
                      <>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleSaveDescription}
                          title="Save"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={handleCancelEdit}
                          title="Cancel"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEditDescription(photo)}
                        title="Edit Description"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(photo)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {photos.length < totalPhotos && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* View Photo Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPhoto?.asset?.name || 'Asset Photo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={selectedPhoto?.url}
              alt={selectedPhoto?.caption || 'Asset photo'}
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {selectedPhoto?.caption || 'No caption'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Uploaded: {formatDate(selectedPhoto?.createdAt)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

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
            Are you sure you want to delete this photo? This action cannot be undone.
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

export default PhotoList;