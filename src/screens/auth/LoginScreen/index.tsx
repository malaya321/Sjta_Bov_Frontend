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
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Smartphone,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ onLogin }: { onLogin: (role: 'driver' | 'supervisor') => void }) => {
  const [credentials, setCredentials] = useState({ userId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [role, setRole] = useState<'driver' | 'supervisor' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (name: string, value: string) => {
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = () => {
    if (!credentials.userId || !credentials.password) {
      setErrorMessage('Please enter both User ID and Password');
      return;
    }

    setStatus('loading');
    
    // Simulate API Call
    setTimeout(() => {
      const uid = credentials.userId.toLowerCase();
      
      if (uid === '1234' && credentials.password === '1234') {
        setRole('driver');
        setStatus('success');
      } 
      else if (uid === '9999' && credentials.password === '9999') {
        setRole('supervisor');
        setStatus('success');
      } 
      else {
        setStatus('error');
        setErrorMessage('Incorrect User ID or Password');
      }
    }, 1500);
  };

  // Success Screen View
  if (status === 'success') {
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
              Welcome, <Text style={styles.successBold}>{role === 'driver' ? 'Rajesh Kumar' : 'Admin Supervisor'}</Text>. 
              Your session is being prepared.
            </Text>
            
            <View style={styles.successProgressContainer}>
              <View style={styles.successProgressBar}>
                <View style={[styles.successProgressFill, { width: '100%' }]} />
              </View>
              
              <TouchableOpacity 
                style={styles.successButton} 
                onPress={() => role && onLogin(role)}
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
      <StatusBar barStyle="light-content" backgroundColor="#78350f" translucent={true} />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1621244249243-437b49c5aad9?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(120, 20, 15, 0.85)', 'rgba(56, 28, 11, 0.8)', 'rgba(94, 1, 1, 0.9)']}
          style={StyleSheet.absoluteFillObject}
        />
        
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
                <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logoTitle}>SJTA</Text>
                  <Text style={styles.logoSubtitle}>BOV ADMINISTRATION</Text>
                </View>
              </View>
              <View style={styles.languageSelector}><Text style={styles.languageText}>ODIA / EN</Text></View>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Shree Jagannath{'\n'}<Text style={styles.titleHighlight}>Temple Administration</Text></Text>
              <Text style={styles.subtitle}>Enter credentials to start your divine service.</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}><Smartphone size={18} color="rgba(255,255,255,0.5)" /></View>
                <TextInput
                  style={styles.input}
                  placeholder="User ID / Mobile"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={credentials.userId}
                  onChangeText={(text) => handleChange('userId', text)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}><Lock size={18} color="rgba(255,255,255,0.5)" /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={credentials.password}
                  onChangeText={(text) => handleChange('password', text)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.3)" /> : <Eye size={20} color="rgba(255,255,255,0.3)" />}
                </TouchableOpacity>
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#fecaca" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.loginButton, status === 'loading' && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>SIGN IN</Text>
                    <ArrowRight size={20} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.bottomContainer}>
            <Text style={styles.bottomTitle}>JAGANNATHA SWAMI NAYANA PATHA GAMI BHAVA TUME</Text>
            <View style={styles.bottomFeatures}>
              <View style={styles.featureItem}><View style={styles.featureDot} /><Text style={styles.featureText}>SECURE</Text></View>
              <View style={styles.featureItem}><View style={styles.featureDot} /><Text style={styles.featureText}>TRACKED</Text></View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#78140f' },
  keyboardView: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, backgroundColor: '#d97706', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  logoText: { color: '#ffffff', fontWeight: '900', fontSize: 20 },
  logoTextContainer: { gap: 2 },
  logoTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  logoSubtitle: { color: '#fbbf24', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  languageSelector: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  languageText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  titleContainer: { marginBottom: 40 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '900', lineHeight: 38 },
  titleHighlight: { color: '#d97706' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 12 },
  formContainer: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 30, paddingHorizontal: 20, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#ffffff', fontSize: 16 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 20 },
  errorText: { color: '#fecaca', fontSize: 12, fontWeight: 'bold' },
  loginButton: { backgroundColor: '#d97706', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 8, elevation: 8 },
  loginButtonDisabled: { opacity: 0.5 },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  forgotPasswordContainer: { alignItems: 'center', marginTop: 30 },
  forgotPasswordText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold' },
  bottomContainer: { backgroundColor: 'rgba(120, 15, 15, 0.95)', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', marginBottom: 10 },
  bottomFeatures: { flexDirection: 'row', gap: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureDot: { width: 4, height: 4, backgroundColor: '#d97706', borderRadius: 2 },
  featureText: { color: '#ffffff', fontSize: 8, fontWeight: 'bold' },
  // Success Screen
  successContainer: { flex: 1, backgroundColor: '#ffffff' },
  successScrollContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successContent: { alignItems: 'center', width: '100%' },
  successIconContainer: { marginBottom: 32 },
  successIconGlow: { position: 'absolute', width: 100, height: 100, backgroundColor: '#d97706', borderRadius: 50, opacity: 0.2, top: -2, left: -2 },
  successIcon: { width: 96, height: 96, backgroundColor: '#fffbeb', borderRadius: 48, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  successTitle: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  successSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginVertical: 16 },
  successBold: { fontWeight: 'bold', color: '#1e293b' },
  successProgressContainer: { width: '100%', gap: 20 },
  successProgressBar: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 },
  successProgressFill: { height: '100%', backgroundColor: '#d97706', borderRadius: 3 },
  successButton: { backgroundColor: '#1e293b', borderRadius: 24, height: 56, justifyContent: 'center', alignItems: 'center' },
  successButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;