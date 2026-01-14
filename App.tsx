import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Navigation from './src/navigation';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate app initialization
  useEffect(() => {
    const initApp = async () => {
      // Simulate loading (check auth token, load resources, etc.)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      setIsLoading(false);
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;