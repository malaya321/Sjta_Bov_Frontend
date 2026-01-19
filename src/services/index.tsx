import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.yourdomain.com/v1';

// 1. Create the Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Attach Token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response.data, // Returns only the data part of the response
  (error) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          errorMessage = "Unauthorized: Please login again.";
          // Optional: Add logic to clear local storage and redirect to login
          break;
        case 403:
          errorMessage = "Forbidden: You don't have access.";
          break;
        case 404:
          errorMessage = "Not Found: The resource does not exist.";
          break;
        case 500:
          errorMessage = "Server Error: Please try again later.";
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "No internet connection. Please check your network.";
    }

    return Promise.reject(errorMessage);
  }
);

// 4. Functional API Methods (The "Service")
export const service = {
  // GET
  get: (url:any, params = {}) => api.get(url, { params }),

  // POST
  post: (url:any, data = {}) => api.post(url, data),

  // UPDATE (PUT or PATCH)
  update: (url:any, data = {}) => api.put(url, data),

  // DELETE
  delete: (url:any) => api.delete(url),
};

export default service;