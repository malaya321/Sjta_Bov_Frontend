import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

const Navigation = () => {
  return (
    <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </QueryClientProvider>
  );
};

export default Navigation;