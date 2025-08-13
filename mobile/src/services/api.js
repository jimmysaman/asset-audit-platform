import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  profile: () => api.get('/auth/profile'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Assets API
export const assetApi = {
  getAssets: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  scan: (assetTag) => api.post(`/assets/scan/${assetTag}`),
  getCategories: () => api.get('/assets/categories/list'),
  getLocations: () => api.get('/assets/locations/list'),
};

// Movements API
export const movementApi = {
  getMovements: (params) => api.get('/movements', { params }),
  getById: (id) => api.get(`/movements/${id}`),
  createMovement: (data) => api.post('/movements', data),
  updateMovement: (id, data) => api.put(`/movements/${id}`, data),
  getTypes: () => api.get('/movements/types/list'),
};

// Photos API
export const photoApi = {
  upload: (formData) => api.post('/photos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAssetPhotos: (assetId) => api.get(`/photos/asset/${assetId}`),
  getMovementPhotos: (movementId) => api.get(`/photos/movement/${movementId}`),
  getPhotoUrl: (id) => `${API_BASE_URL}/photos/file/${id}`,
};

// Discrepancies API
export const discrepancyApi = {
  getDiscrepancies: (params) => api.get('/discrepancies', { params }),
  getById: (id) => api.get(`/discrepancies/${id}`),
  createDiscrepancy: (data) => api.post('/discrepancies', data),
  getTypes: () => api.get('/discrepancies/types/list'),
};

export default api;
