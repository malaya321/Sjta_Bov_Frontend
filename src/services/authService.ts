// src/services/authService.ts
import api from "../api/axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  userId: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_name?: string;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  message?: string;
  success?: boolean;
  role_name?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  status?: number;
}

// Token storage key
const TOKEN_STORAGE_KEY = 'userToken';
const USER_STORAGE_KEY = 'userData';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/login', credentials);
      
      // Check if the response structure matches what we expect
      if (response.data?.success && response.data.data?.token) {
        const { token, user, role_name } = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
        
        // Combine user data with role if needed
        const userData:any = user ? { ...user, role_name } : null;
        if (userData) {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
        
        return {
          token,
          user: userData,
          role_name,
          success: true,
        };
      } else if (response.data?.data) {
        // Alternative structure: response.data already contains token/user
        const { token, user, role_name } = response.data.data;
        
        if (token) {
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
          
          const userData:any = user ? { ...user, role_name } : null;
          if (userData) {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          }
          
          return {
            token,
            user: userData,
            role_name,
            success: true,
          };
        }
      }
      
      // If no token found in response
      throw new Error(response.data?.message || 'Login failed. No token received.');
      
    } catch (error: any) {
      // Transform axios error to our app's error format
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Login failed',
          errors: error.response.data.errors,
          status: error.response.status,
        };
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if needed
      await api.post('/logout', {});
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API fails
    } finally {
      // Always clear local storage
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(USER_STORAGE_KEY),
        api.setAuthToken?.(null), 
      ]);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // First try to get from API
      const response = await api.get<ApiResponse<User>>('/user');
      
      if (response.data?.data) {
        const userData = response.data.data;
        // Update local storage with fresh data
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return userData;
      }
      
      return null;
    } catch (error) {
      // If API fails, try to get from local storage
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (storageError) {
        console.error('Error reading user from storage:', storageError);
        return null;
      }
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  clearAuthData: async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(USER_STORAGE_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};