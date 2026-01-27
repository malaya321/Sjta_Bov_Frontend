import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform,
  Dimensions 
} from 'react-native';
import { 
  Users, 
  Car, 
  Send, 
  LogOut, 
  ChevronRight, 
  MessageSquare, 
  ClipboardCheck, 
  MapPin, 
  Clock, 
  X,
  User,
  Bell,
  Shield,
  AlertCircle,
  CheckCircle2
} from 'lucide-react-native';
import { useLogout } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ConfirmationAlert } from '../../components/ConfirmationAlert';

// Define navigation types for the ROOT stack (not SupervisorStack)
type RootStackParamList = {
  LoginScreen: undefined;
  MainTabs: undefined;
  SupervisorStack: undefined;
  ActiveDriver: undefined;
  AvailableBov:undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface SupervisorScreenProps {
  onLogout: () => void;
}

const SupervisorScreen = ({ onLogout }: SupervisorScreenProps) => {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [selectedBov, setSelectedBov] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [message, setMessage] = useState('Please report to the designated pick-up location. Drive safely and follow all traffic regulations.');
  const logoutMutation = useLogout();
  
  // Use the root navigation, not SupervisorStack
    // const logoutMutation = useLogout();
  const navigation = useNavigation<NavigationProp>();
 const confirmLogout = async() => {
    // Trigger logout mutation
    await logoutMutation.mutateAsync();
    
    // Call the parent logout function after successful logout
    onLogout();
  };
  // Initial assignments data
  const [assignments, setAssignments] = useState([
    { 
      id: '1', 
      driverId: 'D-1024', 
      driverName: 'SV Rajesh Kumar', 
      bov: 'BOV-401', 
      time: '08:30 AM', 
      status: 'Active',
      route: 'Airport - City Center',
      location: 'Terminal 3, Bay 12'
    },
    { 
      id: '2', 
      driverId: 'D-1025', 
      driverName: 'Suresh Mohanty', 
      bov: 'BOV-402', 
      time: '09:15 AM', 
      status: 'Active',
      route: 'Railway Station - Convention Center',
      location: 'Platform 4'
    },
    { 
      id: '3', 
      driverId: 'D-1026', 
      driverName: 'Amit Singh', 
      bov: 'BOV-403', 
      time: '10:00 AM', 
      status: 'Completed',
      route: 'Hotel District - Business Park',
      location: 'Completed'
    },
  ]);

  const drivers = [
    { id: 'D-1024', name: 'SV Rajesh Kumar', status: 'Available', rating: '4.8', trips: 247 },
    { id: 'D-1025', name: 'Suresh Mohanty', status: 'In Shift', rating: '4.9', trips: 312 },
    { id: 'D-1026', name: 'Amit Singh', status: 'Available', rating: '4.7', trips: 189 },
    { id: 'D-1027', name: 'Ravi Sharma', status: 'Available', rating: '4.6', trips: 156 },
    { id: 'D-1028', name: 'Kumar Patel', status: 'Break', rating: '4.8', trips: 278 },
  ];

  const bovs = [
    { id: 'BOV-401', status: 'Available', type: 'AC', capacity: '15 seats' },
    { id: 'BOV-402', status: 'In Use', type: 'Non-AC', capacity: '12 seats' },
    { id: 'BOV-403', status: 'Maintenance', type: 'AC', capacity: '15 seats' },
    { id: 'BOV-404', status: 'Available', type: 'Electric', capacity: '10 seats' },
    { id: 'BOV-405', status: 'Available', type: 'AC', capacity: '20 seats' },
  ];

  const handleActiveDriversPress = () => {
    console.log('Navigating to ActiveDriver');
    navigation.navigate('ActiveDriver');
  };

  const handleAvailableBovsPress = () => {
     navigation.navigate('AvailableBov');
  };

  const handleActiveTripsPress = () => {
    Alert.alert('Info', 'This feature is coming soon!');
  };

  const stats = {
    activeDrivers: 8,
    availableBovs: 12,
    activeAssignments: 5,
    pendingRequests: 3
  };

  // const handleLogout = () => {
  //   Alert.alert(
  //     'Logout',
  //     'Are you sure you want to logout?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Logout',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             await logoutMutation.mutateAsync();
  //             onLogout();
  //           } catch (error) {
  //             console.error('Logout error:', error);
  //             Alert.alert(
  //               'Logout Failed',
  //               'There was an issue logging out. Please try again.',
  //               [{ text: 'OK' }]
  //             );
  //           }
  //         }
  //       }
  //     ],
  //     { cancelable: true }
  //   );
  // };

  const handleAssign = () => {
    if (!selectedDriver || !selectedBov) {
      Alert.alert('Missing Info', 'Please select both a driver and a vehicle.');
      return;
    }

    // Check if driver already has an active assignment
    const existingAssignment = assignments.find(
      assignment => assignment.driverId === selectedDriver.id && assignment.status === 'Active'
    );

    if (existingAssignment) {
      Alert.alert(
        'Driver Already Assigned',
        `${selectedDriver.name} is already assigned to ${existingAssignment.bov}. Would you like to reassign?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reassign',
            onPress: () => completeAssignment()
          }
        ]
      );
      return;
    }

    // Check if BOV is already assigned
    const bovAssigned = assignments.find(
      assignment => assignment.bov === selectedBov && assignment.status === 'Active'
    );

    if (bovAssigned) {
      Alert.alert(
        'Vehicle Already Assigned',
        `${selectedBov} is already assigned to ${bovAssigned.driverName}. Please select another vehicle.`,
        [{ text: 'OK' }]
      );
      return;
    }

    completeAssignment();
  };

  const completeAssignment = () => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newAssignment = {
      id: Date.now().toString(),
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      bov: selectedBov,
      time: currentTime,
      status: 'Active',
      route: 'To be assigned',
      location: 'Depot'
    };

    // Update assignments state
    setAssignments(prev => [newAssignment, ...prev.filter(a => !(a.driverId === selectedDriver.id && a.status === 'Active'))]);
    
    Alert.alert(
      'Assignment Successful', 
      `${selectedBov} has been assigned to ${selectedDriver.name}\n\nA notification has been sent to the driver.`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            setMessage('');
            setSelectedDriver(null);
            setSelectedBov('');
          }
        }
      ]
    );
  };

  const handleUnassign = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    Alert.alert(
      'Unassign Vehicle',
      `Remove ${assignment.bov} from ${assignment.driverName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAssignments(prev => prev.map(a => 
              a.id === assignmentId 
                ? { ...a, status: 'Completed' }
                : a
            ));
            
            Alert.alert('Success', `Removed ${assignment.bov} from ${assignment.driverName}`);
          }
        }
      ]
    );
  };

  const handleQuickAssign = () => {
    // Find available driver
    const availableDriver = drivers.find(driver => driver.status === 'Available');
    // Find available BOV
    const availableBov = bovs.find(bov => bov.status === 'Available')?.id;

    if (!availableDriver || !availableBov) {
      Alert.alert(
        'No Available Resources',
        'No available drivers or vehicles at the moment.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedDriver(availableDriver);
    setSelectedBov(availableBov);
    
    Alert.alert(
      'Quick Assign',
      `Would you like to assign ${availableBov} to ${availableDriver.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          onPress: () => {
            completeAssignment();
          }
        }
      ]
    );
  };

  const activeAssignments = assignments.filter(a => a.status === 'Active');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>SUPERVISOR</Text>
            <Text style={styles.headerTitle}>Roster Management</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={22} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={()=>setShowAlert(true)}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard} 
            onPress={handleActiveDriversPress}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
              <User size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{stats.activeDrivers}</Text>
            <Text style={styles.statLabel}>Active Drivers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard} 
            onPress={handleAvailableBovsPress}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Car size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.availableBovs}</Text>
            <Text style={styles.statLabel}>Available BOVs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard} 
            onPress={handleActiveTripsPress}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <ClipboardCheck size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.activeAssignments}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleQuickAssign}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
                <User size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>Quick Assign</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleAvailableBovsPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0F9FF' }]}>
                <Car size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionText}>View Fleet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Shield size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionText}>Safety Check</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionBtn}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF2F2' }]}>
                <AlertCircle size={24} color="#DC2626" />
              </View>
              <Text style={styles.quickActionText}>Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Assignments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Assignments</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeAssignments.length} Active</Text>
            </View>
          </View>
          
          {activeAssignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Car size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Active Assignments</Text>
              <Text style={styles.emptyStateText}>Assign drivers to vehicles to begin operations</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assignmentsScroll}>
              {activeAssignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.assignmentHeader}>
                    <View style={styles.driverInfo}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverInitials}>
                          {assignment.driverName.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.driverName}>{assignment.driverName}</Text>
                        <Text style={styles.driverId}>{assignment.driverId}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.unassignBtn}
                      onPress={() => handleUnassign(assignment.id)}
                    >
                      <X size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.vehicleInfo}>
                    <Car size={18} color="#64748B" />
                    <Text style={styles.vehicleText}>{assignment.bov}</Text>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.statusText}>On Route</Text>
                    </View>
                  </View>
                  
                  <View style={styles.assignmentDetails}>
                    <View style={styles.detailRow}>
                      <MapPin size={14} color="#94A3B8" />
                      <Text style={styles.detailText}>{assignment.route}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={14} color="#94A3B8" />
                      <Text style={styles.detailText}>Started at {assignment.time}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.locationBadge}>
                    <MapPin size={12} color="#D97706" />
                    <Text style={styles.locationText}>{assignment.location}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Driver Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Drivers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.driversScroll}>
            {drivers.map((driver) => (
              <TouchableOpacity
                key={driver.id}
                style={[
                  styles.driverCard,
                  selectedDriver?.id === driver.id && styles.selectedDriverCard
                ]}
                onPress={() => setSelectedDriver(driver)}
                disabled={driver.status === 'In Shift'}
              >
                <View style={styles.driverCardHeader}>
                  <View style={[
                    styles.driverStatus, 
                    { backgroundColor: driver.status === 'Available' ? '#10B981' : 
                      driver.status === 'In Shift' ? '#D97706' : '#94A3B8' }
                  ]} />
                  <View style={styles.driverAvatarSmall}>
                    <Text style={styles.driverInitialsSmall}>
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.driverCardName} numberOfLines={1}>
                  {driver.name.split(' ')[0]}
                </Text>
                <Text style={styles.driverCardId}>{driver.id}</Text>
                
                <View style={styles.driverStats}>
                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>⭐ {driver.rating}</Text>
                  </View>
                  <Text style={styles.tripsText}>{driver.trips} trips</Text>
                </View>
                
                {driver.status === 'In Shift' && (
                  <View style={styles.assignedTag}>
                    <Text style={styles.assignedTagText}>On Duty</Text>
                  </View>
                )}
                
                {selectedDriver?.id === driver.id && (
                  <View style={styles.selectedIndicator}>
                    <CheckCircle2 size={20} color="#10B981" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Vehicles</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.vehiclesGrid}>
            {bovs.map((bov) => {
              const isAssigned = assignments.some(a => a.bov === bov.id && a.status === 'Active');
              return (
                <TouchableOpacity
                  key={bov.id}
                  style={[
                    styles.vehicleCard,
                    selectedBov === bov.id && styles.selectedVehicleCard,
                    isAssigned && styles.assignedVehicleCard
                  ]}
                  onPress={() => {
                    if (!isAssigned) setSelectedBov(bov.id);
                  }}
                  disabled={isAssigned || bov.status !== 'Available'}
                >
                  <View style={styles.vehicleCardHeader}>
                    <Car size={24} color={
                      selectedBov === bov.id ? "#FFF" : 
                      isAssigned ? "#CBD5E1" : 
                      bov.status === 'Available' ? "#10B981" : "#94A3B8"
                    } />
                    <View style={[
                      styles.vehicleStatus,
                      { backgroundColor: bov.status === 'Available' ? '#10B981' : 
                        bov.status === 'In Use' ? '#D97706' : '#94A3B8' }
                    ]} />
                  </View>
                  
                  <Text style={[
                    styles.vehicleId,
                    selectedBov === bov.id && styles.selectedVehicleId,
                    isAssigned && styles.disabledVehicleId
                  ]}>
                    {bov.id}
                  </Text>
                  
                  <Text style={styles.vehicleType}>{bov.type}</Text>
                  <Text style={styles.vehicleCapacity}>{bov.capacity}</Text>
                  
                  {isAssigned && (
                    <View style={styles.assignedOverlay}>
                      <Text style={styles.assignedOverlayText}>ASSIGNED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Assignment Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Driver:</Text>
              <Text style={styles.summaryValue}>
                {selectedDriver ? selectedDriver.name : 'None selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Vehicle:</Text>
              <Text style={styles.summaryValue}>
                {selectedBov || 'None selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[
                styles.summaryStatus,
                { color: selectedDriver && selectedBov ? '#10B981' : '#DC2626' }
              ]}>
                {selectedDriver && selectedBov ? 'Ready to Assign' : 'Incomplete'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              (!selectedDriver || !selectedBov) && styles.confirmButtonDisabled
            ]} 
            onPress={handleAssign}
            disabled={!selectedDriver || !selectedBov}
          >
            <ClipboardCheck size={22} color="#FFF" />
            <Text style={styles.confirmButtonText}>CONFIRM ASSIGNMENT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
       <ConfirmationAlert
              visible={showAlert}
              isCheckedIn={isCheckedIn}
              onConfirm={confirmLogout}
              onCancel={() => setShowAlert(false)}
            />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: {
    backgroundColor: '#9D140C',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD166',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom:5
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  viewAllText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 5,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  assignmentsScroll: {
    flexDirection: 'row',
  },
  assignmentCard: {
    width: width * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom:10
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  driverId: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unassignBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  assignmentDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  driversScroll: {
    flexDirection: 'row',
  },
  driverCard: {
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom:10
  },
  selectedDriverCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  driverCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  driverAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitialsSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  driverCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  driverCardId: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 10,
  },
  driverStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  tripsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  assignedTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assignedTagText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 3,
  },
  vehiclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 5,
    gap:9
  },
  vehicleCard: {
    width: (width - 60) / 3,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  selectedVehicleCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  assignedVehicleCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  vehicleStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  vehicleId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  selectedVehicleId: {
    color: '#92400E',
  },
  disabledVehicleId: {
    color: '#CBD5E1',
  },
  vehicleType: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleCapacity: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  assignedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignedOverlayText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    transform: [{ rotate: '-45deg' }],
  },
  messageContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  messageInput: {
    padding: 20,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  messageHint: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    marginRight: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 70,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  summaryContent: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  summaryStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default SupervisorScreen;