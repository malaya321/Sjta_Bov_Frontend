// src/screens/supervisor/SupervisorScreen.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react'; // Add useRef
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
  Modal,
  ActivityIndicator,
  RefreshControl
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
  FileText,
  Filter
} from 'lucide-react-native';
import { useLogout } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ConfirmationAlert } from '../../components/ConfirmationAlert';
import { 
  useSupervisorDashboard,
  useReassignDriver,
  useReassignVehicle,
  useCreateAssignment,
  useUnassignVehicle,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDrivers,
  useVehicles,
  useActiveRosters,
  useNotifications,
  useCancelRoster,
  useUpdateRoster
} from '../../hooks/useSupervisor';

// Define navigation types for the ROOT stack
type RootStackParamList = {
  LoginScreen: undefined;
  MainTabs: undefined;
  SupervisorStack: undefined;
  ActiveDriver: undefined;
  AvailableBov: undefined;
  DriverDetails: { driverId: string };
  VehicleDetails: { vehicleId: string };
  RosterDetails: { rosterId: string };
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
  startTime?: string;
  endTime?: string;
  route?: string;
  notes?: string;
  // Additional fields from API
  shift_id?: number;
  shift_name?: string;
  roster_master_id?: number;
  roster_id?: string;
  mapping_id?: number;
  driver_id?: number;
  vehicle_id?: number;
}

interface Driver {
  id: string;
  name: string;
  status: 'Available' | 'In Shift' | 'Break' | 'Off Duty';
  rating: string;
  trips: number;
  phone?: string;
  zone?: string;
  // Additional fields from API
  username?: string;
  shift_id?: number;
  supervisor_id?: number;
  supervisor_name?: string;
  mobile?: string;
}

interface Vehicle {
  id: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Reserved';
  type: 'AC' | 'Non-AC' | 'Electric';
  capacity: string;
  currentDriver?: string;
  // Additional fields from API
  vehicle_number?: string;
  chip_id?: string;
  vehicle_model?: string;
  insurance_policy_number?: string;
  insurance_expiry_date?: string;
  supervisor_id?: number;
  supervisor_name?: string;
  supervisor?: any;
  latest_maintenance?: any;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  driverId?: string;
  vehicleId?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface SupervisorScreenProps {
  onLogout: () => void;
}

// Helper function to map roster status
const mapRosterStatus = (status: number): 'Active' | 'Completed' | 'Scheduled' | 'Cancelled' => {
  switch(status) {
    case 1:
      return 'Active';
    case 2:
      return 'Completed';
    case 3:
      return 'Cancelled';
    default:
      return 'Scheduled';
  }
};

// Helper function to map roster type based on shift name
const mapRosterType = (shiftName: string): 'Regular' | 'Extra' | 'Emergency' | 'Training' => {
  const shiftLower = shiftName?.toLowerCase() || '';
  if (shiftLower.includes('emergency')) return 'Emergency';
  if (shiftLower.includes('training')) return 'Training';
  if (shiftLower.includes('extra')) return 'Extra';
  return 'Regular';
};

const SupervisorScreen = ({ onLogout }: SupervisorScreenProps) => {
  // Add a mounted ref to prevent state updates after unmount
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Hooks - ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const logoutMutation = useLogout();
  const navigation = useNavigation<NavigationProp>();

  // React Query Hooks - Always called, never conditionally
  const {
    stats,
    activeDrivers,
    availableVehicles,
    activeAssignments,
    todayRosters,
    unreadNotifications,
    isLoading,
    isRefreshing,
    refresh
  } = useSupervisorDashboard();

  const { data: notificationsData } = useNotifications({ unreadOnly: true });
  const notifications = notificationsData?.data || [];
  
  const { data: activeRostersData } = useActiveRosters();
  const activeRosterList = activeRostersData || [];

  // Search queries state
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  
  // These hooks are ALWAYS called, regardless of whether modals are open
  const { 
    data: filteredDriversData, 
    isLoading: isDriversLoading,
    refetch: refetchDrivers
  } = useDrivers({ 
    search: driverSearchQuery,
    limit: 20,
    enabled: true
  });
  
  const { 
    data: filteredVehiclesData, 
    isLoading: isVehiclesLoading,
    refetch: refetchVehicles
  } = useDrivers({ 
    search: vehicleSearchQuery,
    limit: 20,
    enabled: true
  });
// console.log(filteredVehiclesData,'mapApiDriversToDrivers+')
// console.log(filteredDriversData,'mapApiDriversToDrivers+')
  // Mutation Hooks
  const reassignDriverMutation = useReassignDriver();
  const reassignVehicleMutation = useReassignVehicle();
  const createAssignmentMutation = useCreateAssignment();
  const unassignVehicleMutation = useUnassignVehicle();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const cancelRosterMutation = useCancelRoster();
  const updateRosterMutation = useUpdateRoster();

  // Local State
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedBov, setSelectedBov] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isCheckedIn] = useState(false);
  const [message, setMessage] = useState('Please report to the designated pick-up location. Drive safely and follow all traffic regulations.');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modal states
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentRosterId, setCurrentRosterId] = useState<string | null>(null);
  const [currentDriverName, setCurrentDriverName] = useState<string>('');
  const [currentVehicleName, setCurrentVehicleName] = useState<string>('');
  const [currentDriverId, setCurrentDriverId] = useState<string>('');
  const [currentVehicleId, setCurrentVehicleId] = useState<string>('');
  const [selectedDriverForAssignment, setSelectedDriverForAssignment] = useState<Driver | null>(null);
  const [selectedVehicleForAssignment, setSelectedVehicleForAssignment] = useState<Vehicle | null>(null);
  const [justificationText, setJustificationText] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
// console.log(selectedVehicleForAssignment,'selectedVehicleForAssignment+++++')
  // Map API drivers to your Driver interface
  const mapApiDriversToDrivers = (apiDrivers: any[]): Driver[] => {
    if (!apiDrivers || !Array.isArray(apiDrivers)) return [];
    
    return apiDrivers.map((driver: any) => ({
      id: driver.id?.toString() || '',
      name: driver.name || 'Unknown Driver',
      status: mapDriverStatus(driver.status),
      rating: '4.5',
      trips: 0,
      phone: driver.mobile || undefined,
      zone: driver.zone || undefined,
      username: driver.username,
      shift_id: driver.shift_id,
      supervisor_id: driver.supervisor_id,
      supervisor_name: driver.supervisor_name,
      mobile: driver.mobile
    }));
  };
// console.log(mapApiDriversToDrivers,'mapApiDriversToDrivers+')
  // Map API vehicles to your Vehicle interface
  const mapApiVehiclesToVehicles = (apiVehicles: any[]): Vehicle[] => {
    if (!apiVehicles || !Array.isArray(apiVehicles)) return [];
    
    return apiVehicles.map((vehicle: any) => ({
      id: vehicle.id?.toString() || 'Unknown',
      status: mapVehicleStatus(vehicle.status),
      type: mapVehicleType(vehicle.vehicle_model),
      capacity: vehicle.vehicle_capacity?.toString() || '0',
      currentDriver: undefined,
      vehicle_number: vehicle.vehicle_number,
      chip_id: vehicle.chip_id,
      vehicle_model: vehicle.vehicle_model,
      insurance_policy_number: vehicle.insurance_policy_number,
      insurance_expiry_date: vehicle.insurance_expiry_date,
      supervisor_id: vehicle.supervisor_id,
      supervisor_name: vehicle.supervisor_name,
      supervisor: vehicle.supervisor,
      latest_maintenance: vehicle.latest_maintenance
    }));
  };

  // Helper function to map driver status
  const mapDriverStatus = (status: any): 'Available' | 'In Shift' | 'Break' | 'Off Duty' => {
    if (typeof status === 'string') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'active' || statusLower === 'available') return 'Available';
      if (statusLower === 'in shift' || statusLower === 'on duty') return 'In Shift';
      if (statusLower === 'break') return 'Break';
    }
    if (typeof status === 'number') {
      if (status === 1) return 'Available';
      if (status === 2) return 'In Shift';
      if (status === 3) return 'Break';
    }
    return 'Off Duty';
  };

  // Helper function to map vehicle status
  const mapVehicleStatus = (status: any): 'Available' | 'In Use' | 'Maintenance' | 'Reserved' => {
    if (typeof status === 'string') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'active' || statusLower === 'available') return 'Available';
      if (statusLower === 'in use' || statusLower === 'assigned') return 'In Use';
      if (statusLower === 'maintenance') return 'Maintenance';
    }
    if (typeof status === 'number') {
      if (status === 1) return 'Available';
      if (status === 2) return 'In Use';
      if (status === 3) return 'Maintenance';
    }
    return 'Available';
  };

  // Helper function to map vehicle type
  const mapVehicleType = (model: string): 'AC' | 'Non-AC' | 'Electric' => {
    const modelLower = model?.toLowerCase() || '';
    if (modelLower.includes('electric') || modelLower.includes('ev')) return 'Electric';
    if (modelLower.includes('ac')) return 'AC';
    return 'Non-AC';
  };

  // Create base drivers list from dashboard data
  const baseDriversList = useMemo(() => {
    return mapApiDriversToDrivers(activeDrivers?.available_drivers || []);
  }, [activeDrivers]);

  // Create base vehicles list from dashboard data
  const baseVehiclesList = useMemo(() => {
    return mapApiVehiclesToVehicles(activeDrivers?.available_vehicles || []);
  }, [activeDrivers]);

  // Merge with filtered data when available
  const driversList = useMemo(() => {
    if (filteredDriversData?.data && filteredDriversData.data.length > 0) {
      const mappedFiltered = mapApiDriversToDrivers(filteredDriversData.data);
      const existingIds = new Set(baseDriversList.map(d => d.id));
      const newDrivers = mappedFiltered.filter(d => !existingIds.has(d.id));
      return [...baseDriversList, ...newDrivers];
    }
    return baseDriversList;
  }, [baseDriversList, filteredDriversData]);

  const vehiclesList = useMemo(() => {
    if (filteredVehiclesData?.data && filteredVehiclesData.data.length > 0) {
      const mappedFiltered = mapApiVehiclesToVehicles(filteredVehiclesData.data);
      const existingIds = new Set(baseVehiclesList.map(v => v.id));
      const newVehicles = mappedFiltered.filter(v => !existingIds.has(v.id));
      return [...baseVehiclesList, ...newVehicles];
    }
    return baseVehiclesList;
  }, [baseVehiclesList, filteredVehiclesData]);

  // Transform rosters using useMemo instead of useEffect to prevent infinite loops
  const rosterData = useMemo(() => {
    if (!todayRosters?.data?.rosters || !Array.isArray(todayRosters.data.rosters)) {
      return [];
    }
    
    try {
      // Transform the nested mappings into separate roster entries
      const transformedRosters = todayRosters.data.rosters.flatMap((roster: any) => {
        // Ensure roster is an object
        if (!roster || typeof roster !== 'object') return [];
        
        // If there are mappings, create an entry for each mapping
        if (roster.mappings && Array.isArray(roster.mappings) && roster.mappings.length > 0) {
          return roster.mappings.map((mapping: any) => {
            // Ensure mapping is an object
            if (!mapping || typeof mapping !== 'object') return null;
            
            return {
              id: mapping.mapping_id?.toString() || `temp-${Date.now()}-${Math.random()}`,
              driverName: mapping.driver_name || 'Unassigned',
              vehicleName: mapping.vehicle_number || 'Not Assigned',
              shiftTime: roster.shift_start_time && roster.shift_end_time 
                ? `${roster.shift_start_time} - ${roster.shift_end_time}`
                : 'Not Scheduled',
              rosterType: mapRosterType(roster.shift_name || ''),
              supervisorName: 'Supervisor',
              zoneName: roster.zone_name || 'Main Zone',
              rosterDate: roster.roster_date || new Date().toISOString().split('T')[0],
              status: mapRosterStatus(mapping.status),
              vehicleOperationalStatus: 'Operational',
              shift_id: roster.shift_id,
              shift_name: roster.shift_name,
              roster_master_id: roster.roster_master_id,
              roster_id: roster.roster_id,
              mapping_id: mapping.mapping_id,
              driver_id: mapping.driver_id,
              vehicle_id: mapping.vehicle_id,
              startTime: roster.shift_start_time,
              endTime: roster.shift_end_time
            };
          }).filter(Boolean); // Remove any null entries
        }
        
        // If no mappings, create a single entry with the roster info
        return [{
          id: roster.roster_master_id?.toString() || `temp-${Date.now()}-${Math.random()}`,
          driverName: 'Unassigned',
          vehicleName: 'Not Assigned',
          shiftTime: roster.shift_start_time && roster.shift_end_time 
            ? `${roster.shift_start_time} - ${roster.shift_end_time}`
            : 'Not Scheduled',
          rosterType: mapRosterType(roster.shift_name || ''),
          supervisorName: 'Supervisor',
          zoneName: roster.zone_name || 'Main Zone',
          rosterDate: roster.roster_date || new Date().toISOString().split('T')[0],
          status: 'Scheduled',
          vehicleOperationalStatus: 'Operational',
          shift_id: roster.shift_id,
          shift_name: roster.shift_name,
          roster_master_id: roster.roster_master_id,
          roster_id: roster.roster_id,
          startTime: roster.shift_start_time,
          endTime: roster.shift_end_time
        }];
      });
      
      return transformedRosters;
    } catch (error) {
      console.error('Error transforming rosters:', error);
      return [];
    }
  }, [todayRosters?.data?.rosters]);

  // Transform assignments using useMemo
  const assignments = useMemo(() => {
    return activeAssignments && Array.isArray(activeAssignments) ? activeAssignments : [];
  }, [activeAssignments]);

  // Get selected roster data for current operation
  const selectedRoasterData = useMemo(() => {
    if (!currentRosterId || !todayRosters?.data?.rosters || !Array.isArray(todayRosters.data.rosters)) {
      return null;
    }
    
    try {
      // Find the roster master that contains this mapping
      const rosterMaster = todayRosters.data.rosters.find(
        (roster: any) => roster && roster.mappings && Array.isArray(roster.mappings) && 
        roster.mappings.some((m: any) => m && m.mapping_id?.toString() === currentRosterId)
      );
      
      if (rosterMaster) {
        // Find the specific mapping
        const mapping = rosterMaster.mappings.find(
          (m: any) => m && m.mapping_id?.toString() === currentRosterId
        );
        
        if (mapping) {
          return {
            ...rosterMaster,
            ...mapping,
            roster_master_id: rosterMaster.roster_master_id,
            shift_id: rosterMaster.shift_id,
            driver_id: mapping.driver_id,
            vehicle_id: mapping.vehicle_id,
            mapping_id: mapping.mapping_id,
            rosterDate: rosterMaster.roster_date,
            status: mapRosterStatus(mapping.status)
          };
        }
      }
    } catch (error) {
      console.error('Error finding selected roster:', error);
    }
    
    return null;
  }, [currentRosterId, todayRosters?.data?.rosters]);

  // Filtered lists for modals
  const filteredDrivers = useMemo(() => {
    return driversList.filter(driver => 
      driver.name.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      driver.id.toLowerCase().includes(driverSearchQuery.toLowerCase())
    );
  }, [driversList, driverSearchQuery]);

  const filteredVehicles = useMemo(() => {
    return vehiclesList.filter(vehicle => 
      vehicle.id.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      (vehicle.vehicle_model && vehicle.vehicle_model.toLowerCase().includes(vehicleSearchQuery.toLowerCase()))
    );
  }, [vehiclesList, vehicleSearchQuery]);

  // Stats for display
  const dashboardStats = {
    activeDrivers: stats?.activeDrivers || (activeDrivers?.length || 0),
    availableBovs: stats?.availableBovs || (availableVehicles?.length || 0),
    activeAssignments: stats?.activeAssignments || (activeAssignments?.length || 0),
    pendingRequests: stats?.pendingRequests || unreadNotifications || 0
  };

  // Active assignments list
  const activeAssignmentsList = useMemo(() => {
    return assignments.filter(a => a.status === 'Active');
  }, [assignments]);

  // Trigger refetch when modals open to get fresh data
  useEffect(() => {
    if (showDriverModal && isMounted.current) {
      refetchDrivers();
    }
  }, [showDriverModal, refetchDrivers]);

  useEffect(() => {
    if (showVehicleModal && isMounted.current) {
      refetchVehicles();
    }
  }, [showVehicleModal, refetchVehicles]);

  const confirmLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      if (isMounted.current) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation handlers
  const handleActiveDriversPress = () => {
    navigation.navigate('ActiveDriver');
  };

  const handleAvailableBovsPress = () => {
    navigation.navigate('AvailableBov');
  };

  const handleDriverPress = (driverId: string) => {
    navigation.navigate('DriverDetails', { driverId });
  };

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate('VehicleDetails', { vehicleId });
  };

  const handleRosterPress = (rosterId: string) => {
    navigation.navigate('RosterDetails', { rosterId });
  };

  // Roster management handlers
  const handleReassignDriver = (rosterId: string, currentDriver: string) => {
    const roster = rosterData.find(r => r.id === rosterId);
    const driver = driversList.find(d => d.name === currentDriver);
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
    const vehicle = vehiclesList.find(v => v.id === currentVehicle);
    setCurrentRosterId(rosterId);
    setCurrentVehicleName(currentVehicle);
    setCurrentVehicleId(vehicle?.id || '');
    setVehicleSearchQuery('');
    setSelectedVehicleForAssignment(null);
    setJustificationText('');
    setShowVehicleModal(true);
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
            navigation.navigate('RosterDetails', { rosterId: roster.id });
          }
        }
      ]
    );
  };

  const handleViewDetails = (roster: RosterEntry) => {
    navigation.navigate('RosterDetails', { rosterId: roster.id });
  };

  
  const handleSelectDriver = (driver: Driver) => {
    if (driver.id === currentDriverId) {
      Alert.alert('Info', 'This driver is already assigned to this roster.');
      return;
    }
    setSelectedDriverForAssignment(driver);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    if (vehicle.id === currentVehicleId) {
      Alert.alert('Info', 'This vehicle is already assigned to this roster.');
      return;
    }
    setSelectedVehicleForAssignment(vehicle);
  };

  // Confirmation handlers
  const handleConfirmDriverReassignment = async () => {
    if (!selectedDriverForAssignment || !justificationText.trim() || !currentRosterId || !selectedRoasterData) {
      Alert.alert('Error', 'Please select a driver and provide justification.');
      return;
    }

    try {
      await reassignDriverMutation.mutateAsync({
        justification: justificationText,
        mapping_id:selectedRoasterData?.mapping_id,
        driver_id: parseInt(selectedDriverForAssignment?.id),
        vehicle_id: selectedRoasterData?.vehicle_id
      });
      setShowDriverModal(false);
      if (isMounted.current) {
        
        setSelectedDriverForAssignment(null);
        setJustificationText('');
        setCurrentRosterId(null);
        setCurrentDriverName('');
        setCurrentDriverId('');
        refresh(); // Refresh the dashboard data
      }
    } catch (error) {
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to reassign driver. Please try again.');
      }
    }
  };

  const handleConfirmVehicleReassignment = async () => {
    if (!selectedVehicleForAssignment || !justificationText.trim() || !currentRosterId || !selectedRoasterData) {
      Alert.alert('Error', 'Please select a vehicle and provide justification.');
      return;
    }

    try {
      await reassignVehicleMutation.mutateAsync({
       justification: justificationText,
        mapping_id:selectedRoasterData?.mapping_id,
        driver_id: selectedRoasterData?.driver_id,
        vehicle_id: parseInt(selectedVehicleForAssignment?.id),
        
      });
      setShowVehicleModal(false);
      if (isMounted.current) {
        
        setSelectedVehicleForAssignment(null);
        setJustificationText('');
        setCurrentRosterId(null);
        setCurrentVehicleName('');
        setCurrentVehicleId('');
        refresh(); // Refresh the dashboard data
      }
    } catch (error) {
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to reassign vehicle. Please try again.');
      }
    }
  };

  // Assignment handlers
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
    createAssignmentMutation.mutate({
      driverId: selectedDriver!.id,
      vehicleId: selectedBov,
      route: 'To be assigned',
      notes: message
    }, {
      onSuccess: () => {
        if (isMounted.current) {
          setMessage('');
          setSelectedDriver(null);
          setSelectedBov('');
          refresh();
        }
      }
    });
  };

  const handleQuickAssign = () => {
    const availableDriver = driversList.find(driver => driver.status === 'Available');
    const availableVehicle = vehiclesList.find(vehicle => vehicle.status === 'Available');

    if (!availableDriver || !availableVehicle) {
      Alert.alert(
        'No Available Resources',
        'No available drivers or vehicles at the moment.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedDriver(availableDriver);
    setSelectedBov(availableVehicle.id);
    
    Alert.alert(
      'Quick Assign',
      `Would you like to assign ${availableVehicle.id} to ${availableDriver.name}?`,
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

  const handleUnassign = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    Alert.alert(
      'Unassign Vehicle',
      `Remove ${assignment.bov} from ${assignment.driverName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            unassignVehicleMutation.mutate({
              assignmentId,
              reason: 'Supervisor request'
            }, {
              onSuccess: () => {
                if (isMounted.current) {
                  refresh();
                }
              }
            });
          }
        }
      ]
    );
  };

  // Notification handlers
  const handleNotificationPress = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    if (!notification.read) {
      markNotificationRead.mutate(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead.mutate();
  };

  const handleNotificationAction = () => {
    if (selectedNotification?.driverId) {
      setShowNotificationModal(false);
      navigation.navigate('DriverDetails', { driverId: selectedNotification.driverId });
    } else if (selectedNotification?.vehicleId) {
      setShowNotificationModal(false);
      navigation.navigate('VehicleDetails', { vehicleId: selectedNotification.vehicleId });
    }
  };

  // Loading screen - This is AFTER all hooks are called, so it's safe
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9D140C" />
          <Text style={styles.loadingText}>Loading supervisor dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={22} color="#FFF" />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowAlert(true)}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <View style={styles.notificationsDropdown}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Notifications</Text>
              {unreadNotifications > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.notificationsList} maxHeight={300}>
              {notifications.length === 0 ? (
                <Text style={styles.noNotificationsText}>No notifications</Text>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={[
                      styles.notificationIcon,
                      { 
                        backgroundColor: 
                          notification.type === 'warning' ? '#FEF3C7' :
                          notification.type === 'error' ? '#FEE2E2' :
                          notification.type === 'success' ? '#D1FAE5' : '#E0F2FE'
                      }
                    ]}>
                      {notification.type === 'warning' && <AlertCircle size={16} color="#D97706" />}
                      {notification.type === 'error' && <X size={16} color="#DC2626" />}
                      {notification.type === 'success' && <CheckCircle2 size={16} color="#059669" />}
                      {notification.type === 'info' && <Bell size={16} color="#2563EB" />}
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
        
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
            <Text style={styles.statValue}>{filteredDriversData?.available_drivers?.length}</Text>
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
            <Text style={styles.statValue}>{filteredDriversData?.available_vehicles?.length}</Text>
            <Text style={styles.statLabel}>Available BOVs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard} 
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <ClipboardCheck size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{dashboardStats.activeAssignments}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Assign Banner */}
        {/* <TouchableOpacity style={styles.quickAssignBanner} onPress={handleQuickAssign}>
          <View style={styles.quickAssignContent}>
            <Text style={styles.quickAssignTitle}>Quick Assign</Text>
            <Text style={styles.quickAssignSubtitle}>Tap to assign available driver & vehicle</Text>
          </View>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity> */}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#9D140C']}
            tintColor="#9D140C"
          />
        }
      >
        {/* Active Roster Summary */}
        {activeRosterList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Rosters</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeRosterList.length} Active</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeRosterList.map((roster) => (
                <TouchableOpacity
                  key={roster.id}
                  style={styles.activeRosterCard}
                  onPress={() => handleRosterPress(roster.id)}
                >
                  <View style={styles.activeRosterHeader}>
                    <View style={styles.activeRosterDriver}>
                      <User size={16} color="#9D140C" />
                      <Text style={styles.activeRosterDriverName}>{roster.driverName}</Text>
                    </View>
                    <View style={styles.activeRosterVehicle}>
                      <Car size={16} color="#10B981" />
                      <Text style={styles.activeRosterVehicleName}>{roster.vehicleName}</Text>
                    </View>
                  </View>
                  <Text style={styles.activeRosterTime}>{roster.shiftTime}</Text>
                  <Text style={styles.activeRosterZone}>{roster.zoneName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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

        {/* Active Assignments */}
        {activeAssignmentsList.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Assignments</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeAssignmentsList.length} Active</Text>
              </View>
            </View>
            
            {activeAssignmentsList.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <View style={styles.assignmentDriver}>
                    <User size={16} color="#9D140C" />
                    <Text style={styles.assignmentDriverName}>{assignment.driverName}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleUnassign(assignment.id)}
                    style={styles.unassignButton}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.assignmentDetails}>
                  <View style={styles.assignmentDetail}>
                    <Car size={14} color="#64748B" />
                    <Text style={styles.assignmentDetailText}>{assignment.bov}</Text>
                  </View>
                  <View style={styles.assignmentDetail}>
                    <Clock size={14} color="#64748B" />
                    <Text style={styles.assignmentDetailText}>{assignment.time}</Text>
                  </View>
                  <View style={styles.assignmentDetail}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.assignmentDetailText}>{assignment.location}</Text>
                  </View>
                </View>
                
                <View style={styles.assignmentRoute}>
                  <Text style={styles.assignmentRouteText}>{assignment.route}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
              {isDriversLoading && (
                <ActivityIndicator size="small" color="#9D140C" />
              )}
            </View>

            {/* Drivers List */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.driversList}
            >
              {reassignDriverMutation.isPending && (
                <ActivityIndicator size="small" color="#9D140C" style={styles.modalLoader} />
              )}
              {filteredDrivers.length === 0 ? (
                <View style={styles.noDriversContainer}>
                  <User size={48} color="#CBD5E1" />
                  <Text style={styles.noDriversText}>No drivers found</Text>
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
                    disabled={reassignDriverMutation.isPending}
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
                        { backgroundColor: 
                          driver.status === 'Available' ? '#10B981' : 
                          driver.status === 'In Shift' ? '#D97706' : 
                          driver.status === 'Break' ? '#94A3B8' : '#64748B' 
                        }
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

            {/* Justification Section */}
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
                editable={!!selectedDriverForAssignment && !reassignDriverMutation.isPending}
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.modalFooter}>
              {selectedDriverForAssignment ? (
                <TouchableOpacity 
                  style={[
                    styles.assignButton,
                    (!justificationText.trim() || reassignDriverMutation.isPending) && styles.assignButtonDisabled
                  ]}
                  onPress={handleConfirmDriverReassignment}
                  disabled={!justificationText.trim() || reassignDriverMutation.isPending}
                >
                  {reassignDriverMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.assignButtonText}>Confirm Reassignment</Text>
                  )}
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
              {isVehiclesLoading && (
                <ActivityIndicator size="small" color="#9D140C" />
              )}
            </View>

            {/* Vehicles List */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.vehiclesList}
            >
              {reassignVehicleMutation.isPending && (
                <ActivityIndicator size="small" color="#9D140C" style={styles.modalLoader} />
              )}
              {filteredVehicles.length === 0 ? (
                <View style={styles.noVehiclesContainer}>
                  <Car size={48} color="#CBD5E1" />
                  <Text style={styles.noVehiclesText}>No vehicles found</Text>
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
                    disabled={reassignVehicleMutation.isPending}
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
                        ]}>{vehicle.vehicle_number}</Text>
                        <View style={styles.vehicleItemDetails}>
                          <Text style={styles.vehicleItemType}>{vehicle.type}</Text>
                          <Text style={styles.vehicleItemCapacity}>{vehicle.capacity} seats</Text>
                        </View>
                        {vehicle.vehicle_model && (
                          <Text style={styles.vehicleItemModel}>{vehicle.vehicle_model}</Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.vehicleItemRight}>
                      <View style={[
                        styles.vehicleItemStatus,
                        { backgroundColor: 
                          vehicle.status === 'Available' ? '#10B981' : 
                          vehicle.status === 'In Use' ? '#D97706' : 
                          vehicle.status === 'Maintenance' ? '#EF4444' : '#94A3B8' 
                        }
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

            {/* Justification Section */}
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
                editable={!!selectedVehicleForAssignment && !reassignVehicleMutation.isPending}
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.modalFooter}>
              {selectedVehicleForAssignment ? (
                <TouchableOpacity 
                  style={[
                    styles.assignButton,
                    (!justificationText.trim() || reassignVehicleMutation.isPending) && styles.assignButtonDisabled
                  ]}
                  onPress={handleConfirmVehicleReassignment}
                  disabled={!justificationText.trim() || reassignVehicleMutation.isPending}
                >
                  {reassignVehicleMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.assignButtonText}>Confirm Reassignment</Text>
                  )}
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

      {/* Notification Details Modal */}
      <Modal
        visible={showNotificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModalContent}>
            <View style={styles.notificationModalHeader}>
              <Text style={styles.notificationModalTitle}>Notification Details</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            {selectedNotification && (
              <>
                <View style={[
                  styles.notificationModalIcon,
                  { 
                    backgroundColor: 
                      selectedNotification.type === 'warning' ? '#FEF3C7' :
                      selectedNotification.type === 'error' ? '#FEE2E2' :
                      selectedNotification.type === 'success' ? '#D1FAE5' : '#E0F2FE'
                  }
                ]}>
                  {selectedNotification.type === 'warning' && <AlertCircle size={32} color="#D97706" />}
                  {selectedNotification.type === 'error' && <X size={32} color="#DC2626" />}
                  {selectedNotification.type === 'success' && <CheckCircle2 size={32} color="#059669" />}
                  {selectedNotification.type === 'info' && <Bell size={32} color="#2563EB" />}
                </View>
                
                <Text style={styles.notificationModalTitle}>{selectedNotification.title}</Text>
                <Text style={styles.notificationModalMessage}>{selectedNotification.message}</Text>
                
                <View style={styles.notificationModalTime}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.notificationModalTimeText}>
                    {new Date(selectedNotification.timestamp).toLocaleString()}
                  </Text>
                </View>

                {(selectedNotification.driverId || selectedNotification.vehicleId) && (
                  <TouchableOpacity 
                    style={styles.notificationModalButton}
                    onPress={handleNotificationAction}
                  >
                    <Text style={styles.notificationModalButtonText}>
                      View {selectedNotification.driverId ? 'Driver' : 'Vehicle'} Details
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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

// Styles remain the same...
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  notificationModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
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
  notificationsDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    left: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  markAllReadText: {
    fontSize: 12,
    color: '#9D140C',
    fontWeight: '600',
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  unreadNotification: {
    backgroundColor: '#FEF2F2',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  noNotificationsText: {
    textAlign: 'center',
    padding: 20,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
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
  quickAssignBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  quickAssignContent: {
    flex: 1,
  },
  quickAssignTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  quickAssignSubtitle: {
    fontSize: 12,
    color: '#FFD166',
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
  activeRosterCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeRosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activeRosterDriver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeRosterDriverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  activeRosterVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeRosterVehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  activeRosterTime: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  activeRosterZone: {
    fontSize: 12,
    color: '#94A3B8',
  },
  assignmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignmentDriver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignmentDriverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  unassignButton: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  assignmentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  assignmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assignmentDetailText: {
    fontSize: 13,
    color: '#64748B',
  },
  assignmentRoute: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  assignmentRouteText: {
    fontSize: 13,
    color: '#1E293B',
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
  notificationModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  notificationModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationModalMessage: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  notificationModalTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  notificationModalTimeText: {
    fontSize: 14,
    color: '#64748B',
  },
  notificationModalButton: {
    backgroundColor: '#9D140C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  notificationModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
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
  modalLoader: {
    marginVertical: 20,
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
    marginBottom: 2,
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
  vehicleItemModel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
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