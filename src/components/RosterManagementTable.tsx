import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import {
  Car,
  User,
  Clock,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  ChevronUp
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Types
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

interface RosterManagementTableProps {
  data: RosterEntry[];
  onReassignDriver: (rosterId: string, currentDriver: string) => void;
  onReassignVehicle: (rosterId: string, currentVehicle: string) => void;
  onEditRoster: (roster: RosterEntry) => void;
  onViewDetails: (roster: RosterEntry) => void;
}

// Action Modal Component - Defined outside main component
const ActionModal = ({ 
  visible, 
  onClose, 
  selectedRoster, 
  onReassignDriver, 
  onReassignVehicle, 
  onEditRoster 
}: { 
  visible: boolean;
  onClose: () => void;
  selectedRoster: RosterEntry | null;
  onReassignDriver: (rosterId: string, currentDriver: string) => void;
  onReassignVehicle: (rosterId: string, currentVehicle: string) => void;
  onEditRoster: (roster: RosterEntry) => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.actionModalContent}>
        <View style={styles.actionModalHeader}>
          <Text style={styles.actionModalTitle}>Manage Roster</Text>
          <Text style={styles.actionModalSubtitle}>
            {selectedRoster?.driverName} - {selectedRoster?.vehicleName}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            onClose();
            if (selectedRoster) {
              onReassignDriver(selectedRoster.id, selectedRoster.driverName);
            }
          }}
        >
          <User size={20} color="#D97706" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionButtonTitle}>Reassign Driver</Text>
            <Text style={styles.actionButtonSubtitle}>Change driver for this roster</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            onClose();
            if (selectedRoster) {
              onReassignVehicle(selectedRoster.id, selectedRoster.vehicleName);
            }
          }}
        >
          <Car size={20} color="#D97706" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionButtonTitle}>Reassign Vehicle</Text>
            <Text style={styles.actionButtonSubtitle}>Change vehicle for this roster</Text>
          </View>
        </TouchableOpacity>
        
        {/* <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            onClose();
            if (selectedRoster) {
              onEditRoster(selectedRoster);
            }
          }}
        >
          <Edit size={20} color="#3B82F6" />
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionButtonTitle}>Edit Roster</Text>
            <Text style={styles.actionButtonSubtitle}>Modify roster details</Text>
          </View>
        </TouchableOpacity> */}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

// Filter Modal Component - Defined outside main component
const FilterModal = ({ 
  visible, 
  onClose, 
  data,
  statusFilter,
  zoneFilter,
  onStatusFilterChange,
  onZoneFilterChange
}: { 
  visible: boolean;
  onClose: () => void;
  data: RosterEntry[];
  statusFilter: string;
  zoneFilter: string;
  onStatusFilterChange: (status: string) => void;
  onZoneFilterChange: (zone: string) => void;
}) => {
  const zones = [...new Set(data.map(item => item.zoneName))];
  const statuses = ['all', 'Active', 'Completed', 'Scheduled', 'Cancelled'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter Rosters</Text>
            <TouchableOpacity onPress={onClose}>
              <XCircle size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    statusFilter === status && styles.filterChipActive
                  ]}
                  onPress={() => onStatusFilterChange(status)}
                >
                  <Text style={[
                    styles.filterChipText,
                    statusFilter === status && styles.filterChipTextActive
                  ]}>
                    {status === 'all' ? 'All' : status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Zone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  zoneFilter === 'all' && styles.filterChipActive
                ]}
                onPress={() => onZoneFilterChange('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  zoneFilter === 'all' && styles.filterChipTextActive
                ]}>All Zones</Text>
              </TouchableOpacity>
              {zones.map((zone) => (
                <TouchableOpacity
                  key={zone}
                  style={[
                    styles.filterChip,
                    zoneFilter === zone && styles.filterChipActive
                  ]}
                  onPress={() => onZoneFilterChange(zone)}
                >
                  <Text style={[
                    styles.filterChipText,
                    zoneFilter === zone && styles.filterChipTextActive
                  ]}>{zone}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={styles.applyFilterButton}
            onPress={onClose}
          >
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const RosterManagementTable = ({
  data,
  onReassignDriver,
  onReassignVehicle,
  onEditRoster,
  onViewDetails
}: RosterManagementTableProps) => {
  const [selectedRoster, setSelectedRoster] = useState<RosterEntry | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Determine if we're on mobile or web/tablet - call unconditionally
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  // Filter data based on search and filters
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.zoneName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesZone = zoneFilter === 'all' || item.zoneName === zoneFilter;
    
    return matchesSearch && matchesStatus && matchesZone;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'Completed': return '#64748B';
      case 'Scheduled': return '#3B82F6';
      case 'Cancelled': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getOperationalStatusColor = (status: string) => {
    switch (status) {
      case 'Operational': return '#10B981';
      case 'Maintenance': return '#D97706';
      case 'Out of Service': return '#EF4444';
      case 'Reserved': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getRosterTypeColor = (type: string) => {
    switch (type) {
      case 'Regular': return '#3B82F6';
      case 'Extra': return '#10B981';
      case 'Emergency': return '#EF4444';
      case 'Training': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  // Render table view for web/tablet
  const renderTableView = () => (
    <View>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Driver Name</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Vehicle</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Shift Time</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Roster Type</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Supervisor</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Zone</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Vehicle Status</Text>
        <Text style={[styles.headerCell, { flex: 0.8 }]}>Action</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tableScroll}
      >
        <View>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.tableBody}
          >
            {filteredData.length === 0 ? (
              <View style={styles.emptyState}>
                <Car size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateTitle}>No Rosters Found</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery || statusFilter !== 'all' || zoneFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create a new roster to get started'}
                </Text>
              </View>
            ) : (
              filteredData.map((item, index) => (
                <View key={item.id} style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.rowEven
                ]}>
                  <View style={[styles.cell, { flex: 1.5 }]}>
                    <View style={styles.driverInfo}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverInitials}>
                          {item.driverName.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <Text style={styles.driverNameText}>{item.driverName}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1.2 }]}>
                    <View style={styles.vehicleInfo}>
                      <Car size={16} color="#64748B" />
                      <Text style={styles.vehicleNameText}>{item.vehicleName}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1 }]}>
                    <View style={styles.timeInfo}>
                      <Clock size={14} color="#64748B" />
                      <Text style={styles.cellText}>{item.shiftTime}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1 }]}>
                    <View style={[styles.rosterTypeBadge, { backgroundColor: `${getRosterTypeColor(item.rosterType)}20` }]}>
                      <Text style={[styles.rosterTypeText, { color: getRosterTypeColor(item.rosterType) }]}>
                        {item.rosterType}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1.2 }]}>
                    <Text style={styles.cellText}>{item.supervisorName}</Text>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1 }]}>
                    <View style={styles.zoneInfo}>
                      <MapPin size={14} color="#64748B" />
                      <Text style={styles.cellText}>{item.zoneName}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1 }]}>
                    <View style={styles.dateInfo}>
                      <Calendar size={14} color="#64748B" />
                      <Text style={styles.cellText}>{item.rosterDate}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1 }]}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 1.5 }]}>
                    <View style={[styles.operationalStatusBadge, { backgroundColor: `${getOperationalStatusColor(item.vehicleOperationalStatus)}20` }]}>
                      {item.vehicleOperationalStatus === 'Operational' && <CheckCircle size={14} color="#10B981" />}
                      {item.vehicleOperationalStatus === 'Maintenance' && <AlertCircle size={14} color="#D97706" />}
                      {item.vehicleOperationalStatus === 'Out of Service' && <XCircle size={14} color="#EF4444" />}
                      <Text style={[styles.operationalStatusText, { color: getOperationalStatusColor(item.vehicleOperationalStatus) }]}>
                        {item.vehicleOperationalStatus}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.cell, { flex: 0.8 }]}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedRoster(item);
                        setShowActions(true);
                      }}
                    >
                      <MoreVertical size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );

  // Render mobile view - COMPACT CARD
  const renderMobileView = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={styles.mobileContainer}
    >
      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Car size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Rosters Found</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery || statusFilter !== 'all' || zoneFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create a new roster to get started'}
          </Text>
        </View>
      ) : (
        filteredData.map((item) => {
          const isExpanded = expandedCard === item.id;
          
          return (
            <View key={item.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.compactCard}
                onPress={() => setExpandedCard(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.compactCardLeft}>
                  <View style={styles.compactDriverAvatar}>
                    <Text style={styles.compactDriverInitials}>
                      {item.driverName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.compactDriverInfo}>
                    <Text style={styles.compactDriverName} numberOfLines={2}>
                      {item.driverName}
                    </Text>
                    <View style={styles.compactVehicleInfo}>
                      <Car size={12} color="#64748B" />
                      <Text style={styles.compactVehicleName} numberOfLines={1}>
                        {item.vehicleName}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.compactCardRight}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedRoster(item);
                      setShowActions(true);
                    }}
                    style={styles.compactActionButton}
                  >
                    <MoreVertical size={18} color="#64748B" />
                  </TouchableOpacity>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#D97706" />
                  ) : (
                    <ChevronRight size={18} color="#64748B" />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.statusTimeRow}>
                <View style={[styles.compactStatusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                  <Text style={[styles.compactStatusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
                <View style={styles.compactTimeContainer}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.compactTimeText}>{item.shiftTime.split(' - ')[0]}</Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.expandedDetails}>
                  <View style={styles.expandedSection}>
                    <Text style={styles.expandedSectionTitle}>Roster Details</Text>
                    
                    <View style={styles.expandedRow}>
                      <View style={styles.expandedItem}>
                        <Clock size={14} color="#64748B" />
                        <Text style={styles.expandedLabel}>Full Shift:</Text>
                        <Text style={styles.expandedValue}>{item.shiftTime}</Text>
                      </View>
                    </View>

                    <View style={styles.expandedRow}>
                      <View style={styles.expandedItem}>
                        <User size={14} color="#64748B" />
                        <Text style={styles.expandedLabel}>Supervisor:</Text>
                        <Text style={styles.expandedValue}>{item.supervisorName}</Text>
                      </View>
                    </View>

                    <View style={styles.expandedRow}>
                      <View style={styles.expandedItem}>
                        <MapPin size={14} color="#64748B" />
                        <Text style={styles.expandedLabel}>Zone:</Text>
                        <Text style={styles.expandedValue}>{item.zoneName}</Text>
                      </View>
                    </View>

                    <View style={styles.expandedRow}>
                      <View style={styles.expandedItem}>
                        <Calendar size={14} color="#64748B" />
                        <Text style={styles.expandedLabel}>Date:</Text>
                        <Text style={styles.expandedValue}>{item.rosterDate}</Text>
                      </View>
                    </View>

                    <View style={styles.expandedRow}>
                      <View style={styles.expandedItem}>
                        <View style={[styles.expandedBadge, { backgroundColor: `${getRosterTypeColor(item.rosterType)}20` }]}>
                          <Text style={[styles.expandedBadgeText, { color: getRosterTypeColor(item.rosterType) }]}>
                            {item.rosterType}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.expandedItem}>
                        <View style={[styles.expandedOperationalStatus, { backgroundColor: `${getOperationalStatusColor(item.vehicleOperationalStatus)}20` }]}>
                          {item.vehicleOperationalStatus === 'Operational' && <CheckCircle size={12} color="#10B981" />}
                          {item.vehicleOperationalStatus === 'Maintenance' && <AlertCircle size={12} color="#D97706" />}
                          {item.vehicleOperationalStatus === 'Out of Service' && <XCircle size={12} color="#EF4444" />}
                          <Text style={[styles.expandedOperationalStatusText, { color: getOperationalStatusColor(item.vehicleOperationalStatus) }]}>
                            {item.vehicleOperationalStatus}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.expandedActions}>
                    <TouchableOpacity 
                      style={styles.expandedActionButton}
                      onPress={() => {
                        setSelectedRoster(item);
                        setShowActions(true);
                      }}
                    >
                      <Edit size={16} color="#3B82F6" />
                      <Text style={styles.expandedActionText}>Manage</Text>
                    </TouchableOpacity>
                    
                    {/* <TouchableOpacity 
                      style={[styles.expandedActionButton, styles.expandedViewButton]}
                      onPress={() => onViewDetails(item)}
                    >
                      <ChevronRight size={16} color="#D97706" />
                      <Text style={styles.expandedViewText}>View Details</Text>
                    </TouchableOpacity> */}
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchFilterBar}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search driver, vehicle, zone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color="#64748B" />
          <Text style={styles.filterButtonText}>Filter</Text>
          {(statusFilter !== 'all' || zoneFilter !== 'all') && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Conditional rendering - but hooks are already called unconditionally above */}
      {isMobile ? renderMobileView() : renderTableView()}

      {/* Modals - Always rendered, never conditional */}
      <ActionModal
        visible={showActions}
        onClose={() => setShowActions(false)}
        selectedRoster={selectedRoster}
        onReassignDriver={onReassignDriver}
        onReassignVehicle={onReassignVehicle}
        onEditRoster={onEditRoster}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        data={data}
        statusFilter={statusFilter}
        zoneFilter={zoneFilter}
        onStatusFilterChange={setStatusFilter}
        onZoneFilterChange={setZoneFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    padding: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableScroll: {
    marginHorizontal: -20,
  },
  tableBody: {
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowEven: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D97706',
  },
  driverNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rosterTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rosterTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  operationalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  operationalStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
//   actionButton: {
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: '#F1F5F9',
//   },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  actionModalHeader: {
    marginBottom: 24,
  },
  actionModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionModalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    flex: 1,
  },
  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#D97706',
  },
  applyFilterButton: {
    backgroundColor: '#D97706',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // Mobile Compact Card Styles
  mobileContainer: {
    // maxHeight: 500,
    // marginBottom:50,
  },
  cardWrapper: {
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
  },
  compactCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactDriverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactDriverInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
  },
  compactDriverInfo: {
    flex: 1,
  },
  compactDriverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 22,
  },
  compactVehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactVehicleName: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  compactCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  statusTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  compactStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  compactStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  compactTimeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  expandedDetails: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  expandedSection: {
    marginBottom: 16,
  },
  expandedSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  expandedRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  expandedItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  expandedValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  expandedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  expandedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  expandedOperationalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  expandedOperationalStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  expandedActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  expandedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 8,
  },
  expandedActionText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  expandedViewButton: {
    backgroundColor: '#FFFBEB',
  },
  expandedViewText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
});

export default RosterManagementTable;