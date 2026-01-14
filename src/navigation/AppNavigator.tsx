import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, StatusBar, TouchableOpacity, Platform, Text } from 'react-native';
import { Power, MapPin, Bell, Settings, RotateCcw } from 'lucide-react-native';

// Import your screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

// Types
export type RootStackParamList = {
  LoginScreen: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * Custom Central Button for the Floating Effect
 */
const CentralButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={navStyles.centralButtonContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={navStyles.centralButton}>
      {children}
    </View>
  </TouchableOpacity>
);

/**
 * Bottom Tab Navigator Configuration
 */
const TabNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: navStyles.tabBar,
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: '#CBD5E1',
        tabBarLabelStyle: navStyles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Home" 
        children={() => <HomeScreen onLogout={onLogout} />}
        options={{
          tabBarIcon: ({ color }) => <Power size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Zone" 
        component={View} // Placeholder for Zone Screen
        options={{
          tabBarIcon: ({ color }) => <MapPin size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Action" 
        component={View} 
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <CentralButton {...props}>
              <RotateCcw size={28} color="#FFFFFF" />
            </CentralButton>
          ),
        }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={View} // Placeholder for Alerts Screen
        options={{
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="More" 
        component={View} // Placeholder for Settings Screen
        options={{
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App Navigator with Auth Logic
 */
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs">
            {() => <TabNavigator onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="LoginScreen">
            {(props) => <LoginScreen {...(props as any)} onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </>
  );
};

const navStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    paddingTop: 10,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  centralButtonContainer: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralButton: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#F8FAFC',
    elevation: 10,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});

export default AppNavigator;