import React, { useEffect, useState } from 'react';
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
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {
  Bell,
  Settings,
  Camera as CameraIcon,
  AlertTriangle,
  Shield,
  CheckCircle,
  Wifi,
} from 'lucide-react-native';
import { useLogout } from '../../hooks/useAuth';
import { useCheckin } from '../../hooks/useCheckin';
import { ConfirmationAlert } from '../../components/ConfirmationAlert';
import HeaderSection from './components/HeaderSection';
import AttendanceSection from './components/AttendanceSection';
import VehicleSection from './components/VehicleSection';
import CheckinModal from './components/CheckinModal';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
const isSmallDevice = width < 375;

type ImageFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
};

const HomeScreen = ({ onLogout }: { onLogout: () => void }) => {
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState('Idle');
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [batteryText, setBatteryText] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showCheckoutAlert, setShowCheckoutAlert] = useState(false);
  const [showImageCaptureAlert, setShowImageCaptureAlert] = useState(false); // New state for image capture confirmation
  const [capturedImageFile, setCapturedImageFile] = useState<ImageFile | null>(null);
  const [checkedInData, setIsCheckedInData] = useState();

  useEffect(() => {
    const loadCheckinStatus = async () => {
      try {
        const checkinTime = await AsyncStorage.getItem('checkinTime');
        if (checkinTime) {
          setIsCheckedIn(true);
        }
      } catch (error) {
        console.error('Error loading check-in status:', error);
      }
    };

    loadCheckinStatus();
  }, []);
  
  const logoutMutation = useLogout();
  const { checkin, checkout, isLoading: checkinLoading, error, resetError } = useCheckin();

  const driverData = {
    name: "Rajesh Kumar",
    id: "D-1024",
    shift: "Shift A (08:30 AM - 04:30 PM)",
    assignedVehicle: "BOV-402",
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'
  };

  const confirmLogout = async() => {
    await logoutMutation.mutateAsync();
    onLogout();
  };

  const confirmCheckout = async () => {
    const checkOutResult = await checkout();
    // console.log(checkOutResult,'checkOutResult')
    if(checkOutResult?.status){
      
    setIsCheckedIn(false);
    setVehicleStatus('Idle');
    setShowCheckoutAlert(false);
    AsyncStorage.removeItem('checkinTime');
    }
  };

  const handleImageCaptured = (imageFile: ImageFile) => {
    console.log('Image captured for check-in:', imageFile);
    setCapturedImageFile(imageFile);
    // Show ConfirmationAlert instead of Alert.alert
    setShowImageCaptureAlert(true);
  };

  const handleContinueToBattery = () => {
    // This function is called when user taps "Continue" on the image capture confirmation
    setShowImageCaptureAlert(false);
    // You can add any additional logic here if needed
  };

  const handleCheckinFlow = () => {
    if (!isCheckedIn) {
      setShowAuthModal(true);
      setCapturedImageFile(null);
      setBatteryText('');
      setBatteryLevel(82);
      resetError();
    } else {
      setShowCheckoutAlert(true);
    }
  };

  const handleStatusChange = (status: string) => {
    if (isCheckedIn) {
      setVehicleStatus(status);
      Alert.alert(
        'Status Updated',
        `Vehicle status changed to ${status}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleCheckinSuccess = () => {
    setIsCheckedIn(true);
    setVehicleStatus('Running');
    setShowAuthModal(false);
    setCapturedImageFile(null);
    setBatteryText('');
    Alert.alert('Success', 'You have successfully checked in!');
  };

  const isLoggingOut = logoutMutation.isPending;
  const totalLoading = checkinLoading;

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
        <HeaderSection
          isIOS={isIOS}
          isSmallDevice={isSmallDevice}
          driverData={driverData}
          isCheckedIn={isCheckedIn}
          isLoggingOut={isLoggingOut}
          hasNotifications={hasNotifications}
          onNotificationPress={() => {
            setHasNotifications(false);
            Alert.alert('Notifications', 'No new notifications');
          }}
          onProfilePress={() => Alert.alert('Profile', 'View profile details')}
          onLogoutPress={() => setShowAlert(true)}
        />

        <View style={styles.mainContent}>
          <AttendanceSection
            isIOS={isIOS}
            isSmallDevice={isSmallDevice}
            isCheckedIn={isCheckedIn}
            isLoggingOut={isLoggingOut}
            totalLoading={totalLoading}
            onCheckinPress={handleCheckinFlow}
          />

          <VehicleSection
            isIOS={isIOS}
            isSmallDevice={isSmallDevice}
            driverData={driverData}
            isCheckedIn={isCheckedIn}
            isLoggingOut={isLoggingOut}
            totalLoading={totalLoading}
            vehicleStatus={vehicleStatus}
            batteryLevel={batteryLevel}
            onStatusChange={handleStatusChange}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity disabled={isLoggingOut || totalLoading}>
                <Settings size={isSmallDevice ? 14 : 16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[styles.actionCard, isIOS && styles.iosShadow]}
                onPress={() => Alert.alert('Report Fault', 'Fault reporting feature')}
                activeOpacity={0.7}
                disabled={isLoggingOut || totalLoading}
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
                disabled={isLoggingOut || totalLoading}
              >
                <View style={[styles.actionIcon, styles.photoIcon]}>
                  <CameraIcon size={isSmallDevice ? 20 : 24} color="#D97706" />
                </View>
                <Text style={styles.actionTitle}>Battery Photo</Text>
                <Text style={styles.actionSubtitle}>Daily log</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.infoCard, isIOS && styles.iosShadow]}>
            <View style={styles.infoRow}>
              <Shield size={isSmallDevice ? 16 : 18} color="#D97706" />
              <Text style={styles.infoText}>Vehicle insured until Dec 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <CheckCircle size={isSmallDevice ? 16 : 18} color="#22C55E" />
              <Text style={styles.infoText}>Last service: 15 Nov 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Wifi size={isSmallDevice ? 16 : 18} color="#3B82F6" />
              <Text style={styles.infoText}>GPS: Active • Last sync: 2 min ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <CheckinModal
        visible={showAuthModal}
        onClose={() => {
          if (!totalLoading) {
            setShowAuthModal(false);
            setCapturedImageFile(null);
            setBatteryText('');
          }
        }}
        capturedImageFile={capturedImageFile}
        batteryText={batteryText}
        batteryLevel={batteryLevel}
        isIOS={isIOS}
        isSmallDevice={isSmallDevice}
        totalLoading={totalLoading}
        error={error}
        onImageCaptured={handleImageCaptured}
        onBatteryTextChange={setBatteryText}
        onBatteryLevelChange={setBatteryLevel}
        onCheckinSuccess={handleCheckinSuccess}
        checkin={checkin}
      />
      
      {/* Logout Confirmation Alert */}
      <ConfirmationAlert
        visible={showAlert}
        isCheckedIn={isCheckedIn}
        onConfirm={confirmLogout}
        onCancel={() => setShowAlert(false)}
      />
      
      {/* Checkout Confirmation Alert */}
      <ConfirmationAlert
        title='Check Out'
        message='Are you sure you want to check out?'
        confirmText='Check Out'
        visible={showCheckoutAlert}
        isCheckedIn={isCheckedIn}
        onConfirm={confirmCheckout}
        onCancel={() => setShowCheckoutAlert(false)}
      />
      
      {/* Image Capture Confirmation Alert - This replaces the Alert.alert */}
      <ConfirmationAlert
        title='Success!'
        message='Face image captured successfully! Tap Continue to proceed to battery status.'
        confirmText='Continue'
        visible={showImageCaptureAlert}
        isCheckedIn={isCheckedIn}
        onConfirm={handleContinueToBattery}
        onCancel={() => setShowImageCaptureAlert(false)}
      />
      
      <View style={styles.footer}>
        <Text style={styles.mantraText}>ॐ जय जगन्नाथ</Text>
        <Text style={styles.footerText}>SJTA Driver Portal v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same as in your original code
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
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});

export default HomeScreen;