import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Power,
  Battery,
  Bell,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Camera,
  LogOut,
  Navigation as NavIcon,
  X,
  Shield,
  BatteryCharging,
  Car,
  Wifi,
  Settings,
} from 'lucide-react-native';
import { useLogout } from '../../hooks/useAuth';
import { ConfirmationAlert } from '../../components/ConfirmationAlert';
import FaceDetectionComponent from '../../components/FaceDetection';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
const isSmallDevice = width < 375;

const HomeScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [vehicleStatus, setVehicleStatus] = useState('Idle');
  const [batteryLevel] = useState(82);
  const [batteryText, setBatteryText] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showCheckoutAlert, setShowCheckoutAlert] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the logout mutation hook
  const logoutMutation = useLogout();

  const driverData = {
    name: "Rajesh Kumar",
    id: "D-1024",
    shift: "Shift A (08:30 AM - 04:30 PM)",
    assignedVehicle: "BOV-402",
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'
  };

  const statusColors: any = {
    'Running': { bg: '#DCFCE7', text: '#15803D', icon: '#22C55E' },
    'Charging': { bg: '#FEF3C7', text: '#D97706', icon: '#F59E0B' },
    'Cleaning': { bg: '#DBEAFE', text: '#1D4ED8', icon: '#3B82F6' },
    'Fault': { bg: '#FEE2E2', text: '#DC2626', icon: '#EF4444' },
    'Idle': { bg: '#F1F5F9', text: '#64748B', icon: '#94A3B8' }
  };

  const confirmLogout = async() => {
    // Trigger logout mutation
    await logoutMutation.mutateAsync();
    
    // Call the parent logout function after successful logout
    onLogout();
  };

  const confirmCheckout = () => {
    setIsCheckedIn(false);
    setVehicleStatus('Idle');
    setShowCheckoutAlert(false);
  };

  const userData = AsyncStorage.getItem('userType');
  const userToken = AsyncStorage.getItem('userToken');
  console.log(userData,'userData')
  console.log(userToken,'userToken')

  const handleFaceDetectionSuccess = (image: any) => {
    setCapturedImage(image);
    setFaceDetected(true);
    
    Alert.alert(
      'Face Detected!',
      'Face verified successfully. Proceeding to next step...',
      [{ 
        text: 'Continue', 
        onPress: () => {
          setTimeout(() => {
            nextAuthStep();
            setFaceDetected(false);
          }, 500);
        }
      }]
    );
  };

  const handleCheckInFlow = () => {
    if (!isCheckedIn) {
      setShowAuthModal(true);
      setAuthStep(1);
      setCapturedImage(null);
      setFaceDetected(false);
    } else {
      setShowCheckoutAlert(true);
    }
  };

  const nextAuthStep = () => {
    if (authStep < 3) {
      setAuthStep(authStep + 1);
    } else {
      setShowAuthModal(false);
      setIsCheckedIn(true);
      setVehicleStatus('Running');
      setBatteryText('');
      setCapturedImage(null);
      Alert.alert('Success', 'You have successfully checked in!');
    }
  };

  const handleStatusChange = (status: string) => {
    if (isCheckedIn) {
      setVehicleStatus(status);
      // Alert.alert(
      //   'Status Updated',
      //   `Vehicle status changed to ${status}`,
      //   [{ text: 'OK' }]
      // );
    }
  };

  const renderStatusIcon = (status: string, isActive: boolean) => {
    const iconColor = isActive ? statusColors[status]?.icon || '#D97706' : '#94A3B8';
    const iconSize = isSmallDevice ? 16 : 20;

    switch (status) {
      case 'Running':
        return <NavIcon size={iconSize} color={iconColor} />;
      case 'Charging':
        return <BatteryCharging size={iconSize} color={iconColor} />;
      case 'Cleaning':
        return <CheckCircle2 size={iconSize} color={iconColor} />;
      case 'Fault':
        return <AlertTriangle size={iconSize} color={iconColor} />;
      default:
        return <Car size={iconSize} color={iconColor} />;
    }
  };

  // Determine if logout is in progress
  const isLoggingOut = logoutMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isIOS ? "dark-content" : "light-content"}
        backgroundColor={isIOS ? "#5d0e0aff" : "#5d0e0aff"}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={isIOS}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Image
                  source={require('../../assets/image/purilogo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.logoSubtitle}>SJTA Driver App</Text>
                <Text style={styles.logoTitle}>Jai Jagannath</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={[styles.notificationButton, isIOS && styles.iosShadow]}
                onPress={() => {
                  setHasNotifications(false);
                  Alert.alert('Notifications', 'No new notifications');
                }}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                <Bell size={isSmallDevice ? 18 : 20} color="#94A3B8" />
                {hasNotifications && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.avatarContainer, isIOS && styles.iosShadow]}
                onPress={() => Alert.alert('Profile', 'View profile details')}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                {/* <Image 
                  source={{ uri: driverData.avatarUrl }} 
                  style={styles.avatar}
                  defaultSource={require('./assets/default-avatar.png')}
                /> */}
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.profileCard, isIOS && styles.iosShadow]}>
            <View style={styles.profileContent}>
              <View style={styles.profileInfo}>
                <Text style={styles.shiftText}>{driverData.shift}</Text>
                <Text style={styles.driverName}>{driverData.name}</Text>
                <View style={[styles.idBadge,isCheckedIn && styles.idBadgeActive]}>
                  <View style={[styles.statusDot, isCheckedIn && styles.statusDotActive]} />
                  <Text style={[styles.idText,isCheckedIn && styles.idTextActive] }>ID: {driverData.id} • {isCheckedIn ? 'ONLINE' : 'OFFLINE'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.logoutButton, 
                  isIOS && styles.iosButton,
                  isLoggingOut && styles.logoutButtonDisabled
                ]}
                onPress={()=>{setShowAlert(true)}}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner} />
                  </View>
                ) : (
                  <LogOut size={isSmallDevice ? 18 : 22} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Attendance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shift Attendance</Text>
              <View style={styles.gpsBadge}>
                <MapPin size={isSmallDevice ? 9 : 10} color="#D97706" />
                <Text style={styles.gpsText}>GPS Recorded</Text>
              </View>
            </View>
            <View style={[styles.attendanceCard, isIOS && styles.iosShadow]}>
              <View style={styles.attendanceContent}>
                <View style={styles.attendanceLeft}>
                  <View style={[
                    styles.attendanceIcon,
                    isCheckedIn ? styles.attendanceIconActive : styles.attendanceIconInactive,
                    isIOS && styles.iosButton
                  ]}>
                    {isCheckedIn ? (
                      <CheckCircle2 size={isSmallDevice ? 28 : 32} color="#FFFFFF" />
                    ) : (
                      <Power size={isSmallDevice ? 28 : 32} color="#CBD5E1" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.attendanceStatus}>
                      {isCheckedIn ? 'Shift Active' : 'Off-Duty'}
                    </Text>
                    <Text style={styles.attendanceTime}>
                      {isCheckedIn ? 'Check-in: 08:30 AM' : 'Check-in Required'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkInButton,
                    isCheckedIn ? styles.checkOutButton : styles.checkInButtonActive,
                    isIOS && styles.iosButton,
                    !isCheckedIn && isIOS && styles.iosPrimaryButton,
                    isLoggingOut && styles.buttonDisabled
                  ]}
                  onPress={handleCheckInFlow}
                  activeOpacity={0.7}
                  disabled={isLoggingOut}
                >
                  <Text style={[
                    styles.checkInButtonText,
                    isCheckedIn && styles.checkOutButtonText
                  ]}>
                    {isCheckedIn ? 'CHECK OUT' : 'CHECK IN'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Vehicle Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assigned Vehicle</Text>
              {isCheckedIn && (
                <View style={styles.connectionStatus}>
                  <Wifi size={isSmallDevice ? 10 : 12} color="#22C55E" />
                  <View style={styles.pulseDot} />
                </View>
              )}
            </View>
            <View style={[styles.vehicleCard, isIOS && styles.iosShadow]}>
              <View style={styles.vehicleHeader}>
                <View>
                  <Text style={styles.vehicleLabel}>Current BOV</Text>
                  <Text style={styles.vehicleNumber}>{driverData.assignedVehicle}</Text>
                </View>
                <View style={styles.vehicleStats}>
                  <View style={styles.batteryContainer}>
                    <Battery size={isSmallDevice ? 16 : 18} color={batteryLevel < 20 ? '#DC2626' : batteryLevel < 50 ? '#F59E0B' : '#22C55E'} />
                    <Text style={[
                      styles.batteryText,
                      batteryLevel < 20 && styles.lowBatteryText,
                      batteryLevel < 50 && batteryLevel >= 20 && styles.mediumBatteryText
                    ]}>
                      {batteryLevel}%
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusColors[vehicleStatus].bg,
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: statusColors[vehicleStatus].text }
                    ]}>
                      {vehicleStatus}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statusGrid}>
                {['Running', 'Charging', 'Cleaning', 'Fault'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    disabled={!isCheckedIn || isLoggingOut}
                    onPress={() => handleStatusChange(status)}
                    style={[
                      styles.statusButton,
                      vehicleStatus === status && styles.statusButtonActive,
                      !isCheckedIn && styles.statusButtonDisabled,
                      isIOS && styles.iosButton
                    ]}
                    activeOpacity={0.7}
                  >
                    {renderStatusIcon(status, vehicleStatus === status)}
                    <Text style={[
                      styles.statusButtonText,
                      vehicleStatus === status && styles.statusButtonTextActive
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity disabled={isLoggingOut}>
                <Settings size={isSmallDevice ? 14 : 16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[styles.actionCard, isIOS && styles.iosShadow]}
                onPress={() => Alert.alert('Report Fault', 'Fault reporting feature')}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                <View style={[styles.actionIcon, styles.reportIcon]}>
                  <AlertTriangle size={isSmallDevice ? 20 : 24} color="#DC2626" />
                </View>
                <Text style={styles.actionTitle}>Report Fault</Text>
                <Text style={styles.actionSubtitle}>Vehicle issues</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, isIOS && styles.iosShadow]}
                onPress={() => Alert.alert('Battery Photo', 'Camera will open')}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                <View style={[styles.actionIcon, styles.photoIcon]}>
                  <Camera size={isSmallDevice ? 20 : 24} color="#D97706" />
                </View>
                <Text style={styles.actionTitle}>Battery Photo</Text>
                <Text style={styles.actionSubtitle}>Daily log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Info */}
          <View style={[styles.infoCard, isIOS && styles.iosShadow]}>
            <View style={styles.infoRow}>
              <Shield size={isSmallDevice ? 16 : 18} color="#D97706" />
              <Text style={styles.infoText}>Vehicle insured until Dec 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <CheckCircle2 size={isSmallDevice ? 16 : 18} color="#22C55E" />
              <Text style={styles.infoText}>Last service: 15 Nov 2024</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Check-in Modal */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType={isIOS ? 'slide' : 'fade'}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isIOS ? styles.iosModal : styles.androidModal
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verification Step {authStep}/2</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAuthModal(false);
                  setCapturedImage(null);
                  setFaceDetected(false);
                }}
                style={styles.closeButton}
                activeOpacity={0.7}
                disabled={isLoggingOut || isLoading}
              >
                <X size={isSmallDevice ? 20 : 24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.stepContent}>
              {authStep === 1 ? (
                <>
                  <View style={[
                    styles.faceAuthContainer,
                    isIOS && styles.iosBorder,
                    faceDetected && styles.faceDetectedContainer
                  ]}>
                    {capturedImage ? (
                      <Image 
                        source={{ uri: capturedImage.uri }} 
                        style={styles.capturedImage}
                      />
                    ) : (
                      <User size={isSmallDevice ? 50 : 60} color="#E2E8F0" />
                    )}
                    {faceDetected && (
                      <View style={styles.successOverlay}>
                        <CheckCircle2 size={isSmallDevice ? 24 : 28} color="#22C55E" />
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.stepDescription}>
                    {capturedImage 
                      ? 'Face detected! Tap continue to proceed'
                      : 'Capture your face for verification'
                    }
                  </Text>
                  
                  <FaceDetectionComponent 
                    onSuccess={handleFaceDetectionSuccess}
                  />
                  
                  {capturedImage && !faceDetected && (
                    <Text style={styles.instructionText}>
                      Please position your face clearly in the frame
                    </Text>
                  )}
                  
                  {faceDetected && (
                    <TouchableOpacity
                      style={[
                        styles.continueButton,
                        isIOS && styles.iosPrimaryButton
                      ]}
                      onPress={() => nextAuthStep()}
                      activeOpacity={0.7}
                      disabled={isLoggingOut || isLoading}
                    >
                      <Text style={styles.continueButtonText}>
                        Continue to Next Step
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.batteryHeader}>
                    <Battery size={isSmallDevice ? 24 : 28} color="#D97706" />
                    <Text style={styles.batteryModalTitle}>Battery Status</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.batteryTextInput,
                      isIOS && styles.iosInput
                    ]}
                    placeholder="Enter battery status remarks..."
                    placeholderTextColor="#94A3B8"
                    value={batteryText}
                    onChangeText={setBatteryText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isLoggingOut}
                  />
                  <TouchableOpacity
                    style={[
                      styles.finishButton,
                      isIOS && styles.iosButton
                    ]}
                    onPress={nextAuthStep}
                    activeOpacity={0.7}
                    disabled={isLoggingOut}
                  >
                    <Text style={styles.finishButtonText}>Complete Check-in</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      <ConfirmationAlert
        visible={showAlert}
        isCheckedIn={isCheckedIn}
        onConfirm={confirmLogout}
        onCancel={() => setShowAlert(false)}
      />
      
      <ConfirmationAlert
        title='Check Out'
        message='Are you sure you want to check out?'
        confirmText='Check Out'
        visible={showCheckoutAlert}
        isCheckedIn={isCheckedIn}
        onConfirm={confirmCheckout}
        onCancel={() => setShowCheckoutAlert(false)}
      />
      
      {/* Footer Mantra */}
      <View style={styles.footer}>
        <Text style={styles.mantraText}>ॐ जय जगन्नाथ</Text>
        <Text style={styles.footerText}>SJTA Driver Portal v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: isSmallDevice ? 60 : 80,
  },
  header: {
    backgroundColor: 'rgb(157, 20, 12)',
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: Platform.OS === 'ios'
      ? (isSmallDevice ? 15 : 20)
      : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 35,
    paddingBottom: isSmallDevice ? 16 : 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  logo: {
    width: isSmallDevice ? 36 : 50,
    height: isSmallDevice ? 36 : 50,
    borderRadius: isSmallDevice ? 10 : 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: { width: '100%', height: '100%' },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: isSmallDevice ? 16 : 18,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  logoSubtitle: {
    color: '#D97706',
    fontSize: isSmallDevice ? 9 : 12,
    fontWeight: 'bold',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  logoTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  notificationButton: {
    padding: isSmallDevice ? 8 : 10,
    backgroundColor: '#F8FAFC',
    borderRadius: isSmallDevice ? 10 : 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationBadge: {
    position: 'absolute',
    top: isSmallDevice ? 8 : 10,
    right: isSmallDevice ? 8 : 10,
    width: isSmallDevice ? 6 : 8,
    height: isSmallDevice ? 6 : 8,
    backgroundColor: '#EF4444',
    borderRadius: isSmallDevice ? 3 : 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  avatarContainer: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 10 : 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileCard: {
    backgroundColor: '#D97706',
    borderRadius: isSmallDevice ? 20 : 24,
    padding: isSmallDevice ? 12 : 16,
    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  shiftText: {
    fontSize: isSmallDevice ? 9 : 12,
    color: 'rgb(157, 20, 12)',
    fontWeight: 'bold',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  driverName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: isSmallDevice ? 2 : 4,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 10 : 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: isSmallDevice ? 5 : 6,
    height: isSmallDevice ? 5 : 6,
    borderRadius: isSmallDevice ? 2.5 : 3,
    backgroundColor: '#64748B',
  },
  statusDotActive: {
    backgroundColor: '#22C55E',
  },
  idText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  logoutButton: {
    backgroundColor: 'rgb(188, 16, 7)',
    padding: isSmallDevice ? 10 : 12,
    borderRadius: isSmallDevice ? 10 : 12,
    marginLeft: isSmallDevice ? 8 : 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
  mainContent: {
    padding: isSmallDevice ? 16 : 20,
  },
  section: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 8 : 10,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    fontFamily: isIOS ? 'System' : 'sans-serif',
    letterSpacing: 0.5,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 3 : 4,
  },
  gpsText: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#94A3B8',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseDot: {
    width: isSmallDevice ? 6 : 8,
    height: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 3 : 4,
    backgroundColor: '#22C55E',
    ...Platform.select({
      ios: {
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 12 : 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  attendanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
  },
  attendanceIcon: {
    width: isSmallDevice ? 45 : 50,
    height: isSmallDevice ? 45 : 50,
    borderRadius: isSmallDevice ? 12 : 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceIconActive: {
    backgroundColor: '#22C55E',
  },
  attendanceIconInactive: {
    backgroundColor: '#F1F5F9',
  },
  attendanceStatus: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  attendanceTime: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#94A3B8',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  checkInButton: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 10 : 12,
    borderWidth: 1,
  },
  checkInButtonActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  checkOutButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FEE2E2',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  checkOutButtonText: {
    color: '#DC2626',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 20 : 24,
    padding: isSmallDevice ? 16 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  vehicleLabel: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#D97706',
    fontWeight: 'bold',
    fontFamily: isIOS ? 'System' : 'sans-serif',
    letterSpacing: 0.5,
  },
  vehicleNumber: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  vehicleStats: {
    alignItems: 'flex-end',
    gap: isSmallDevice ? 4 : 5,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 5,
    backgroundColor: '#F8FAFC',
    padding: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 6 : 8,
  },
  batteryText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: 'bold',
    color: '#22C55E',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  lowBatteryText: {
    color: '#DC2626',
  },
  mediumBatteryText: {
    color: '#F59E0B',
  },
  statusBadge: {
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 6 : 8,
  },
  statusText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: 'bold',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    padding: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusButtonActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusButtonDisabled: {
    opacity: 0.5,
  },
  statusButtonText: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#94A3B8',
    marginTop: isSmallDevice ? 3 : 5,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  statusButtonTextActive: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: isSmallDevice ? 12 : 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: isSmallDevice ? 12 : 15,
    borderRadius: isSmallDevice ? 16 : 20,
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  actionIcon: {
    width: isSmallDevice ? 40 : 45,
    height: isSmallDevice ? 40 : 45,
    borderRadius: isSmallDevice ? 10 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 6 : 10,
  },
  reportIcon: {
    backgroundColor: '#FEE2E2',
  },
  photoIcon: {
    backgroundColor: '#FEF3C7',
  },
  actionTitle: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#94A3B8',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 12 : 16,
    marginTop: isSmallDevice ? 8 : 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  infoText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#64748B',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: isSmallDevice ? 16 : 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: isSmallDevice ? 20 : 24,
    padding: isSmallDevice ? 16 : 20,
  },
  iosModal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  androidModal: {
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  modalTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  closeButton: {
    padding: isSmallDevice ? 4 : 6,
  },
  stepContent: {
    alignItems: 'center',
  },
  faceAuthContainer: {
    width: isSmallDevice ? 120 : 140,
    height: isSmallDevice ? 120 : 140,
    borderRadius: isSmallDevice ? 20 : 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
  },
  faceDetectedContainer: {
    borderStyle: 'solid',
    borderColor: '#22C55E',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  successOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
  },
  stepDescription: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  instructionText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  continueButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: isSmallDevice ? 32 : 40,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: isSmallDevice ? 10 : 12,
    width: '100%',
    alignItems: 'center',
    marginTop: isSmallDevice ? 16 : 20,
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  batteryModalTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  batteryTextInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : 15,
    height: isSmallDevice ? 80 : 100,
    marginBottom: isSmallDevice ? 16 : 20,
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  finishButton: {
    backgroundColor: '#1E293B',
    width: '100%',
    padding: isSmallDevice ? 14 : 15,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    paddingVertical: isSmallDevice ? 8 : 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mantraText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#D97706',
    fontWeight: 'bold',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
    marginBottom: 2,
  },
  footerText: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#94A3B8',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  // Platform-specific styles
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iosButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  iosPrimaryButton: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iosBorder: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iosInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idTextActive: {
    color: '#038934',
  },
  idBadgeActive: {
    backgroundColor: '#0b8d3b1f',
  },
});

export default HomeScreen;