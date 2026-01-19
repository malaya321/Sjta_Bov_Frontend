import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Smartphone,
} from 'lucide-react-native';
import { useLogin } from '../../../hooks/useAuth';
import { Formik } from 'formik';
import * as Yup from 'yup';

const { width } = Dimensions.get('window');

// Define validation schema with Yup
const LoginSchema = Yup.object().shape({
  userId: Yup.string()
    .required('User Id is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Define form values type
interface LoginFormValues {
  userId: string;
  password: string;
}

const LoginScreen = ({
  onLogin,
}: {
  onLogin: (role: 'driver' | 'supervisor') => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');

  // Use the login mutation hook
  const loginMutation = useLogin();

  // Check if user is already logged in
  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedData = JSON.parse(userData);
        console.log('Found existing login:', parsedData);
        // Auto-login or show welcome back message
      }
    } catch (error) {
      console.error('Error checking existing login:', error);
    }
  };

  // Initial form values
  const initialValues: LoginFormValues = {
    userId: '',
    password: '',
  };

  const handleLogin = (values: LoginFormValues) => {
    // Prepare the complete login data with static request_type
    const loginData = {
      request_type: 'mobile', // Static string as requested
      username: values.userId, // Using mobile field as per request_type
      password: values.password,
    };

    console.log('Login Data:', loginData);

    // Clear any previous API errors
    setApiErrorMessage('');

    // Trigger the login mutation
    loginMutation.mutate(loginData, {
      onSuccess: (data) => {
        // Success is already handled in the mutation's onSuccess
        // You can perform additional actions here if needed
        
        // Extract role from response
        const role = data?.data?.role_name?.toLowerCase();
        
        // Navigate based on role
        if (role === 'driver' || role === 'supervisor') {
          // Add a small delay for better UX
          setTimeout(() => {
            onLogin(role as 'driver' | 'supervisor');
          }, 500);
        } else {
          Alert.alert(
            'Login Successful',
            'Redirecting to dashboard...',
            [{ text: 'OK' }]
          );
        }
      },
      onError: (error: any) => {
        // Handle API errors
        setApiErrorMessage(error.message || 'Login failed. Please try again.');
      },
    });
  };

  // Determine if we should show loading state
  const isLoading = loginMutation.isPending;
  const isSuccess = loginMutation.isSuccess;

  // Success Screen View
  if (isSuccess) {
    const role = loginMutation.data?.data?.role_name?.toLowerCase() || 'user';
    const userName = loginMutation.data?.data?.user?.name || 'User';
    
    return (
      <SafeAreaView style={styles.successContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.successScrollContainer}>
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconGlow} />
              <View style={styles.successIcon}>
                <ShieldCheck size={48} color="#d97706" />
              </View>
            </View>

            <Text style={styles.successTitle}>Jai Jagannath</Text>
            <Text style={styles.successSubtitle}>
              Welcome,{' '}
              <Text style={styles.successBold}>
                {userName}
              </Text>
              . Your session is being prepared.
            </Text>

            <View style={styles.successProgressContainer}>
              <View style={styles.successProgressBar}>
                <View style={[styles.successProgressFill, { width: '100%' }]} />
              </View>

              <TouchableOpacity
                style={styles.successButton}
                onPress={() => onLogin(role as 'driver' | 'supervisor')}
              >
                <Text style={styles.successButtonText}>Open Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#78350f"
        translucent={true}
      />
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1621244249243-437b49c5aad9?q=80&w=2070&auto=format&fit=crop',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ImageBackground
          source={require('../../../assets/image/main_background2.png')}
          style={styles.backgroundCircle}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <Image
                      source={require('../../../assets/image/purilogo.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.logoTextContainer}>
                    <Text style={styles.logoTitle}>SJTA</Text>
                    <Text style={styles.logoSubtitle}>BOV ADMINISTRATION</Text>
                  </View>
                </View>
                <View style={styles.languageSelector}>
                  <Text style={styles.languageText}>ODIA / EN</Text>
                </View>
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  Shree Jagannath{'\n'}
                  <Text style={styles.titleHighlight}>
                    Temple Administration
                  </Text>
                </Text>
                <Text style={styles.subtitle}>
                  Enter mobile number and password to start your divine service.
                </Text>
              </View>

              <Formik
                initialValues={initialValues}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                  dirty,
                }) => (
                  <View style={styles.formContainer}>
                    {/* Mobile Number Input */}
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIcon}>
                        <Smartphone size={18} color="rgba(255,255,255,0.5)" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="User Id"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={values.userId}
                        onChangeText={handleChange('userId')}
                        onBlur={handleBlur('userId')}
                        autoCapitalize="none"
                        // keyboardType="phone-pad"
                        maxLength={10}
                        editable={!isLoading}
                        selectTextOnFocus={!isLoading}
                      />
                    </View>
                    {touched.userId && errors.userId && (
                      <View style={styles.errorContainer}>
                        <AlertCircle size={16} color="#fecaca" />
                        <Text style={styles.errorText}>{errors.userId}</Text>
                      </View>
                    )}

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIcon}>
                        <Lock size={18} color="rgba(255,255,255,0.5)" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                        selectTextOnFocus={!isLoading}
                        onSubmitEditing={() => handleSubmit()}
                        returnKeyType="go"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="rgba(255,255,255,0.3)" />
                        ) : (
                          <Eye size={20} color="rgba(255,255,255,0.3)" />
                        )}
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <View style={styles.errorContainer}>
                        <AlertCircle size={16} color="#fecaca" />
                        <Text style={styles.errorText}>{errors.password}</Text>
                      </View>
                    )}

                    {/* Show API error */}
                    {apiErrorMessage ? (
                      <View style={styles.errorContainer}>
                        <AlertCircle size={16} color="#fecaca" />
                        <Text style={styles.errorText}>
                          {apiErrorMessage}
                        </Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.loginButton,
                        (!isValid || !dirty || isLoading) && styles.loginButtonDisabled,
                      ]}
                      onPress={() => handleSubmit()}
                      disabled={!isValid || !dirty || isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <Text style={styles.loginButtonText}>SIGN IN</Text>
                          <ArrowRight size={20} color="#ffffff" />
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Show retry button if there was an error */}
                    {apiErrorMessage && !isLoading ? (
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => handleSubmit()}
                      >
                        <Text style={styles.retryButtonText}>Retry Login</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </Formik>

              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.bottomContainer}>
              <Text style={styles.bottomTitle}>
                JAGANNATHA SWAMI NAYANA PATHA GAMI BHAVA TUME
              </Text>
              <View style={styles.bottomFeatures}>
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>SECURE</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>TRACKED</Text>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5d0e0aff' },
  logoImage: { width: '100%', height: '100%' },
  backgroundCircle: { height: '100%' },
  keyboardView: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 60 : 100,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  logoTextContainer: { gap: 2 },
  logoTitle: { color: '#ffffff', fontSize: 30, fontWeight: '900' },
  logoSubtitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  languageSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  languageText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  titleContainer: { marginBottom: 40 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '900', lineHeight: 38 },
  titleHighlight: { color: '#d97706' },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  formContainer: { gap: 12 }, // Reduced gap to accommodate validation errors
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: { color: '#fecaca', fontSize: 12, fontWeight: 'bold' },
  loginButton: {
    backgroundColor: '#d97706',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    elevation: 8,
  },
  loginButtonDisabled: { opacity: 0.5 },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPasswordContainer: { alignItems: 'center', marginTop: 30 },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomContainer: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomTitle: {
    color: 'rgba(255, 255, 255, 0.43)',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  bottomFeatures: { flexDirection: 'row', gap: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureDot: {
    width: 4,
    height: 4,
    backgroundColor: '#d97706',
    borderRadius: 2,
  },
  featureText: { color: '#ffffff', fontSize: 8, fontWeight: 'bold' },
  // Success Screen
  successContainer: { flex: 1, backgroundColor: '#ffffff' },
  successScrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successContent: { alignItems: 'center', width: '100%' },
  successIconContainer: { marginBottom: 32 },
  successIconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#d97706',
    borderRadius: 50,
    opacity: 0.2,
    top: -2,
    left: -2,
  },
  successIcon: {
    width: 96,
    height: 96,
    backgroundColor: '#fffbeb',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  successTitle: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  successSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 16,
  },
  successBold: { fontWeight: 'bold', color: '#1e293b' },
  successProgressContainer: { width: '100%', gap: 20 },
  successProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
  },
  successProgressFill: {
    height: '100%',
    backgroundColor: '#d97706',
    borderRadius: 3,
  },
  successButton: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;