import React, { useState, useMemo } from 'react';
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
  RefreshControl,
  Modal,
  Animated
} from 'react-native';
import {
  Car,
  Battery,
  MapPin,
  Clock,
  Search,
  Filter,
  Wifi,
  Activity,
  AlertCircle,
  CheckCircle2,
  Users,
  X,
  Phone,
  Navigation,
  BarChart3,
  Calendar,
  ArrowLeft,
  Shield,
  Gauge,
  Zap,
  BatteryCharging,
  Fuel,
  Thermometer,
  Eye,
  Bell
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Vehicle {
  id: string;
  vehicleId: string;
  type: 'BOV' | 'Mini BOV' | 'Cargo BOV';
  status: 'Available' | 'In Service' | 'Charging' | 'Maintenance' | 'Reserved';
  battery: number;
  range: number;
  location: string;
  lastTrip: string;
  totalTrips: number;
  driverName?: string;
  currentRoute?: string;
  speed?: number;
  efficiency: number; // km/kWh
  health: number; // percentage
  temperature: number; // °C
  lastMaintenance: string;
  nextMaintenance: string;
  signal: number;
  isOnline: boolean;
}

const AvailableBovScreen = ({ navigation }: { navigation: any }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Available');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');

  // Mock available BOVs data
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([
    {
      id: 'V-1001',
      vehicleId: 'BOV-401',
      type: 'BOV',
      status: 'Available',
      battery: 85,
      range: 120,
      location: 'Terminal 3, Bay 12',
      lastTrip: '15 min ago',
      totalTrips: 145,
      driverName: 'SV Rajesh Kumar',
      currentRoute: 'Airport → City Center',
      speed: 65,
      efficiency: 8.5,
      health: 92,
      temperature: 28,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-02-15',
      signal: 90,
      isOnline: true
    },
    {
      id: 'V-1002',
      vehicleId: 'BOV-402',
      type: 'BOV',
      status: 'Available',
      battery: 72,
      range: 95,
      location: 'Platform 4',
      lastTrip: '25 min ago',
      totalTrips: 189,
      driverName: 'Suresh Mohanty',
      currentRoute: 'Railway Station → Convention Center',
      speed: 45,
      efficiency: 8.2,
      health: 88,
      temperature: 30,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10',
      signal: 75,
      isOnline: true
    },
    {
      id: 'V-1003',
      vehicleId: 'BOV-403',
      type: 'Mini BOV',
      status: 'Charging',
      battery: 42,
      range: 50,
      location: 'Charging Station Zone A',
      lastTrip: '1 hour ago',
      totalTrips: 98,
      driverName: 'Amit Singh',
      efficiency: 9.1,
      health: 95,
      temperature: 25,
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-02-20',
      signal: 85,
      isOnline: true
    },
    {
      id: 'V-1004',
      vehicleId: 'BOV-404',
      type: 'BOV',
      status: 'In Service',
      battery: 64,
      range: 85,
      location: 'Mall Parking Lot A',
      lastTrip: '10 min ago',
      totalTrips: 167,
      driverName: 'Ravi Sharma',
      currentRoute: 'City Mall → Tech Park',
      speed: 35,
      efficiency: 8.0,
      health: 84,
      temperature: 32,
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-02-05',
      signal: 60,
      isOnline: true
    },
    {
      id: 'V-1005',
      vehicleId: 'BOV-405',
      type: 'Cargo BOV',
      status: 'Maintenance',
      battery: 100,
      range: 150,
      location: 'Service Center',
      lastTrip: '2 days ago',
      totalTrips: 203,
      efficiency: 7.5,
      health: 76,
      temperature: 22,
      lastMaintenance: '2024-01-25',
      nextMaintenance: '2024-01-30',
      signal: 0,
      isOnline: false
    },
    {
      id: 'V-1006',
      vehicleId: 'BOV-406',
      type: 'BOV',
      status: 'Available',
      battery: 78,
      range: 105,
      location: 'Main Road Junction',
      lastTrip: '5 min ago',
      totalTrips: 176,
      driverName: 'Sanjay Verma',
      currentRoute: 'Hospital → Residential Area',
      speed: 50,
      efficiency: 8.8,
      health: 91,
      temperature: 29,
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-02-18',
      signal: 95,
      isOnline: true
    },
    {
      id: 'V-1007',
      vehicleId: 'BOV-407',
      type: 'Mini BOV',
      status: 'Reserved',
      battery: 91,
      range: 110,
      location: 'Hotel District',
      lastTrip: '45 min ago',
      totalTrips: 112,
      driverName: 'Kumar Patel',
      efficiency: 9.3,
      health: 94,
      temperature: 27,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-12',
      signal: 80,
      isOnline: true
    },
    {
      id: 'V-1008',
      vehicleId: 'BOV-408',
      type: 'BOV',
      status: 'Available',
      battery: 67,
      range: 88,
      location: 'Business Park',
      lastTrip: '30 min ago',
      totalTrips: 134,
      efficiency: 8.3,
      health: 89,
      temperature: 31,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08',
      signal: 70,
      isOnline: true
    }
  ]);

  const statusFilters = ['All', 'Available', 'In Service', 'Charging', 'Maintenance', 'Reserved'];
  const typeFilters = ['All', 'BOV', 'Mini BOV', 'Cargo BOV'];

  const filteredVehicles = useMemo(() => {
    let filtered = availableVehicles;

    if (filterStatus !== 'All') {
      filtered = filtered.filter(vehicle => vehicle.status === filterStatus);
    }

    if (filterType !== 'All') {
      filtered = filtered.filter(vehicle => vehicle.type === filterType);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        vehicle =>
          vehicle.vehicleId.toLowerCase().includes(query) ||
          (vehicle.driverName && vehicle.driverName.toLowerCase().includes(query)) ||
          vehicle.location.toLowerCase().includes(query) ||
          (vehicle.currentRoute && vehicle.currentRoute.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [availableVehicles, filterStatus, filterType, searchQuery]);

  const stats = {
    totalAvailable: availableVehicles.filter(v => v.status === 'Available').length,
    totalVehicles: availableVehicles.length,
    averageBattery: Math.round(availableVehicles.reduce((sum, v) => sum + v.battery, 0) / availableVehicles.length),
    chargingNow: availableVehicles.filter(v => v.status === 'Charging').length,
    totalBOV: availableVehicles.filter(v => v.type === 'BOV').length,
    totalMini: availableVehicles.filter(v => v.type === 'Mini BOV').length,
    totalCargo: availableVehicles.filter(v => v.type === 'Cargo BOV').length
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return '#10B981';
      case 'In Service': return '#3B82F6';
      case 'Charging': return '#F59E0B';
      case 'Maintenance': return '#EF4444';
      case 'Reserved': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle2 size={16} color="#10B981" />;
      case 'In Service': return <Activity size={16} color="#3B82F6" />;
      case 'Charging': return <BatteryCharging size={16} color="#F59E0B" />;
      case 'Maintenance': return <AlertCircle size={16} color="#EF4444" />;
      case 'Reserved': return <Shield size={16} color="#8B5CF6" />;
      default: return <Car size={16} color="#6B7280" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BOV': return '#3B82F6';
      case 'Mini BOV': return '#8B5CF6';
      case 'Cargo BOV': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleViewLocation = (vehicle: Vehicle) => {
    Alert.alert(
      'View Location',
      `View ${vehicle.vehicleId}'s location on map?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Map', onPress: () => console.log('Opening map for:', vehicle.vehicleId) }
      ]
    );
  };

  const handleContactDriver = (vehicle: Vehicle) => {
    if (vehicle.driverName) {
      Alert.alert(
        'Contact Driver',
        `Contact ${vehicle.driverName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Calling driver of:', vehicle.vehicleId) }
        ]
      );
    }
  };

  const renderVehicleDetailsModal = () => {
    if (!selectedVehicle) return null;

    return (
      <Modal
        visible={showVehicleDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVehicleDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vehicle Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowVehicleDetails(false)}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Vehicle Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <View style={[styles.vehicleIconLarge, { backgroundColor: getTypeColor(selectedVehicle.type) + '20' }]}>
                    <Car size={32} color={getTypeColor(selectedVehicle.type)} />
                  </View>
                  <View>
                    <Text style={styles.detailVehicleId}>{selectedVehicle.vehicleId}</Text>
                    <View style={styles.detailType}>
                      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(selectedVehicle.type) + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: getTypeColor(selectedVehicle.type) }]}>
                          {selectedVehicle.type}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailStatus}>
                      {getStatusIcon(selectedVehicle.status)}
                      <Text style={[styles.detailStatusText, { color: getStatusColor(selectedVehicle.status) }]}>
                        {selectedVehicle.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Battery & Range */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Battery size={20} color="#10B981" />
                  <Text style={styles.detailCardTitle}>Battery & Range</Text>
                </View>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Battery Level</Text>
                    <View style={styles.batteryContainer}>
                      <Battery size={16} color={selectedVehicle.battery > 20 ? '#10B981' : '#EF4444'} />
                      <Text style={styles.detailValue}>{selectedVehicle.battery}%</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Range</Text>
                    <View style={styles.rangeContainer}>
                      <Navigation size={16} color="#3B82F6" />
                      <Text style={styles.detailValue}>{selectedVehicle.range} km</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Efficiency</Text>
                    <View style={styles.efficiencyContainer}>
                      <Zap size={16} color="#F59E0B" />
                      <Text style={styles.detailValue}>{selectedVehicle.efficiency} km/kWh</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Temperature</Text>
                    <View style={styles.tempContainer}>
                      <Thermometer size={16} color="#EF4444" />
                      <Text style={styles.detailValue}>{selectedVehicle.temperature}°C</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location & Status */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <MapPin size={20} color="#9D140C" />
                  <Text style={styles.detailCardTitle}>Location & Status</Text>
                </View>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Current Location</Text>
                    <Text style={styles.detailValue}>{selectedVehicle.location}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Trip</Text>
                    <Text style={styles.detailValue}>{selectedVehicle.lastTrip}</Text>
                  </View>
                  {selectedVehicle.currentRoute && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Current Route</Text>
                      <Text style={styles.detailValue}>{selectedVehicle.currentRoute}</Text>
                    </View>
                  )}
                  {selectedVehicle.speed && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Speed</Text>
                      <Text style={styles.detailValue}>{selectedVehicle.speed} km/h</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Signal</Text>
                    <View style={styles.signalContainer}>
                      <Wifi size={16} color="#3B82F6" />
                      <Text style={styles.detailValue}>{selectedVehicle.signal}%</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { color: selectedVehicle.isOnline ? '#10B981' : '#EF4444' }]}>
                      {selectedVehicle.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Performance & Health */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <BarChart3 size={20} color="#8B5CF6" />
                  <Text style={styles.detailCardTitle}>Performance & Health</Text>
                </View>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Vehicle Health</Text>
                    <View style={styles.healthContainer}>
                      <Activity size={16} color={selectedVehicle.health > 80 ? '#10B981' : '#F59E0B'} />
                      <Text style={styles.detailValue}>{selectedVehicle.health}%</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Total Trips</Text>
                    <Text style={styles.detailValue}>{selectedVehicle.totalTrips}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Maintenance</Text>
                    <Text style={styles.detailValue}>{selectedVehicle.lastMaintenance}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Next Maintenance</Text>
                    <Text style={styles.detailValue}>{selectedVehicle.nextMaintenance}</Text>
                  </View>
                </View>
              </View>

              {/* Driver Info */}
              {/* {selectedVehicle.driverName && (
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Users size={20} color="#3B82F6" />
                    <Text style={styles.detailCardTitle}>Driver Information</Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverInitials}>
                        {selectedVehicle.driverName.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{selectedVehicle.driverName}</Text>
                      <Text style={styles.driverStatus}>Currently Driving</Text>
                    </View>
                  </View>
                </View>
              )} */}

              {/* Action Buttons */}
              {/* <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                  onPress={() => handleViewLocation(selectedVehicle)}
                >
                  <Navigation size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Track</Text>
                </TouchableOpacity>
                {selectedVehicle.driverName && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => handleContactDriver(selectedVehicle)}
                  >
                    <Phone size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Call Driver</Text>
                  </TouchableOpacity>
                )}
              </View> */}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerSubtitle}>AVAILABLE BOVs</Text>
              <Text style={styles.headerTitle}>Fleet Management</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={22} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Car size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.totalAvailable}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Battery size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.averageBattery}%</Text>
            <Text style={styles.statLabel}>Avg Battery</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Zap size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.chargingNow}</Text>
            <Text style={styles.statLabel}>Charging</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Users size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.totalVehicles}</Text>
            <Text style={styles.statLabel}>Total Fleet</Text>
          </View>
        </View> */}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#9D140C']}
            tintColor="#9D140C"
          />
        }
      >
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by vehicle ID ..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filters */}
          {/* <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {statusFilters.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterPill,
                    filterStatus === status && styles.filterPillActive
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filterStatus === status && styles.filterTextActive
                    ]}
                  >
                    {status}
                  </Text>
                  {filterStatus === status && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {status === 'All' ? filteredVehicles.length :
                         filteredVehicles.filter(v => v.status === status).length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View> */}

          {/* Type Filters */}
          {/* <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {typeFilters.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterPill,
                    filterType === type && [styles.filterPillActive, { backgroundColor: getTypeColor(type) }]
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filterType === type && styles.filterTextActive
                    ]}
                  >
                    {type}
                  </Text>
                  {filterType === type && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {type === 'All' ? filteredVehicles.length :
                         filteredVehicles.filter(v => v.type === type).length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View> */}
        </View>

        {/* Vehicles List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Vehicles
            <Text style={styles.sectionCount}> ({filteredVehicles.length})</Text>
          </Text>

          {filteredVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Car size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Vehicles Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try a different search term' : 'No vehicles match the current filter'}
              </Text>
            </View>
          ) : (
            filteredVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => {
                  setSelectedVehicle(vehicle);
                  setShowVehicleDetails(true);
                }}
              >
                <View style={styles.vehicleCardHeader}>
                  <View style={styles.vehicleInfo}>
                    <View style={[styles.vehicleIcon, { backgroundColor: getTypeColor(vehicle.type) + '20' }]}>
                      <Car size={24} color={getTypeColor(vehicle.type)} />
                    </View>
                    <View style={styles.vehicleMainInfo}>
                      <View style={styles.vehicleIdRow}>
                        <Text style={styles.vehicleId} numberOfLines={1}>
                          {vehicle.vehicleId}
                        </Text>
                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(vehicle.type) + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: getTypeColor(vehicle.type) }]}>
                            {vehicle.type}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
                          {getStatusIcon(vehicle.status)}
                          <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
                            {vehicle.status}
                          </Text>
                        </View>
                        <View style={styles.onlineIndicator}>
                          <View style={[
                            styles.onlineDot,
                            { backgroundColor: vehicle.isOnline ? '#10B981' : '#EF4444' }
                          ]} />
                          <Text style={styles.onlineText}>
                            {vehicle.isOnline ? 'Online' : 'Offline'}
                          </Text>
                        </View>
                      </View>
                      {/* {vehicle.driverName && (
                        <Text style={styles.driverText}>Driver: {vehicle.driverName}</Text>
                      )} */}
                    </View>
                  </View>

                  <View style={styles.vehicleMetrics}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Battery</Text>
                      <View style={styles.batteryIndicator}>
                        <Battery size={14} color={vehicle.battery > 20 ? '#10B981' : '#EF4444'} />
                        <Text style={styles.metricValue}>{vehicle.battery}%</Text>
                      </View>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Range</Text>
                      <Text style={styles.metricValue}>{vehicle.range} km</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.vehicleCardBody}>
                  <View style={styles.locationInfo}>
                    <MapPin size={16} color="#9D140C" />
                    <Text style={styles.locationText}>{vehicle.location}</Text>
                  </View>

                  <View style={styles.vehicleFooter}>
                    <View style={styles.vehicleStats}>
                      {/* <View style={styles.statItem}>
                        <Clock size={14} color="#64748B" />
                        <Text style={styles.statText}>{vehicle.lastTrip}</Text>
                      </View> */}
                      <View style={styles.statItem}>
                        <Text style={styles.tripsText}>🚗 {vehicle.totalTrips} trips</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Activity size={14} color="#64748B" />
                        <Text style={styles.healthText}>{vehicle.health}% health</Text>
                      </View>
                    </View>

                    {/* <View style={styles.actionIcons}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleViewLocation(vehicle);
                        }}
                      >
                        <Navigation size={18} color="#8B5CF6" />
                      </TouchableOpacity>
                      {vehicle.driverName && (
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleContactDriver(vehicle);
                          }}
                        >
                          <Phone size={18} color="#3B82F6" />
                        </TouchableOpacity>
                      )}
                    </View> */}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Status Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>In Service</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Charging</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Maintenance</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Reserved</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {renderVehicleDetailsModal()}
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
    paddingBottom: 20,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD166',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
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
    fontSize: 20,
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
  searchContainer: {
    marginBottom: 25,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 12,
    minWidth: 50,
  },
  filterScroll: {
    flex: 1,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 36,
  },
  filterPillActive: {
    backgroundColor: '#9D140C',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  sectionCount: {
    color: '#9D140C',
  },
  vehicleCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  vehicleInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  vehicleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleMainInfo: {
    flex: 1,
  },
  vehicleIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  driverText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  vehicleMetrics: {
    alignItems: 'flex-end',
  },
  metricItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleCardBody: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  vehicleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
  },
  tripsText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  healthText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
  legendContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailVehicleId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  detailType: {
    marginBottom: 8,
  },
  detailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  detailItem: {
    width: (width - 80) / 2,
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  efficiencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D97706',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  driverStatus: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AvailableBovScreen;