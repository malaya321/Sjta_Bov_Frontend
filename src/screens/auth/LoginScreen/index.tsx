import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Smartphone,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [credentials, setCredentials] = useState({ userId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();

  const handleChange = (name, value) => {
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = () => {

   
    if (!credentials.userId || !credentials.password) {
      setErrorMessage('Please enter both User ID and Password');
      return;
    }

    setStatus('loading');
    
    setTimeout(() => {
      if (credentials.userId.toLowerCase() === '1234' && credentials.password === '1234') {
        setStatus('success');
        // Call onLogin after successful authentication
        setTimeout(() => {
          onLogin();
        }, 1000);
         navigation.navigate('HomeScreen');
      } else {
        setStatus('error');
        setErrorMessage('Incorrect User ID or Password');
      }
    }, 1500);
  };

  if (status === 'success') {
    return (
      <SafeAreaView style={styles.successContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#bd9292ff" />
        <ScrollView contentContainerStyle={styles.successScrollContainer}>
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconGlow} />
              <View style={styles.successIcon}>
                <ShieldCheck size={48} color="#d97706" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>Jai Jagannath</Text>
            <Text style={styles.successSubtitle}>
              Welcome, <Text style={styles.successBold}>Rajesh Kumar</Text>. Your shift data is being prepared.
            </Text>
            
            <View style={styles.successProgressContainer}>
              <View style={styles.successProgressBar}>
                <View style={[styles.successProgressFill, { width: '100%' }]} />
              </View>
              
              <TouchableOpacity style={styles.successButton} onPress={() => onLogin()}>
                <Text style={styles.successButtonText}>Open Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
        source={{ uri: 'https://images.unsplash.com/photo-1621244249243-437b49c5aad9?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Consistent Amber/Brown Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(120, 53, 15, 0.85)', // #78350f with 85% opacity
            'rgba(120, 53, 15, 0.80)', // #78350f with 80% opacity
            'rgba(120, 53, 15, 0.90)'  // #78350f with 90% opacity at bottom
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Logo Section */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>S</Text>
                </View>
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logoTitle}>SJTA</Text>
                  <Text style={styles.logoSubtitle}>BOV DRIVER APP</Text>
                </View>
              </View>
              
              <View style={styles.languageSelector}>
                <Text style={styles.languageText}>ODIA / EN</Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Shree Jagannath{'\n'}
                <Text style={styles.titleHighlight}>Prasadam</Text>
              </Text>
              <Text style={styles.subtitle}>
                Enter credentials to start your divine service.
              </Text>
            </View>

            {/* Form Section - Glassmorphism Container */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Smartphone size={18} color="rgba(255,255,255,0.5)" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="User ID / Mobile"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={credentials.userId}
                  onChangeText={(text) => handleChange('userId', text)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={18} color="rgba(255,255,255,0.5)" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={credentials.password}
                  onChangeText={(text) => handleChange('password', text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255,255,255,0.3)" />
                  ) : (
                    <Eye size={20} color="rgba(255,255,255,0.3)" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#fecaca" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  status === 'loading' && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={status === 'loading'}
                activeOpacity={0.8}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="rgba(255,255,255,0.4)" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>SIGN IN</Text>
                    <ArrowRight size={20} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Secondary Actions */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Modern Bottom Sheet Branding - Matching Color */}
          <View style={styles.bottomContainer}>
            <Text style={styles.bottomTitle}>
              JAGANNATHA SWAMI NAYANA PATHA GAMI BHAVA TUME
            </Text>
            <View style={styles.bottomFeatures}>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>SECURE LOGIN</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>GPS TRACKING</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#78350f', // Fallback Deep Amber/Brown
  },
  keyboardView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: '#d97706', // Amber-600
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 20,
  },
  logoTextContainer: {
    gap: 2,
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  logoSubtitle: {
    color: '#fbbf24', // Amber-400
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  languageSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 44,
  },
  titleHighlight: {
    color: '#d97706', // Amber-600
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
  formContainer: {
    gap: 16,
    marginTop: 'auto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  loginButton: {
    backgroundColor: '#d97706', // Amber-600
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  bottomContainer: {
    backgroundColor: 'rgba(120, 53, 15, 0.95)', // Same amber/brown color, slightly more opaque
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 14,
  },
  bottomFeatures: {
    flexDirection: 'row',
    gap: 24,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  featureDot: {
    width: 4,
    height: 4,
    backgroundColor: '#d97706', // Amber-600
    borderRadius: 2,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // Pure White
  },
  successScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successIconContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  successIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: '#d97706', // Amber-600
    borderRadius: 60,
    opacity: 0.2,
    top: -24,
    left: -24,
  },
  successIcon: {
    width: 96,
    height: 96,
    backgroundColor: '#fffbeb', // Amber-50
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 250,
    marginBottom: 48,
    lineHeight: 20,
  },
  successBold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  successProgressContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 24,
  },
  successProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  successProgressFill: {
    height: '100%',
    backgroundColor: '#d97706', // Amber-600
    borderRadius: 3,
  },
  successButton: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;