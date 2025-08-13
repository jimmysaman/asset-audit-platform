import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <button onClick={() => login({ username: 'test', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  test('should provide initial state', async () => {
    localStorage.getItem.mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('should restore authentication from localStorage', async () => {
    const mockUser = { id: 1, username: 'test', firstName: 'Test', lastName: 'User' };
    const mockToken = 'test-token';

    localStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    // Mock successful profile verification
    mockedAxios.get.mockResolvedValue({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/profile');
  });

  test('should clear auth if token verification fails', async () => {
    const mockUser = { id: 1, username: 'test' };
    const mockToken = 'invalid-token';

    localStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    // Mock failed profile verification
    mockedAxios.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('should handle successful login', async () => {
    const mockUser = { id: 1, username: 'test', firstName: 'Test', lastName: 'User' };
    const mockToken = 'new-token';
    const mockResponse = { data: { token: mockToken, user: mockUser } };

    mockedAxios.post.mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Trigger login
    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'test',
      password: 'password',
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  test('should handle failed login', async () => {
    const mockError = {
      response: {
        data: { message: 'Invalid credentials' }
      }
    };

    mockedAxios.post.mockRejectedValue(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Trigger login
    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('should handle logout', async () => {
    const mockUser = { id: 1, username: 'test' };
    const mockToken = 'test-token';

    localStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    mockedAxios.get.mockResolvedValue({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    // Trigger logout
    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    consoleSpy.mockRestore();
  });
});
