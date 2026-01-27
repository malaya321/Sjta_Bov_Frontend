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
  Users,
  Car,
  LogOut,
  MapPin,
  Clock,
  User,
  Bell,
  Search,
  Filter,
  Battery,
  Phone,
  MessageCircle,
  Navigation,
  Activity,
  CheckCircle2,
  AlertCircle,
  X,
  Wifi,
  Shield,
  Eye,
  BarChart3,
  Calendar,
  ArrowLeft  // Add ArrowLeft icon
} from 'lucide-react-native';
import { useLogout } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

interface Driver {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'On Break' | 'Off Duty';
  vehicleId: string;
  currentRoute: string;
  location: string;
  speed: number;
  battery: number;
  lastUpdate: string;
  rating: number;
  tripsToday: number;
  eta?: string;
  distance: number;
  signal: number;
  isOnline: boolean;
}

const ActiveDriversScreen = ({ navigation }: { navigation: any }) => { // Add navigation prop
  const logoutMutation = useLogout();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverDetails, setShowDriverDetails] = useState(false);

  // Mock active drivers data
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([
    {
      id: 'D-1024',
      name: 'SV Rajesh Kumar',
      status: 'Active',
      vehicleId: 'BOV-401',
      currentRoute: 'Airport → City Center',
      location: 'Terminal 3, Bay 12',
      speed: 65,
      battery: 85,
      lastUpdate: '2 min ago',
      rating: 4.8,
      tripsToday: 8,
      eta: '15:45',
      distance: 4.2,
      signal: 90,
      isOnline: true
    },
    {
      id: 'D-1025',
      name: 'Suresh Mohanty',
      status: 'Active',
      vehicleId: 'BOV-402',
      currentRoute: 'Railway Station → Convention Center',
      location: 'Platform 4',
      speed: 45,
      battery: 72,
      lastUpdate: '5 min ago',
      rating: 4.9,
      tripsToday: 12,
      eta: '16:20',
      distance: 2.8,
      signal: 75,
      isOnline: true
    },
    {
      id: 'D-1026',
      name: 'Amit Singh',
      status: 'On Break',
      vehicleId: 'BOV-403',
      currentRoute: 'Hotel District → Business Park',
      location: 'Rest Area Zone 2',
      speed: 0,
      battery: 92,
      lastUpdate: '10 min ago',
      rating: 4.7,
      tripsToday: 6,
      distance: 0,
      signal: 85,
      isOnline: true
    },
    {
      id: 'D-1027',
      name: 'Ravi Sharma',
      status: 'Active',
      vehicleId: 'BOV-404',
      currentRoute: 'City Mall → Tech Park',
      location: 'Mall Parking Lot A',
      speed: 35,
      battery: 64,
      lastUpdate: '3 min ago',
      rating: 4.6,
      tripsToday: 9,
      eta: '14:50',
      distance: 1.5,
      signal: 60,
      isOnline: true
    },
    {
      id: 'D-1028',
      name: 'Kumar Patel',
      status: 'Inactive',
      vehicleId: 'BOV-405',
      currentRoute: 'Depot → Service Center',
      location: 'Depot Parking',
      speed: 0,
      battery: 100,
      lastUpdate: '25 min ago',
      rating: 4.8,
      tripsToday: 11,
      distance: 0,
      signal: 0,
      isOnline: false
    },
    {
      id: 'D-1029',
      name: 'Sanjay Verma',
      status: 'Active',
      vehicleId: 'BOV-406',
      currentRoute: 'Hospital → Residential Area',
      location: 'Main Road Junction',
      speed: 50,
      battery: 78,
      lastUpdate: '1 min ago',
      rating: 4.9,
      tripsToday: 14,
      eta: '17:10',
      distance: 3.7,
      signal: 95,
      isOnline: true
    }
  ]);

  const statusFilters = ['All', 'Active', 'On Break', 'Inactive', 'Off Duty'];

  const filteredDrivers = useMemo(() => {
    let filtered = activeDrivers;

    if (filterStatus !== 'All') {
      filtered = filtered.filter(driver => driver.status === filterStatus);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        driver =>
          driver.name.toLowerCase().includes(query) ||
          driver.id.toLowerCase().includes(query) ||
          driver.vehicleId.toLowerCase().includes(query) ||
          driver.currentRoute.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeDrivers, filterStatus, searchQuery]);

  const stats = {
    totalActive: activeDrivers.filter(d => d.status === 'Active').length,
    totalDrivers: activeDrivers.length,
    averageSpeed: Math.round(activeDrivers.reduce((sum, d) => sum + d.speed, 0) / activeDrivers.length),
    onTimeRate: '94%'
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              // onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                'Logout Failed',
                'There was an issue logging out. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleCallDriver = (driver: Driver) => {
    Alert.alert(
      'Contact Driver',
      `Call ${driver.name} (${driver.id})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling:', driver.name) }
      ]
    );
  };

  const handleMessageDriver = (driver: Driver) => {
    Alert.prompt(
      'Send Message',
      `Send message to ${driver.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: (message:any) => {
            if (message) {
              Alert.alert('Message Sent', `Message sent to ${driver.name}`);
            }
          }
        }
      ]
    );
  };

  const handleViewLocation = (driver: Driver) => {
    Alert.alert(
      'View Location',
      `View ${driver.name}'s location on map?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Map', onPress: () => console.log('Opening map for:', driver.name) }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'On Break': return '#F59E0B';
      case 'Inactive': return '#EF4444';
      case 'Off Duty': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Activity size={16} color="#10B981" />;
      case 'On Break': return <Clock size={16} color="#F59E0B" />;
      case 'Inactive': return <AlertCircle size={16} color="#EF4444" />;
      default: return <User size={16} color="#6B7280" />;
    }
  };

  const renderDriverDetailsModal = () => {
    if (!selectedDriver) return null;

    return (
      <Modal
        visible={showDriverDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDriverDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDriverDetails(false)}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Driver Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <View style={styles.driverAvatarLarge}>
                    <Text style={styles.driverInitialsLarge}>
                      {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailDriverName}>{selectedDriver.name}</Text>
                    <Text style={styles.detailDriverId}>{selectedDriver.id}</Text>
                    <View style={styles.detailStatus}>
                      {getStatusIcon(selectedDriver.status)}
                      <Text style={[styles.detailStatusText, { color: getStatusColor(selectedDriver.status) }]}>
                        {selectedDriver.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Vehicle Info */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Car size={20} color="#3B82F6" />
                  <Text style={styles.detailCardTitle}>Vehicle Information</Text>
                </View>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Vehicle ID</Text>
                    <Text style={styles.detailValue}>{selectedDriver.vehicleId}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Battery</Text>
                    <View style={styles.batteryContainer}>
                      <Battery size={16} color="#10B981" />
                      <Text style={styles.detailValue}>{selectedDriver.battery}%</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Signal</Text>
                    <View style={styles.signalContainer}>
                      <Wifi size={16} color="#3B82F6" />
                      <Text style={styles.detailValue}>{selectedDriver.signal}%</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Trip Info */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <MapPin size={20} color="#10B981" />
                  <Text style={styles.detailCardTitle}>Current Trip</Text>
                </View>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Route</Text>
                    <Text style={styles.detailValue}>{selectedDriver.currentRoute}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedDriver.location}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Speed</Text>
                    <Text style={styles.detailValue}>{selectedDriver.speed} km/h</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>{selectedDriver.distance} km</Text>
                  </View>
                  {selectedDriver.eta && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>ETA</Text>
                      <Text style={styles.detailValue}>{selectedDriver.eta}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Update</Text>
                    <Text style={styles.detailValue}>{selectedDriver.lastUpdate}</Text>
                  </View>
                </View>
              </View>

              {/* Performance */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <BarChart3 size={20} color="#8B5CF6" />
                  <Text style={styles.detailCardTitle}>Performance</Text>
                </View>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Rating</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>⭐ {selectedDriver.rating}/5.0</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Trips Today</Text>
                    <Text style={styles.detailValue}>{selectedDriver.tripsToday}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedDriver.status) + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedDriver.status) }]}>
                        {selectedDriver.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              {/* <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => handleCallDriver(selectedDriver)}
                >
                  <Phone size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleMessageDriver(selectedDriver)}
                >
                  <MessageCircle size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                  onPress={() => handleViewLocation(selectedDriver)}
                >
                  <Navigation size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Navigate</Text>
                </TouchableOpacity>
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
              <Text style={styles.headerSubtitle}>ACTIVE DRIVERS</Text>
              <Text style={styles.headerTitle}>Real-time Monitoring</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={22} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Stats Overview - commented out as in your original code */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Activity size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.totalActive}</Text>
            <Text style={styles.statLabel}>Active Now</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Users size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.totalDrivers}</Text>
            <Text style={styles.statLabel}>Total Drivers</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Car size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.averageSpeed}</Text>
            <Text style={styles.statLabel}>Avg Speed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <CheckCircle2 size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.onTimeRate}</Text>
            <Text style={styles.statLabel}>On Time Rate</Text>
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
              placeholder="Search drivers by name, ID or route..."
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

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                        {status === 'All' ? filteredDrivers.length :
                         filteredDrivers.filter(d => d.status === status).length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Drivers List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {filterStatus === 'All' ? 'All Drivers' : `${filterStatus} Drivers`}
            <Text style={styles.sectionCount}> ({filteredDrivers.length})</Text>
          </Text>

          {filteredDrivers.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Drivers Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try a different search term' : 'No drivers match the current filter'}
              </Text>
            </View>
          ) : (
            filteredDrivers.map((driver) => (
              <TouchableOpacity
                key={driver.id}
                style={styles.driverCard}
                onPress={() => {
                  setSelectedDriver(driver);
                  setShowDriverDetails(true);
                }}
              >
                <View style={styles.driverCardHeader}>
                  <View style={styles.driverInfo}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverInitials}>
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.driverMainInfo}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName} numberOfLines={1}>
                          {driver.name}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) + '20' }]}>
                          {getStatusIcon(driver.status)}
                          <Text style={[styles.statusText, { color: getStatusColor(driver.status) }]}>
                            {driver.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.driverId}>{driver.id}</Text>
                      <View style={styles.vehicleInfo}>
                        <Car size={14} color="#64748B" />
                        <Text style={styles.vehicleText}>{driver.vehicleId}</Text>
                        <View style={styles.onlineIndicator}>
                          <View style={[
                            styles.onlineDot,
                            { backgroundColor: driver.isOnline ? '#10B981' : '#EF4444' }
                          ]} />
                          <Text style={styles.onlineText}>
                            {driver.isOnline ? 'Online' : 'Offline'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.driverMetrics}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Speed</Text>
                      <Text style={styles.metricValue}>{driver.speed} km/h</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Battery</Text>
                      <View style={styles.batteryIndicator}>
                        <Battery size={14} color={driver.battery > 20 ? '#10B981' : '#EF4444'} />
                        <Text style={styles.metricValue}>{driver.battery}%</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.driverCardBody}>
                  <View style={styles.routeInfo}>
                    <MapPin size={16} color="#9D140C" />
                    <Text style={styles.routeText}>{driver.currentRoute}</Text>
                  </View>
                  <Text style={styles.locationText}>{driver.location}</Text>

                  <View style={styles.driverFooter}>
                    <View style={styles.driverStats}>
                      {/* <View style={styles.statItem}>
                        <Clock size={14} color="#64748B" />
                        <Text style={styles.statText}>{driver.lastUpdate}</Text>
                      </View> */}
                      <View style={styles.statItem}>
                        <Text style={styles.ratingText}>⭐ {driver.rating}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.tripsText}>🚗 {driver.tripsToday} trips</Text>
                      </View>
                    </View>

                    {/* <View style={styles.actionIcons}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCallDriver(driver);
                        }}
                      >
                        <Phone size={18} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleMessageDriver(driver);
                        }}
                      >
                        <MessageCircle size={18} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleViewLocation(driver);
                        }}
                      >
                        <Navigation size={18} color="#8B5CF6" />
                      </TouchableOpacity>
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
              <Text style={styles.legendText}>Active</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>On Break</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Inactive</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.legendText}>Off Duty</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {renderDriverDetailsModal()}
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
    paddingBottom: 5,
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
  driverCard: {
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
  driverCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  driverInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D97706',
  },
  driverMainInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
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
  driverId: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 8,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
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
  driverMetrics: {
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
  driverCardBody: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  driverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverStats: {
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
  // ratingText: {
  //   fontSize: 12,
  //   color: '#92400E',
  //   fontWeight: '600',
  // },
  tripsText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
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
  driverAvatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitialsLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D97706',
  },
  detailDriverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  detailDriverId: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
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
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingContainer: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ActiveDriversScreen;