import React, { useState } from 'react';
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
} from 'react-native';

// Ensure these are installed: npm install lucide-react-native react-native-svg
import {
  User,
  Power,
  Battery,
  Bell,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Car,
  RotateCcw,
  Camera,
  LogOut,
  Navigation as NavIcon,
  X,
} from 'lucide-react-native';

const HomeScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [vehicleStatus, setVehicleStatus] = useState('Idle');
  const [batteryLevel] = useState(82);
  const [batteryText, setBatteryText] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);

  const driverData = {
    name: "Rajesh Kumar",
    id: "D-1024",
    shift: "Shift A (08:30 AM - 04:30 PM)",
    assignedVehicle: "BOV-402",
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  };

  const statusColors: any = {
    'Running': { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
    'Charging': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    'Cleaning': { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
    'Fault': { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
    'Idle': { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' }
  };

  const handleCheckInFlow = () => {
    if (!isCheckedIn) {
      setShowAuthModal(true);
      setAuthStep(1);
    } else {
      Alert.alert('Check Out', 'Are you sure you want to check out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check Out', onPress: () => { setIsCheckedIn(false); setVehicleStatus('Idle'); } }
      ]);
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
              <View>
                <Text style={styles.logoSubtitle}>SJTA Driver App</Text>
                <Text style={styles.logoTitle}>Jai Jagannath</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.notificationButton} onPress={() => setHasNotifications(false)}>
                <Bell size={24} color="#64748B" />
                {hasNotifications && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: driverData.avatarUrl }} style={styles.avatar} />
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shiftText}>{driverData.shift}</Text>
                <Text style={styles.driverName}>{driverData.name}</Text>
                <View style={styles.idBadge}>
                  <View style={[styles.statusDot, isCheckedIn && styles.statusDotActive]} />
                  <Text style={styles.idText}>ID: {driverData.id} • {isCheckedIn ? 'ONLINE' : 'OFFLINE'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <LogOut size={24} color="#FFFFFF" />
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
                <MapPin size={14} color="#D97706" />
                <Text style={styles.gpsText}>GPS Recorded</Text>
              </View>
            </View>
            <View style={styles.attendanceCard}>
              <View style={styles.attendanceContent}>
                <View style={styles.attendanceLeft}>
                  <View style={[styles.attendanceIcon, isCheckedIn ? styles.attendanceIconActive : styles.attendanceIconInactive]}>
                    {isCheckedIn ? <CheckCircle2 size={30} color="#FFFFFF" /> : <Power size={30} color="#94A3B8" />}
                  </View>
                  <View>
                    <Text style={styles.attendanceStatus}>{isCheckedIn ? 'Shift Active' : 'Off-Duty'}</Text>
                    <Text style={styles.attendanceTime}>{isCheckedIn ? 'Check-in: 08:30 AM' : 'Check-in Required'}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.checkInButton, isCheckedIn ? styles.checkOutButton : styles.checkInButtonActive]}
                  onPress={handleCheckInFlow}
                >
                  <Text style={[styles.checkInButtonText, isCheckedIn && styles.checkOutButtonText]}>
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
              {isCheckedIn && <View style={styles.pulseDot} />}
            </View>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <View>
                  <Text style={styles.vehicleLabel}>Current BOV</Text>
                  <Text style={styles.vehicleNumber}>{driverData.assignedVehicle}</Text>
                </View>
                <View style={styles.vehicleStats}>
                  <View style={styles.batteryContainer}>
                    <Battery size={20} color={batteryLevel < 20 ? '#DC2626' : '#22C55E'} />
                    <Text style={styles.batteryText}>{batteryLevel}%</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[vehicleStatus].bg, borderColor: statusColors[vehicleStatus].border }]}>
                    <Text style={[styles.statusText, { color: statusColors[vehicleStatus].text }]}>{vehicleStatus}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statusGrid}>
                {['Running', 'Charging', 'Cleaning', 'Fault'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    disabled={!isCheckedIn}
                    onPress={() => setVehicleStatus(status)}
                    style={[styles.statusButton, vehicleStatus === status && styles.statusButtonActive, !isCheckedIn && styles.statusButtonDisabled]}
                  >
                    {status === 'Running' && <NavIcon size={22} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    {status === 'Charging' && <RotateCcw size={22} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    {status === 'Cleaning' && <CheckCircle2 size={22} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    {status === 'Fault' && <AlertTriangle size={22} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    <Text style={[styles.statusButtonText, vehicleStatus === status && styles.statusButtonTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, styles.reportIcon]}><AlertTriangle size={28} color="#DC2626" /></View>
              <Text style={styles.actionTitle}>Report Fault</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, styles.photoIcon]}><Camera size={28} color="#D97706" /></View>
              <Text style={styles.actionTitle}>Battery Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <Modal visible={showAuthModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verification Step {authStep}</Text>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}><X size={24} color="#94A3B8" /></TouchableOpacity>
            </View>
            <View style={styles.stepContent}>
              {authStep === 1 ? (
                <>
                  <View style={styles.faceAuthContainer}>
                    <User size={48} color="#D97706" />
                  </View>
                  <TouchableOpacity style={styles.authButton} onPress={nextAuthStep}>
                    <Text style={styles.authButtonText}>Verify Face</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput 
                    style={styles.batteryTextInput} 
                    placeholder="Enter battery status remarks..." 
                    placeholderTextColor="#94A3B8"
                    onChangeText={setBatteryText}
                    multiline
                  />
                  <TouchableOpacity style={styles.finishButton} onPress={nextAuthStep}>
                    <Text style={styles.finishButtonText}>Complete Check-In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 10, paddingBottom: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, backgroundColor: '#D97706', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 22 },
  logoSubtitle: { color: '#D97706', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  logoTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationButton: { width: 44, height: 44, backgroundColor: '#F1F5F9', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notificationBadge: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, borderWidth: 2, borderColor: '#FFF' },
  avatarContainer: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#FDE68A' },
  avatar: { width: '100%', height: '100%' },
  profileCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20 },
  profileContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftText: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  driverName: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  idBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#64748B' },
  statusDotActive: { backgroundColor: '#22C55E' },
  idText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  logoutButton: { backgroundColor: 'rgba(255,255,255,0.1)', width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  mainContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  gpsText: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  attendanceCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  attendanceContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  attendanceIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  attendanceIconActive: { backgroundColor: '#22C55E' },
  attendanceIconInactive: { backgroundColor: '#F1F5F9' },
  attendanceStatus: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  attendanceTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  checkInButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  checkInButtonActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  checkOutButton: { backgroundColor: '#FFF', borderColor: '#FEE2E2' },
  checkInButtonText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  checkOutButtonText: { color: '#DC2626' },
  vehicleCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  vehicleLabel: { fontSize: 12, color: '#D97706', fontWeight: '800', textTransform: 'uppercase' },
  vehicleNumber: { fontSize: 36, fontWeight: '900', color: '#1E293B' },
  vehicleStats: { alignItems: 'flex-end', gap: 8 },
  batteryContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  batteryText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusButton: { flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 14, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9' },
  statusButtonActive: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  statusButtonDisabled: { opacity: 0.4 },
  statusButtonText: { fontSize: 12, color: '#94A3B8', marginTop: 8, fontWeight: '600' },
  statusButtonTextActive: { color: '#D97706', fontWeight: '800' },
  actionGrid: { flexDirection: 'row', gap: 16 },
  actionCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 24, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  reportIcon: { backgroundColor: '#FEE2E2' },
  photoIcon: { backgroundColor: '#FEF3C7' },
  actionTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  stepContent: { alignItems: 'center' },
  faceAuthContainer: { width: 120, height: 120, borderRadius: 30, backgroundColor: '#FFFBEB', borderStyle: 'dashed', borderWidth: 2, borderColor: '#D97706', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  authButton: { backgroundColor: '#D97706', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  authButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  batteryTextInput: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, height: 120, marginBottom: 24, textAlignVertical: 'top', color: '#1E293B', fontSize: 15 },
  finishButton: { backgroundColor: '#1E293B', width: '100%', padding: 18, borderRadius: 16, alignItems: 'center' },
  finishButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});

export default HomeScreen;