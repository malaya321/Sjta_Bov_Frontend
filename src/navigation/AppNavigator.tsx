import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Power, 
  MapPin, 
  Bell, 
  Settings, 
  RotateCcw, 
  LayoutDashboard, 
  Users, 
  ClipboardList,
  House
} from 'lucide-react-native';

// Import your screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ZoneScreen from '../screens/ZoneScreen';
import AlertScreen from '../screens/AlertScreen';
import SupervisorScreen from '../screens/SupervisorScreen';

// Types
export type RootStackParamList = {
  LoginScreen: undefined;
  MainTabs: undefined;
  SupervisorStack: undefined;
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
 * Bottom Tab Navigator for DRIVERS
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
          tabBarIcon: ({ color }) => <House size={22} color={color}/>,
        }}
      />
      <Tab.Screen 
        name="Zone" 
        children={() => <ZoneScreen />} 
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
        children={() => <AlertScreen />} 
        options={{
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="More" 
        component={View} 
        options={{
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Bottom Tab Navigator for SUPERVISORS
 */
const SupervisorTabNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: navStyles.tabBar,
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: '#CBD5E1',
        tabBarLabelStyle: navStyles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Roster" 
        children={() => <SupervisorScreen onLogout={onLogout} />}
        options={{
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Drivers" 
        component={View} 
        options={{
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Status" 
        component={View} 
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App Navigator with Auth Logic
 */
const AppNavigator = () => {
  // States for authentication
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; role: 'driver' | 'supervisor' | null }>({
    isLoggedIn: false,
    role: null,
  });
  
  // State for checking initial token
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Check for token on app start
  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userRole = await AsyncStorage.getItem('userType');
      if (token) {
        console.log('Token found, auto-logging in...');
        console.log(token,'token navigator')
        console.log(userRole,'role navigator')
        // Try to get user data to determine role
        const userDataString = await AsyncStorage.getItem('userData');
        let role = userRole; // Default to driver
        
        // if (userDataString) {
          // try {
            
          //   if (userRole === 'driver' || userRole === 'supervisor') {
          //     role = userRole;
              
          //   }
          // } catch (error) {
          //   console.log('Error parsing userData, using default role');
          // }
          // console.log(role,'role navigator ____')
        // }
        
        // Set auth state to logged in
        setAuth({ 
          isLoggedIn: true, 
          role 
        });
      }
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleLogin = (role: 'driver' | 'supervisor') => {
    setAuth({ isLoggedIn: true, role });
  };

  const handleLogout = async () => {
    // Clear AsyncStorage on logout
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setAuth({ isLoggedIn: false, role: null });
  };

  // Show loading screen while checking token
  if (isCheckingToken) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }
console.log(auth.role,'navigator Role++++')
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!auth.isLoggedIn ? (
          // Login Flow - only show if not logged in
          <Stack.Screen name="LoginScreen">
            {(props) => (
              <LoginScreen 
                {...(props as any)} 
                onLogin={(role: 'driver' | 'supervisor') => handleLogin(role)} 
              />
            )}
          </Stack.Screen>
        ) : auth.role === 'supervisor' ? (
          // Supervisor Flow - redirect directly if supervisor
          <Stack.Screen name="SupervisorStack">
            {() => <SupervisorTabNavigator onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          // Driver Flow - redirect directly if driver
          <Stack.Screen name="MainTabs">
            {() => <TabNavigator onLogout={handleLogout} />}
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
    backgroundColor: 'rgb(157, 20, 12)',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(121, 18, 12)',
  },
});

export default AppNavigator;