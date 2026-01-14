import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

export type RootStackParamList = {
  LoginScreen: undefined;
  HomeScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Function to handle authentication state
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="HomeScreen"
          options={{
            title: 'Driver Dashboard',
            headerLeft: () => null, // Remove back button on home
          }}
        >
          {(props) => <HomeScreen {...(props as any)} onLogout={handleLogout} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen
          name="LoginScreen"
          options={{
            title: 'Driver Login',
            headerShown: false,
          }}
        >
          {(props) => <LoginScreen {...(props as any)} onLogin={handleLogin} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;