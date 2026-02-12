import React, { useState } from 'react';
import RosterManagementTable from '../../components/RosterManagementTable';
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
  Dimensions,
  Modal
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
  CheckCircle2,
  Search,
  FileText
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
  AvailableBov: undefined;
};

interface RosterEntry {
  id: string;
  driverName: string;
  vehicleName: string;
  shiftTime: string;
  rosterType: 'Regular' | 'Extra' | 'Emergency' | 'Training';
  supervisorName: string;
  zoneName: string;
  rosterDate: string;
  status: 'Active' | 'Completed' | 'Scheduled' | 'Cancelled';
  vehicleOperationalStatus: 'Operational' | 'Maintenance' | 'Out of Service' | 'Reserved';
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface SupervisorScreenProps {
  onLogout: () => void;
}

const SupervisorScreen = ({ onLogout }: SupervisorScreenProps) => {
  // All hooks at the top level
  const logoutMutation = useLogout();
  const navigation = useNavigation<NavigationProp>();

  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [selectedBov, setSelectedBov] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [message, setMessage] = useState('Please report to the designated pick-up location. Drive safely and follow all traffic regulations.');
  
  // Modal states
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [currentRosterId, setCurrentRosterId] = useState<string | null>(null);
  const [currentDriverName, setCurrentDriverName] = useState<string>('');
  const [currentVehicleName, setCurrentVehicleName] = useState<string>('');
  const [currentDriverId, setCurrentDriverId] = useState<string>('');
  const [currentVehicleId, setCurrentVehicleId] = useState<string>('');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  // New state for justification and selected items in modals
  const [selectedDriverForAssignment, setSelectedDriverForAssignment] = useState<any>(null);
  const [selectedVehicleForAssignment, setSelectedVehicleForAssignment] = useState<any>(null);
  const [justificationText, setJustificationText] = useState('');
  
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

  const [rosterData, setRosterData] = useState<RosterEntry[]>([
    {
      id: '1',
      driverName: 'SV Rajesh Kumar',
      vehicleName: 'BOV-401',
      shiftTime: '08:30 AM - 04:30 PM',
      rosterType: 'Regular',
      supervisorName: 'Amit Sharma',
      zoneName: 'Airport Zone',
      rosterDate: '2024-03-15',
      status: 'Active',
      vehicleOperationalStatus: 'Operational'
    },
    {
      id: '2',
      driverName: 'Suresh Mohanty',
      vehicleName: 'BOV-402',
      shiftTime: '09:15 AM - 05:15 PM',
      rosterType: 'Extra',
      supervisorName: 'Priya Singh',
      zoneName: 'City Center',
      rosterDate: '2024-03-15',
      status: 'Active',
      vehicleOperationalStatus: 'Operational'
    },
    {
      id: '3',
      driverName: 'Amit Singh',
      vehicleName: 'BOV-403',
      shiftTime: '10:00 AM - 06:00 PM',
      rosterType: 'Regular',
      supervisorName: 'Vikram Patel',
      zoneName: 'Railway Station',
      rosterDate: '2024-03-14',
      status: 'Completed',
      vehicleOperationalStatus: 'Maintenance'
    },
    {
      id: '4',
      driverName: 'Ravi Sharma',
      vehicleName: 'BOV-404',
      shiftTime: '07:00 AM - 03:00 PM',
      rosterType: 'Emergency',
      supervisorName: 'Neha Gupta',
      zoneName: 'Business Park',
      rosterDate: '2024-03-15',
      status: 'Scheduled',
      vehicleOperationalStatus: 'Operational'
    },
    {
      id: '5',
      driverName: 'Kumar Patel',
      vehicleName: 'BOV-405',
      shiftTime: '02:00 PM - 10:00 PM',
      rosterType: 'Training',
      supervisorName: 'Rajesh Kumar',
      zoneName: 'Convention Center',
      rosterDate: '2024-03-16',
      status: 'Scheduled',
      vehicleOperationalStatus: 'Reserved'
    }
  ]);

  const drivers = [
    { id: 'D-1024', name: 'SV Rajesh Kumar', status: 'Available', rating: '4.8', trips: 247 },
    { id: 'D-1025', name: 'Suresh Mohanty', status: 'In Shift', rating: '4.9', trips: 312 },
    { id: 'D-1026', name: 'Amit Singh', status: 'Available', rating: '4.7', trips: 189 },
    { id: 'D-1027', name: 'Ravi Sharma', status: 'Available', rating: '4.6', trips: 156 },
    { id: 'D-1028', name: 'Kumar Patel', status: 'Break', rating: '4.8', trips: 278 },
    { id: 'D-1029', name: 'Vikram Mehta', status: 'Available', rating: '4.9', trips: 201 },
    { id: 'D-1030', name: 'Sanjay Gupta', status: 'Available', rating: '4.7', trips: 178 },
  ];

  const bovs = [
    { id: 'BOV-401', status: 'Available', type: 'AC', capacity: '15 seats' },
    { id: 'BOV-402', status: 'In Use', type: 'Non-AC', capacity: '12 seats' },
    { id: 'BOV-403', status: 'Maintenance', type: 'AC', capacity: '15 seats' },
    { id: 'BOV-404', status: 'Available', type: 'Electric', capacity: '10 seats' },
    { id: 'BOV-405', status: 'Available', type: 'AC', capacity: '20 seats' },
    { id: 'BOV-406', status: 'Available', type: 'AC', capacity: '18 seats' },
    { id: 'BOV-407', status: 'Available', type: 'Electric', capacity: '12 seats' },
  ];

  // Filtered lists for modals
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
    driver.id.toLowerCase().includes(driverSearchQuery.toLowerCase())
  );

  const filteredVehicles = bovs.filter(vehicle => 
    vehicle.id.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
  );

  const confirmLogout = async () => {
    await logoutMutation.mutateAsync();
    onLogout();
  };

  // Handler functions for roster management
  const handleReassignDriver = (rosterId: string, currentDriver: string) => {
    const roster = rosterData.find(r => r.id === rosterId);
    const driver = drivers.find(d => d.name === currentDriver);
    setCurrentRosterId(rosterId);
    setCurrentDriverName(currentDriver);
    setCurrentDriverId(driver?.id || '');
    setDriverSearchQuery('');
    setSelectedDriverForAssignment(null);
    setJustificationText('');
    setShowDriverModal(true);
  };

  const handleReassignVehicle = (rosterId: string, currentVehicle: string) => {
    const roster = rosterData.find(r => r.id === rosterId);
    const vehicle = bovs.find(v => v.id === currentVehicle);
    setCurrentRosterId(rosterId);
    setCurrentVehicleName(currentVehicle);
    setCurrentVehicleId(vehicle?.id || '');
    setVehicleSearchQuery('');
    setSelectedVehicleForAssignment(null);
    setJustificationText('');
    setShowVehicleModal(true);
  };

  const handleSelectDriver = (driver: any) => {
    if (driver.id === currentDriverId) {
      Alert.alert('Info', 'This driver is already assigned to this roster.');
      return;
    }
    setSelectedDriverForAssignment(driver);
  };

  const handleSelectVehicle = (vehicle: any) => {
    if (vehicle.id === currentVehicleId) {
      Alert.alert('Info', 'This vehicle is already assigned to this roster.');
      return;
    }
    setSelectedVehicleForAssignment(vehicle);
  };

  const handleConfirmDriverReassignment = async () => {
    if (!selectedDriverForAssignment) {
      Alert.alert('Error', 'Please select a driver to reassign.');
      return;
    }

    if (!justificationText.trim()) {
      Alert.alert('Error', 'Please provide a justification for this reassignment.');
      return;
    }

    Alert.alert(
      'Confirm Reassignment',
      `Are you sure you want to reassign from ${currentDriverName} to ${selectedDriverForAssignment.name}?\n\nJustification: ${justificationText}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // TODO: Replace with your actual API call
              // await reassignDriverAPI(currentRosterId, selectedDriverForAssignment.id, justificationText);
              
              // Update local state
              setRosterData(prev => prev.map(roster => 
                roster.id === currentRosterId 
                  ? { ...roster, driverName: selectedDriverForAssignment.name }
                  : roster
              ));
              
              Alert.alert('Success', `Driver reassigned to ${selectedDriverForAssignment.name} successfully`);
              setShowDriverModal(false);
              setCurrentRosterId(null);
              setCurrentDriverName('');
              setCurrentDriverId('');
              setSelectedDriverForAssignment(null);
              setJustificationText('');
            } catch (error) {
              Alert.alert('Error', 'Failed to reassign driver. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleConfirmVehicleReassignment = async () => {
    if (!selectedVehicleForAssignment) {
      Alert.alert('Error', 'Please select a vehicle to reassign.');
      return;
    }

    if (!justificationText.trim()) {
      Alert.alert('Error', 'Please provide a justification for this reassignment.');
      return;
    }

    Alert.alert(
      'Confirm Reassignment',
      `Are you sure you want to reassign from ${currentVehicleName} to ${selectedVehicleForAssignment.id}?\n\nJustification: ${justificationText}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // TODO: Replace with your actual API call
              // await reassignVehicleAPI(currentRosterId, selectedVehicleForAssignment.id, justificationText);
              
              // Update local state
              setRosterData(prev => prev.map(roster => 
                roster.id === currentRosterId 
                  ? { ...roster, vehicleName: selectedVehicleForAssignment.id }
                  : roster
              ));
              
              Alert.alert('Success', `Vehicle reassigned to ${selectedVehicleForAssignment.id} successfully`);
              setShowVehicleModal(false);
              setCurrentRosterId(null);
              setCurrentVehicleName('');
              setCurrentVehicleId('');
              setSelectedVehicleForAssignment(null);
              setJustificationText('');
            } catch (error) {
              Alert.alert('Error', 'Failed to reassign vehicle. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditRoster = (roster: RosterEntry) => {
    Alert.alert(
      'Edit Roster',
      `Edit roster for ${roster.driverName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save Changes',
          onPress: () => {
            // Navigate to edit roster screen
            Alert.alert('Success', 'Roster updated successfully');
          }
        }
      ]
    );
  };

  const handleViewDetails = (roster: RosterEntry) => {
    Alert.alert('Roster Details', JSON.stringify(roster, null, 2));
  };

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

  const handleAssign = () => {
    if (!selectedDriver || !selectedBov) {
      Alert.alert('Missing Info', 'Please select both a driver and a vehicle.');
      return;
    }

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
    const availableDriver = drivers.find(driver => driver.status === 'Available');
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
            <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowAlert(true)}>
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
        {/* Roster Management Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Roster Management</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rosterData.length} Rosters</Text>
            </View>
          </View>
          
          <RosterManagementTable
            data={rosterData}
            onReassignDriver={handleReassignDriver}
            onReassignVehicle={handleReassignVehicle}
            onEditRoster={handleEditRoster}
            onViewDetails={handleViewDetails}
          />
        </View>
      </ScrollView>

      {/* Driver Selection Modal */}
      <Modal
        visible={showDriverModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowDriverModal(false);
          setSelectedDriverForAssignment(null);
          setJustificationText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reassign Driver</Text>
                <Text style={styles.modalSubtitle}>
                  Current Driver: {currentDriverName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowDriverModal(false);
                  setSelectedDriverForAssignment(null);
                  setJustificationText('');
                }}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.modalSearchContainer}>
              <Search size={20} color="#94A3B8" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search drivers by name or ID..."
                placeholderTextColor="#94A3B8"
                value={driverSearchQuery}
                onChangeText={setDriverSearchQuery}
              />
            </View>

            {/* Drivers List */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.driversList}
            >
              {filteredDrivers.length === 0 ? (
                <View style={styles.noDriversContainer}>
                  <User size={48} color="#CBD5E1" />
                  <Text style={styles.noDriversText}>No available drivers found</Text>
                </View>
              ) : (
                filteredDrivers.map((driver) => (
                  <TouchableOpacity
                    key={driver.id}
                    style={[
                      styles.driverItem,
                      driver.id === currentDriverId && styles.currentDriverItem,
                      selectedDriverForAssignment?.id === driver.id && styles.selectedDriverItem
                    ]}
                    onPress={() => handleSelectDriver(driver)}
                  >
                    <View style={styles.driverItemLeft}>
                      <View style={[
                        styles.driverItemAvatar,
                        driver.id === currentDriverId && styles.currentDriverAvatar,
                        selectedDriverForAssignment?.id === driver.id && styles.selectedDriverAvatar
                      ]}>
                        <Text style={[
                          styles.driverItemInitials,
                          driver.id === currentDriverId && styles.currentDriverInitials,
                          selectedDriverForAssignment?.id === driver.id && styles.selectedDriverInitials
                        ]}>
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.driverItemInfo}>
                        <Text style={styles.driverItemName}>{driver.name}</Text>
                        <Text style={styles.driverItemId}>{driver.id}</Text>
                        <View style={styles.driverItemStats}>
                          <View style={styles.driverItemRating}>
                            <Text style={styles.driverItemRatingText}>⭐ {driver.rating}</Text>
                          </View>
                          <Text style={styles.driverItemTrips}>{driver.trips} trips</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.driverItemRight}>
                      <View style={[
                        styles.driverItemStatus,
                        { backgroundColor: driver.status === 'Available' ? '#10B981' : 
                          driver.status === 'In Shift' ? '#D97706' : 
                          driver.status === 'Break' ? '#94A3B8' : '#64748B' }
                      ]} />
                      <Text style={styles.driverItemStatusText}>{driver.status}</Text>
                      {driver.id === currentDriverId && (
                        <View style={styles.currentDriverBadge}>
                          <Text style={styles.currentDriverBadgeText}>Current</Text>
                        </View>
                      )}
                      {selectedDriverForAssignment?.id === driver.id && (
                        <View style={styles.selectedDriverBadge}>
                          <CheckCircle2 size={14} color="#FFF" />
                          <Text style={styles.selectedDriverBadgeText}>Selected</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Justification Section - Always render but conditionally show */}
            <View style={[styles.justificationContainer, !selectedDriverForAssignment && styles.justificationHidden]}>
              <View style={styles.justificationHeader}>
                <FileText size={20} color="#1E293B" />
                <Text style={styles.justificationTitle}>Reassignment Justification</Text>
              </View>
              <TextInput
                style={styles.justificationInput}
                placeholder="Please provide a reason for reassigning this driver..."
                placeholderTextColor="#94A3B8"
                value={justificationText}
                onChangeText={setJustificationText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!!selectedDriverForAssignment}
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.modalFooter}>
              {selectedDriverForAssignment ? (
                <TouchableOpacity 
                  style={[
                    styles.assignButton,
                    (!justificationText.trim()) && styles.assignButtonDisabled
                  ]}
                  onPress={handleConfirmDriverReassignment}
                  disabled={!justificationText.trim()}
                >
                  <Text style={styles.assignButtonText}>Confirm Reassignment</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowDriverModal(false);
                    setSelectedDriverForAssignment(null);
                    setJustificationText('');
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehicleModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowVehicleModal(false);
          setSelectedVehicleForAssignment(null);
          setJustificationText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reassign Vehicle</Text>
                <Text style={styles.modalSubtitle}>
                  Current Vehicle: {currentVehicleName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowVehicleModal(false);
                  setSelectedVehicleForAssignment(null);
                  setJustificationText('');
                }}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.modalSearchContainer}>
              <Search size={20} color="#94A3B8" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search vehicles by ID or type..."
                placeholderTextColor="#94A3B8"
                value={vehicleSearchQuery}
                onChangeText={setVehicleSearchQuery}
              />
            </View>

            {/* Vehicles List */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.vehiclesList}
            >
              {filteredVehicles.length === 0 ? (
                <View style={styles.noVehiclesContainer}>
                  <Car size={48} color="#CBD5E1" />
                  <Text style={styles.noVehiclesText}>No available vehicles found</Text>
                </View>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleItem,
                      vehicle.id === currentVehicleId && styles.currentVehicleItem,
                      selectedVehicleForAssignment?.id === vehicle.id && styles.selectedVehicleItem
                    ]}
                    onPress={() => handleSelectVehicle(vehicle)}
                  >
                    <View style={styles.vehicleItemLeft}>
                      <View style={[
                        styles.vehicleItemIcon,
                        vehicle.id === currentVehicleId && styles.currentVehicleIcon,
                        selectedVehicleForAssignment?.id === vehicle.id && styles.selectedVehicleIcon
                      ]}>
                        <Car size={24} color={
                          vehicle.id === currentVehicleId ? "#FFF" : 
                          selectedVehicleForAssignment?.id === vehicle.id ? "#FFF" : "#D97706"
                        } />
                      </View>
                      <View style={styles.vehicleItemInfo}>
                        <Text style={[
                          styles.vehicleItemName,
                          vehicle.id === currentVehicleId && styles.currentVehicleName,
                          selectedVehicleForAssignment?.id === vehicle.id && styles.selectedVehicleName
                        ]}>{vehicle.id}</Text>
                        <View style={styles.vehicleItemDetails}>
                          <Text style={styles.vehicleItemType}>{vehicle.type}</Text>
                          <Text style={styles.vehicleItemCapacity}>{vehicle.capacity}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.vehicleItemRight}>
                      <View style={[
                        styles.vehicleItemStatus,
                        { backgroundColor: vehicle.status === 'Available' ? '#10B981' : 
                          vehicle.status === 'In Use' ? '#D97706' : 
                          vehicle.status === 'Maintenance' ? '#EF4444' : '#94A3B8' }
                      ]} />
                      <Text style={styles.vehicleItemStatusText}>{vehicle.status}</Text>
                      {vehicle.id === currentVehicleId && (
                        <View style={styles.currentVehicleBadge}>
                          <Text style={styles.currentVehicleBadgeText}>Current</Text>
                        </View>
                      )}
                      {selectedVehicleForAssignment?.id === vehicle.id && (
                        <View style={styles.selectedVehicleBadge}>
                          <CheckCircle2 size={14} color="#FFF" />
                          <Text style={styles.selectedVehicleBadgeText}>Selected</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Justification Section - Always render but conditionally show */}
            <View style={[styles.justificationContainer, !selectedVehicleForAssignment && styles.justificationHidden]}>
              <View style={styles.justificationHeader}>
                <FileText size={20} color="#1E293B" />
                <Text style={styles.justificationTitle}>Reassignment Justification</Text>
              </View>
              <TextInput
                style={styles.justificationInput}
                placeholder="Please provide a reason for reassigning this vehicle..."
                placeholderTextColor="#94A3B8"
                value={justificationText}
                onChangeText={setJustificationText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!!selectedVehicleForAssignment}
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.modalFooter}>
              {selectedVehicleForAssignment ? (
                <TouchableOpacity 
                  style={[
                    styles.assignButton,
                    (!justificationText.trim()) && styles.assignButtonDisabled
                  ]}
                  onPress={handleConfirmVehicleReassignment}
                  disabled={!justificationText.trim()}
                >
                  <Text style={styles.assignButtonText}>Confirm Reassignment</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowVehicleModal(false);
                    setSelectedVehicleForAssignment(null);
                    setJustificationText('');
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
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
    marginBottom: 5
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 20,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    padding: 0,
  },
  driversList: {
    flex: 1,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  currentDriverItem: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  selectedDriverItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  driverItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentDriverAvatar: {
    backgroundColor: '#3B82F6',
  },
  selectedDriverAvatar: {
    backgroundColor: '#10B981',
  },
  driverItemInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
  },
  currentDriverInitials: {
    color: '#FFF',
  },
  selectedDriverInitials: {
    color: '#FFF',
  },
  driverItemInfo: {
    flex: 1,
  },
  driverItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  driverItemId: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  driverItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverItemRating: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  driverItemRatingText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  driverItemTrips: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  driverItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  driverItemStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  driverItemStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  currentDriverBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  currentDriverBadgeText: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '700',
  },
  selectedDriverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  selectedDriverBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  noDriversContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDriversText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '600',
  },
  vehiclesList: {
    flex: 1,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  currentVehicleItem: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  selectedVehicleItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  vehicleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentVehicleIcon: {
    backgroundColor: '#3B82F6',
  },
  selectedVehicleIcon: {
    backgroundColor: '#10B981',
  },
  vehicleItemInfo: {
    flex: 1,
  },
  vehicleItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  currentVehicleName: {
    color: '#3B82F6',
  },
  selectedVehicleName: {
    color: '#10B981',
  },
  vehicleItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleItemType: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  vehicleItemCapacity: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  vehicleItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  vehicleItemStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  vehicleItemStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  currentVehicleBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  currentVehicleBadgeText: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '700',
  },
  selectedVehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  selectedVehicleBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  noVehiclesContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVehiclesText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '600',
  },
  justificationContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  justificationHidden: {
    display: 'none',
  },
  justificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  justificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  justificationInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    paddingTop: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  assignButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  assignButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default SupervisorScreen;