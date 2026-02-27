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
import CheckoutModal from './components/CheckoutModal';
import { useDriver, useUpdateVehicleOperationalStatus, useVehicleStatus } from '../../hooks/useDriver';

const { width } = Dimensions.get('window');
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
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState('Idle');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  
  // Check-in state
  const [checkinBatteryLevel, setCheckinBatteryLevel] = useState(82);
  const [checkinBatteryText, setCheckinBatteryText] = useState('');
  const [checkinCapturedImageFile, setCheckinCapturedImageFile] = useState<ImageFile | null>(null);
  
  // Check-out state
  const [checkoutBatteryLevel, setCheckoutBatteryLevel] = useState(82);
  const [checkoutBatteryText, setCheckoutBatteryText] = useState('');
  const [checkoutCapturedImageFile, setCheckoutCapturedImageFile] = useState<ImageFile | null>(null);
  const [password, setPassword] = useState(''); // For password input during checkout
  const [driverHomeScreenData, setDriverHomeScreenData] = useState<any>({});
  const [vehicleStatusData, setVehicleStatusData] = useState<any>({});
    const [selectedStatus, setSelectedStatus] = useState<any>(null);
    const [justifications, setJustification] = useState('');
  const [vehicleOperationalParams,setVehicleOperationalParams]= useState<any>({});
  const [isUpdateVehicleOperationalStatus,setIsUpdateVehicleOperationalStatus]= useState<any>(false);
  // console.log(selectedStatus,"selectedStatus++++++++++++")
  const { 
    data:driverHomeScreenAPIData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useDriver();

    const { 
    data:vehicleStatusAPIData, 
    isLoading:isLoadingVehicleStatus, 
    error:errorVehicleStatus, 
    refetch:refetchVehicleStatus,
    isRefetching:isRefetchingVehicleStatus 
  } = useVehicleStatus();
const updateVehicleStatus = useUpdateVehicleOperationalStatus();

const {
  data: updateVehicleStatusAPIData,
  // isLoading: updateIsLoadingVehicleStatus,
  error: updateErrorVehicleStatus,
} = updateVehicleStatus;
  
    useEffect(() => {
    // if (driverHomeScreenData) {
    setDriverHomeScreenData(driverHomeScreenAPIData)
    setVehicleStatusData(vehicleStatusAPIData)
      
    // }
  }, [driverHomeScreenAPIData,vehicleStatusData]);
  // console.log('Driver vehicleStatusAPIData loaded:', driverHomeScreenData);
  useEffect(() => {
    const loadCheckinStatus = async () => {
      try {
        const storedCheckinTime = await AsyncStorage.getItem('checkinTime');
        // console.log(storedCheckinTime,'storedCheckinTime====')
        // console.log('Loaded checkinTime from storage:', storedCheckinTime);
        if (storedCheckinTime) {
          setIsCheckedIn(true);
          setCheckinTime(storedCheckinTime);
          setVehicleStatus(driverHomeScreenData?.vehicle_details?.vehicle_status);
        } else {
          setIsCheckedIn(false);
          setCheckinTime(null);
          setVehicleStatus('');
        }
      } catch (error) {
        console.error('Error loading check-in status:', error);
      }
    };

    loadCheckinStatus();
  }, [showCheckoutModal,showCheckinModal]);
  useEffect(() => {
  setVehicleOperationalParams({
    vehicle_id: driverHomeScreenData?.vehicle_details?.vehicle_id,
    roster_id: driverHomeScreenData?.roster_details?.roster_master_id,
    shift_id: driverHomeScreenData?.shift_details?.shift_id,
    status: selectedStatus?.id,
    justification: justifications
  })
    }, [selectedStatus,justifications]);
  const logoutMutation = useLogout();
  const { 
    checkin, 
    checkout, 
    isLoading: checkinLoading, 
    error: checkinError, 
    resetError 
  } = useCheckin();
  useEffect(() => {
  refetch();
}, [updateVehicleStatusAPIData]);
  // const driverData = {
  //   name: "Rajesh Kumar",
  //   id: "D-1024",
  //   shift: "Shift A (08:30 AM - 04:30 PM)",
  //   assignedVehicle: "BOV-402",
  //   avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'
  // };

  const confirmLogout = async() => {
    await logoutMutation.mutateAsync();
    onLogout();
  };

  // Check-in Handlers
  const handleCheckinFlow = () => {
    if (!isCheckedIn) {
      setShowCheckinModal(true);
      setCheckinCapturedImageFile(null);
      setCheckinBatteryText('');
      setCheckinBatteryLevel(82);
      resetError();
    }
  };

  const handleCheckinImageCaptured = (imageFile: ImageFile) => {
    // console.log('Image captured for check-in:', imageFile);
    setCheckinCapturedImageFile(imageFile);
  };

  const handleCheckinSuccess = async (checkinData?: any) => {
    setIsCheckedIn(true);
    setVehicleStatus(driverHomeScreenData?.vehicle_details?.vehicle_status);
    setShowCheckinModal(false);
    setCheckinCapturedImageFile(null);
    setCheckinBatteryText('');
    
    // Store check-in time if it's in the response
    if (checkinData?.data?.check_in) {
      await AsyncStorage.setItem('checkinTime', checkinData.data.check_in);
      setCheckinTime(checkinData.data.check_in);
    }
    
    // Alert.alert('Success', 'You have successfully checked in!');
  };

  // Check-out Handlers
  const handleCheckoutFlow = () => {
    // console.log('handleCheckoutFlow called - isCheckedIn:', isCheckedIn);
    if (isCheckedIn) {
      console.log('Opening checkout modal');
      setShowCheckoutModal(true);
      setCheckoutCapturedImageFile(null);
      setCheckoutBatteryText('');
      setCheckoutBatteryLevel(82);
      setPassword('');
      resetError();
    } else {
      console.log('Cannot checkout - not checked in');
    }
  };

  const handleCheckoutImageCaptured = (imageFile: ImageFile) => {
    // console.log('Image captured for check-out:', imageFile);
    setCheckoutCapturedImageFile(imageFile);
  };

  const handleCheckoutSuccess = async () => {
    setIsCheckedIn(false);
    setVehicleStatus('Idle');
    setShowCheckoutModal(false);
    setCheckoutCapturedImageFile(null);
    setCheckoutBatteryText('');
    setPassword('');
    await AsyncStorage.removeItem('checkinTime');
    setCheckinTime(null);
    Alert.alert('Success', 'You have successfully checked out!');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleStatusChange = () => {
    // console.log('called manoj',vehicleOperationalParams)
    //  updateVehicleStatus.mutate(vehicleOperationalParams)
    if (isCheckedIn) {
      // setVehicleStatus(status);
      // setIsUpdateVehicleOperationalStatus(true)
      if(justifications){
           updateVehicleStatus.mutate(vehicleOperationalParams)
            //  setJustification('');
      // setSelectedStatus(null);
      }
      
    
      // Alert.alert(
      //   'Status Updated',
      //   `Vehicle status changed to ${status}`,
      //   [{ text: 'OK' }]
      // );
    }
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
          driverData={driverHomeScreenData}
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
            checkinTime=''
            checkoutTime=''
            onCheckinPress={handleCheckinFlow}
            onCheckoutPress={handleCheckoutFlow}
          />

          <VehicleSection
            isIOS={isIOS}
            isSmallDevice={isSmallDevice}
            driverData={driverHomeScreenData}
            isCheckedIn={isCheckedIn}
            isLoggingOut={isLoggingOut}
            totalLoading={totalLoading}
            vehicleStatus={vehicleStatus}
            allVehicleStatusData={vehicleStatusData}
            batteryLevel={isCheckedIn ? 82 : 0}
            onStatusChange={handleStatusChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            justification={justifications}
            setJustification={setJustification}
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
              <Text style={styles.infoText}>Vehicle insured until {driverHomeScreenData?.vehicle_details?.insurance_expiry_date}</Text>
            </View>
            {driverHomeScreenData?.vehicle_details?.last_maintenance_closure&&<View style={styles.infoRow}>
              <CheckCircle size={isSmallDevice ? 16 : 18} color="#22C55E" />
              <Text style={styles.infoText}>Last service: {driverHomeScreenData?.vehicle_details?.last_maintenance_closure}</Text>
            </View>}
            <View style={styles.infoRow}>
              <Wifi size={isSmallDevice ? 16 : 18} color="#3B82F6" />
              <Text style={styles.infoText}>GPS: Active • Last sync: 2 min ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Check-in Modal */}
      <CheckinModal
        visible={showCheckinModal}
        onClose={() => {
          if (!totalLoading) {
            setShowCheckinModal(false);
            setCheckinCapturedImageFile(null);
            setCheckinBatteryText('');
          }
        }}
        capturedImageFile={checkinCapturedImageFile}
        batteryText={checkinBatteryText}
        batteryLevel={checkinBatteryLevel}
        isIOS={isIOS}
        isSmallDevice={isSmallDevice}
        totalLoading={totalLoading}
        error={checkinError}
        onImageCaptured={handleCheckinImageCaptured}
         onBatteryImageCaptured={() => {}}
        onBatteryTextChange={setCheckinBatteryText}
        onBatteryLevelChange={setCheckinBatteryLevel}
        onCheckinSuccess={handleCheckinSuccess}
        checkin={checkin}
      />
      
      {/* Check-out Modal */}
      <CheckoutModal
        visible={showCheckoutModal}
        onClose={() => {
          if (!totalLoading) {
            setShowCheckoutModal(false);
            setCheckoutCapturedImageFile(null);
            setCheckoutBatteryText('');
            setPassword('');
          }
        }}
        capturedImageFile={checkoutCapturedImageFile}
        batteryText={checkoutBatteryText}
        batteryLevel={checkoutBatteryLevel}
         onBatteryImageCaptured={() => {}}
        // password={password}
        checkinTime={checkinTime}
        isIOS={isIOS}
        isSmallDevice={isSmallDevice}
        totalLoading={totalLoading}
        error={checkinError}
        onImageCaptured={handleCheckoutImageCaptured}
        onBatteryTextChange={setCheckoutBatteryText}
        onBatteryLevelChange={setCheckoutBatteryLevel}
        // onPasswordChange={handlePasswordChange}
        onCheckoutSuccess={handleCheckoutSuccess}
        checkout={checkout}
      />
      
      {/* Logout Confirmation Alert */}
      <ConfirmationAlert
        visible={showAlert}
        isCheckedIn={isCheckedIn}
        onConfirm={confirmLogout}
        onCancel={() => setShowAlert(false)}
      />
      
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