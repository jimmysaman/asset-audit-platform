 import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  profile: () => api.get('/auth/profile'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Assets API
export const assetApi = {
  getAssets: (params) => api.get('/assets', { params }),
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  createAsset: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
  scan: (assetTag) => api.post(`/assets/scan/${assetTag}`),
  getCategories: () => api.get('/assets/categories/list'),
  getLocations: () => api.get('/assets/locations/list'),
};

// Movements API
export const movementApi = {
  getMovements: (params) => api.get('/movements', { params }),
  getAll: (params) => api.get('/movements', { params }),
  getById: (id) => api.get(`/movements/${id}`),
  create: (data) => api.post('/movements', data),
  createMovement: (data) => api.post('/movements', data),
  update: (id, data) => api.put(`/movements/${id}`, data),
  updateMovement: (id, data) => api.put(`/movements/${id}`, data),
  delete: (id) => api.delete(`/movements/${id}`),
  deleteMovement: (id) => api.delete(`/movements/${id}`),
  getTypes: () => api.get('/movements/types/list'),
};

// Discrepancies API
export const discrepancyApi = {
  getDiscrepancies: (params) => api.get('/discrepancies', { params }),
  getAll: (params) => api.get('/discrepancies', { params }),
  getById: (id) => api.get(`/discrepancies/${id}`),
  create: (data) => api.post('/discrepancies', data),
  createDiscrepancy: (data) => api.post('/discrepancies', data),
  update: (id, data) => api.put(`/discrepancies/${id}`, data),
  updateDiscrepancy: (id, data) => api.put(`/discrepancies/${id}`, data),
  delete: (id) => api.delete(`/discrepancies/${id}`),
  deleteDiscrepancy: (id) => api.delete(`/discrepancies/${id}`),
  getTypes: () => api.get('/discrepancies/types/list'),
};

// Photos API
export const photoApi = {
  getPhotos: (params) => api.get('/photos', { params }),
  upload: (formData) => api.post('/photos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAssetPhotos: (assetId) => api.get(`/photos/asset/${assetId}`),
  getMovementPhotos: (movementId) => api.get(`/photos/movement/${movementId}`),
  getById: (id) => api.get(`/photos/${id}`),
  update: (id, data) => api.put(`/photos/${id}`, data),
  updatePhoto: (id, data) => api.put(`/photos/${id}`, data),
  delete: (id) => api.delete(`/photos/${id}`),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  getPhotoUrl: (id) => `/api/photos/file/${id}`,
};

// Users API
export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Roles API
export const roleApi = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Audit Logs API
export const auditLogApi = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getById: (id) => api.get(`/audit-logs/${id}`),
  getEntityLogs: (entityType, entityId) => api.get(`/audit-logs/entity/${entityType}/${entityId}`),
  getUserLogs: (userId) => api.get(`/audit-logs/user/${userId}`),
  getActions: () => api.get('/audit-logs/actions/list'),
  getEntityTypes: () => api.get('/audit-logs/entity-types/list'),
};

// Sites API
export const siteApi = {
  getAll: (params) => api.get('/sites', { params }),
  getById: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
  delete: (id) => api.delete(`/sites/${id}`),
  getTypes: () => api.get('/sites/types'),
};

// Locations API
export const locationApi = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  getTypes: () => api.get('/locations/types'),
  getBySite: (siteId) => api.get(`/locations/site/${siteId}`),
};

export default api;