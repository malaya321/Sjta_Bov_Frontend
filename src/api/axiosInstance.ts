// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your specific base URL
const BASE_URL = 'http://192.168.10.189/SJTABOV/public/api/';


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds for mobile networks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add platform info for debugging
      config.headers['X-Platform'] = Platform.OS;
      config.headers['X-Device'] = `${Platform.OS} ${Platform.Version}`;
      
      // Log request in development
      if (__DEV__) {
        console.log('📤 API Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
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
        data: response.data,
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
        message: error.message,
        responseData: error.response?.data,
      });
    }

    // Handle network errors (no internet, server not reachable)
    if (error.message === 'Network Error') {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection and ensure the server is running.',
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
          // Bad Request
          return Promise.reject({
            status,
            message: data?.message || 'Invalid request. Please check your input.',
            errors: data?.errors,
            data,
          });
          
        case 401:
          // Unauthorized
          await AsyncStorage.removeItem('userToken');
          // You can trigger navigation to login here if needed
          return Promise.reject({
            status,
            message: 'Session expired. Please login again.',
            requiresLogin: true,
            data,
          });
          
        case 403:
          // Forbidden
          return Promise.reject({
            status,
            message: 'You do not have permission to access this resource.',
            data,
          });
          
        case 404:
          // Not Found
          return Promise.reject({
            status,
            message: 'The requested resource was not found.',
            data,
          });
          
        case 422:
          // Validation Error (common in Laravel)
          return Promise.reject({
            status,
            message: 'Validation failed.',
            errors: data?.errors || data,
            data,
          });
          
        case 500:
          // Server Error
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