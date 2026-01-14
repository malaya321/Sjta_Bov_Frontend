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
  ShieldCheck,
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
                <Bell size={20} color="#94A3B8" />
                {hasNotifications && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: driverData.avatarUrl }} style={styles.avatar} />
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileContent}>
              <View>
                <Text style={styles.shiftText}>{driverData.shift}</Text>
                <Text style={styles.driverName}>{driverData.name}</Text>
                <View style={styles.idBadge}>
                  <View style={[styles.statusDot, isCheckedIn && styles.statusDotActive]} />
                  <Text style={styles.idText}>ID: {driverData.id} • {isCheckedIn ? 'ONLINE' : 'OFFLINE'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <LogOut size={22} color="#FFFFFF" />
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
                <MapPin size={10} color="#D97706" />
                <Text style={styles.gpsText}>GPS Recorded</Text>
              </View>
            </View>
            <View style={styles.attendanceCard}>
              <View style={styles.attendanceContent}>
                <View style={styles.attendanceLeft}>
                  <View style={[styles.attendanceIcon, isCheckedIn ? styles.attendanceIconActive : styles.attendanceIconInactive]}>
                    {isCheckedIn ? <CheckCircle2 size={32} color="#FFFFFF" /> : <Power size={32} color="#CBD5E1" />}
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
                    <Battery size={18} color={batteryLevel < 20 ? '#DC2626' : '#22C55E'} />
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
                    {status === 'Running' && <NavIcon size={20} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    {status === 'Charging' && <RotateCcw size={20} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    {status === 'Cleaning' && <CheckCircle2 size={20} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    {status === 'Fault' && <AlertTriangle size={20} color={vehicleStatus === status ? '#D97706' : '#94A3B8'} />}
                    <Text style={[styles.statusButtonText, vehicleStatus === status && styles.statusButtonTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, styles.reportIcon]}><AlertTriangle size={24} color="#DC2626" /></View>
              <Text style={styles.actionTitle}>Report Fault</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, styles.photoIcon]}><Camera size={24} color="#D97706" /></View>
              <Text style={styles.actionTitle}>Battery Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Check-in Modal */}
      <Modal visible={showAuthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verification Step {authStep}</Text>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}><X size={24} color="#94A3B8" /></TouchableOpacity>
            </View>
            <View style={styles.stepContent}>
              {authStep === 1 ? (
                <>
                  <View style={styles.faceAuthContainer}><User size={60} color="#E2E8F0" /></View>
                  <TouchableOpacity style={styles.authButton} onPress={nextAuthStep}><Text style={styles.authButtonText}>Verify Face</Text></TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput 
                    style={styles.batteryTextInput} 
                    placeholder="Enter battery status remarks..." 
                    onChangeText={setBatteryText}
                    multiline
                  />
                  <TouchableOpacity style={styles.finishButton} onPress={nextAuthStep}><Text style={styles.finishButtonText}>Complete</Text></TouchableOpacity>
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
  scrollContent: { paddingBottom: 100 },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 10, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, backgroundColor: '#D97706', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  logoSubtitle: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
  logoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notificationButton: { padding: 10, backgroundColor: '#F8FAFC', borderRadius: 12 },
  notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4, borderWidth: 1, borderColor: '#FFF' },
  avatarContainer: { width: 40, height: 40, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#FDE68A' },
  avatar: { width: '100%', height: '100%' },
  profileCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 16 },
  profileContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftText: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginVertical: 4 },
  idBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#64748B' },
  statusDotActive: { backgroundColor: '#22C55E' },
  idText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  logoutButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12 },
  mainContent: { padding: 20 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8' },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gpsText: { fontSize: 10, color: '#94A3B8' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  attendanceCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, elevation: 2 },
  attendanceContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  attendanceIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  attendanceIconActive: { backgroundColor: '#22C55E' },
  attendanceIconInactive: { backgroundColor: '#F1F5F9' },
  attendanceStatus: { fontSize: 16, fontWeight: 'bold' },
  attendanceTime: { fontSize: 10, color: '#94A3B8' },
  checkInButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  checkInButtonActive: { backgroundColor: '#D97706', borderColor: '#FBBF24' },
  checkOutButton: { backgroundColor: '#FFF', borderColor: '#FEE2E2' },
  checkInButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  checkOutButtonText: { color: '#DC2626' },
  vehicleCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 2 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  vehicleLabel: { fontSize: 10, color: '#D97706', fontWeight: 'bold' },
  vehicleNumber: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  vehicleStats: { alignItems: 'flex-end', gap: 5 },
  batteryContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', padding: 5, borderRadius: 8 },
  batteryText: { fontSize: 12, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusGrid: { flexDirection: 'row', gap: 10 },
  statusButton: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  statusButtonActive: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  statusButtonDisabled: { opacity: 0.5 },
  statusButtonText: { fontSize: 10, color: '#94A3B8', marginTop: 5 },
  statusButtonTextActive: { color: '#D97706', fontWeight: 'bold' },
  actionGrid: { flexDirection: 'row', gap: 15 },
  actionCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  actionIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  reportIcon: { backgroundColor: '#FEE2E2' },
  photoIcon: { backgroundColor: '#FEF3C7' },
  actionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  stepContent: { alignItems: 'center' },
  faceAuthContainer: { width: 100, height: 100, borderRadius: 20, backgroundColor: '#F8FAFC', borderStyle: 'dashed', borderWidth: 2, borderColor: '#D97706', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  authButton: { backgroundColor: '#D97706', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 12 },
  authButtonText: { color: '#FFF', fontWeight: 'bold' },
  batteryTextInput: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, height: 100, marginBottom: 20 },
  finishButton: { backgroundColor: '#1E293B', width: '100%', padding: 15, borderRadius: 12, alignItems: 'center' },
  finishButtonText: { color: '#FFF', fontWeight: 'bold' },
  mantraFooter: { alignItems: 'center', marginTop: 20 },
  mantraText: { fontSize: 8, color: '#94A3B8', letterSpacing: 1 }
});

export default HomeScreen;