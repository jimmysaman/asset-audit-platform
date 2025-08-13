import axios from 'axios';
import { assetApi, movementApi, discrepancyApi, photoApi, authApi } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authApi', () => {
    test('login should make POST request to /auth/login', async () => {
      const credentials = { username: 'test', password: 'password' };
      const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.login(credentials);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    test('profile should make GET request to /auth/profile', async () => {
      const mockResponse = { data: { id: 1, username: 'test' } };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await authApi.profile();

      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockResponse);
    });

    test('changePassword should make PUT request to /auth/change-password', async () => {
      const passwordData = { currentPassword: 'old', newPassword: 'new' };
      const mockResponse = { data: { success: true } };
      
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await authApi.changePassword(passwordData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/auth/change-password', passwordData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('assetApi', () => {
    test('getAssets should make GET request to /assets with params', async () => {
      const params = { page: 1, limit: 10 };
      const mockResponse = { data: { assets: [], total: 0 } };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await assetApi.getAssets(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/assets', { params });
      expect(result).toEqual(mockResponse);
    });

    test('getById should make GET request to /assets/:id', async () => {
      const assetId = '123';
      const mockResponse = { data: { id: assetId, name: 'Test Asset' } };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await assetApi.getById(assetId);

      expect(mockedAxios.get).toHaveBeenCalledWith(`/assets/${assetId}`);
      expect(result).toEqual(mockResponse);
    });

    test('createAsset should make POST request to /assets', async () => {
      const assetData = { name: 'New Asset', category: 'Equipment' };
      const mockResponse = { data: { id: '123', ...assetData } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await assetApi.createAsset(assetData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/assets', assetData);
      expect(result).toEqual(mockResponse);
    });

    test('updateAsset should make PUT request to /assets/:id', async () => {
      const assetId = '123';
      const updateData = { name: 'Updated Asset' };
      const mockResponse = { data: { id: assetId, ...updateData } };
      
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await assetApi.updateAsset(assetId, updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/assets/${assetId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteAsset should make DELETE request to /assets/:id', async () => {
      const assetId = '123';
      const mockResponse = { data: { success: true } };
      
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await assetApi.deleteAsset(assetId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`/assets/${assetId}`);
      expect(result).toEqual(mockResponse);
    });

    test('scan should make POST request to /assets/scan/:assetTag', async () => {
      const assetTag = 'TAG123';
      const mockResponse = { data: { id: '123', assetTag } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await assetApi.scan(assetTag);

      expect(mockedAxios.post).toHaveBeenCalledWith(`/assets/scan/${assetTag}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('movementApi', () => {
    test('getMovements should make GET request to /movements with params', async () => {
      const params = { status: 'Requested' };
      const mockResponse = { data: { movements: [], total: 0 } };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await movementApi.getMovements(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/movements', { params });
      expect(result).toEqual(mockResponse);
    });

    test('createMovement should make POST request to /movements', async () => {
      const movementData = { type: 'Transfer', assetId: '123' };
      const mockResponse = { data: { id: '456', ...movementData } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await movementApi.createMovement(movementData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/movements', movementData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('discrepancyApi', () => {
    test('getDiscrepancies should make GET request to /discrepancies with params', async () => {
      const params = { status: 'Open' };
      const mockResponse = { data: { discrepancies: [], total: 0 } };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await discrepancyApi.getDiscrepancies(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/discrepancies', { params });
      expect(result).toEqual(mockResponse);
    });

    test('createDiscrepancy should make POST request to /discrepancies', async () => {
      const discrepancyData = { type: 'Missing', assetId: '123' };
      const mockResponse = { data: { id: '789', ...discrepancyData } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await discrepancyApi.createDiscrepancy(discrepancyData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/discrepancies', discrepancyData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('photoApi', () => {
    test('upload should make POST request to /photos/upload with FormData', async () => {
      const formData = new FormData();
      formData.append('photo', 'test-file');
      const mockResponse = { data: { id: '999', url: 'test-url' } };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await photoApi.upload(formData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    test('getAssetPhotos should make GET request to /photos/asset/:assetId', async () => {
      const assetId = '123';
      const mockResponse = { data: [{ id: '1', assetId }] };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await photoApi.getAssetPhotos(assetId);

      expect(mockedAxios.get).toHaveBeenCalledWith(`/photos/asset/${assetId}`);
      expect(result).toEqual(mockResponse);
    });

    test('getPhotoUrl should return correct URL', () => {
      const photoId = '123';
      const expectedUrl = `/api/photos/file/${photoId}`;

      const result = photoApi.getPhotoUrl(photoId);

      expect(result).toBe(expectedUrl);
    });
  });

  describe('Error handling', () => {
    test('should handle API errors properly', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Asset not found' }
        }
      };
      
      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(assetApi.getById('nonexistent')).rejects.toEqual(errorResponse);
    });

    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(assetApi.getAssets()).rejects.toEqual(networkError);
    });
  });
});
