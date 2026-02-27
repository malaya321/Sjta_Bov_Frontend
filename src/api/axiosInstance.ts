// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your specific base URL
// const BASE_URL = 'http://192.168.10.189/SJTABOV/public/api/';
const BASE_URL = 'http://192.168.10.245/sjtabov/public/api/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds for mobile networks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Store token in memory for faster access
let cachedToken: string | null = null;
let isTokenInitialized = false;

/**
 * Initialize token from AsyncStorage
 */
export const initializeToken = async (): Promise<void> => {
  try {
    cachedToken = await AsyncStorage.getItem('userToken');
    isTokenInitialized = true;
    if (__DEV__) {
      console.log('🔐 Token initialized from cache:', cachedToken ? 'Yes' : 'No');
    }
  } catch (error) {
    console.error('Failed to initialize token:', error);
    cachedToken = null;
    isTokenInitialized = true;
  }
};

/**
 * Set token manually (after login)
 */
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('userToken', token);
    cachedToken = token;
    if (__DEV__) {
      console.log('🔑 Token set successfully');
    }
  } catch (error) {
    console.error('Failed to set token:', error);
  }
};

/**
 * Remove token (logout)
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userToken');
    cachedToken = null;
    if (__DEV__) {
      console.log('🔓 Token removed');
    }
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

/**
 * Get current token (synchronous for immediate access)
 */
export const getCurrentToken = (): string | null => {
  return cachedToken;
};

// Initialize token on app startup
initializeToken();

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Wait for token initialization if not done yet
      if (!isTokenInitialized) {
        await initializeToken();
      }
      
      // Add token from cache
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
      } else {
        // Try to get token directly from AsyncStorage as fallback
        const directToken = await AsyncStorage.getItem('userToken');
        if (directToken) {
          cachedToken = directToken;
          config.headers.Authorization = `Bearer ${directToken}`;
        }
      }
      
      // Add platform info for debugging
      config.headers['X-Platform'] = Platform.OS;
      config.headers['X-Device'] = `${Platform.OS} ${Platform.Version}`;
      
      // Log request in development
      if (__DEV__) {
        console.log('📤 API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!config.headers.Authorization,
           tokenPreview: typeof config.headers.Authorization === 'string' 
      ? `${config.headers.Authorization.substring(0, 30)}...` 
      : 'Token exists but not a string',
          data: config.data,
        });
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        hasToken: !!response.config.headers.Authorization,
      });
    }
    return response;
  },
  async (error) => {
    // Log error in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        hasToken: !!error.config?.headers?.Authorization,
        message: error.message,
      });
    }

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Clear token cache and storage
      cachedToken = null;
      // await AsyncStorage.removeItem('userToken');
      
      // You can add navigation to login screen here
      // Example: navigation.navigate('Login');
      
      return Promise.reject({
        status: 401,
        message: error.response?.data?.message,
        requiresLogin: true,
        data: error.response?.data,
      });
    }

    // Handle network errors (no internet, server not reachable)
    if (error.message === 'Network Error' || !error.response) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true,
        originalError: error.message,
      });
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject({
        status: 408,
        message: 'Request timeout. The server is taking too long to respond.',
        isTimeout: true,
      });
    }

    // Handle specific HTTP status codes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return Promise.reject({
            status,
            message: data?.message || 'Invalid request. Please check your input.',
            errors: data?.errors,
            data,
          });
          
        case 403:
          return Promise.reject({
            status,
            message: 'You do not have permission to access this resource.',
            data,
          });
          
        case 404:
          return Promise.reject({
            status,
            message: 'The requested resource was not found.',
            data,
          });
          
        case 422:
          return Promise.reject({
            status,
            message: data?.message || 'Validation failed.',
            errors: data?.errors,
            data,
          });
          
        case 500:
          return Promise.reject({
            status,
            message: 'Server error. Please try again later.',
            isServerError: true,
            data,
          });
          
        default:
          return Promise.reject({
            status,
            message: data?.message || 'Something went wrong',
            data,
          });
      }
    }

    // Unknown error
    return Promise.reject({
      status: 500,
      message: 'An unexpected error occurred',
      originalError: error.message,
    });
  }
);

export default api;
// export { setAuthToken, removeAuthToken, getCurrentToken, initializeToken };