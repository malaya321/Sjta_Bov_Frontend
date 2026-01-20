// src/api/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService,LoginCredentials,LoginResponse } from '../services/authService';
import { Alert } from 'react-native';

// Query keys for auth
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  login: () => [...authKeys.all, 'login'] as const,
};

// Login mutation hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: async (data: LoginResponse) => {
      // Save token to AsyncStorage
      const token = data?.token;
      const userType = data?.role_name;
      // console.log(userType,'userType++++')
      if (token) {
        await AsyncStorage.setItem('userToken', token);
         await AsyncStorage.setItem('userType', userType);
        
        // Also save user info if needed
        // const userData = {
        //   role: data?.data?.role_name,
        //   ...data?.data?.user,
        // };
        // await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

      // Update auth state in cache
      queryClient.setQueryData(authKeys.user(), data.data);
      
      // Show success message
    //   Alert.alert('Success', 'Login successful!', [{ text: 'OK' }]);
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      // Show error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.errors) {
        // Handle validation errors
        const errors = Object.values(error.errors).flat();
        errorMessage = errors.join('\n');
      }
      
      Alert.alert('Login Failed', errorMessage, [{ text: 'OK' }]);
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      
      // Remove items from AsyncStorage
      AsyncStorage.multiRemove(['userToken', 'userData']);
      
    //   Alert.alert('Success', 'Logged out successfully!', [{ text: 'OK' }]);
    },
    onError: (error) => {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout', [{ text: 'OK' }]);
    },
  });
};

// Hook to check if user is authenticated
export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');
    
    return {
      isAuthenticated: !!token,
      token,
      userData: userData ? JSON.parse(userData) : null,
    };
  };
  
  return {
    checkAuth,
    clearAuth: () => {
      AsyncStorage.multiRemove(['userToken', 'userData']);
      queryClient.clear();
    },
  };
};