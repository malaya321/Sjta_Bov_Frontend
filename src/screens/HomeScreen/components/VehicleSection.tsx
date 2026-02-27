import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryCharging,
  AlertTriangle,
  CheckCircle2,
  Navigation as NavIcon,
  Car,
  Wifi,
  X,
} from 'lucide-react-native';

type VehicleSectionProps = {
  isIOS: boolean;
  isSmallDevice: boolean;
  driverData: any;
  isCheckedIn: boolean;
  isLoggingOut: boolean;
  totalLoading: boolean;
  vehicleStatus: string;
  allVehicleStatusData:any;
  batteryLevel: number;
  onStatusChange: (status: string, justification?: string) => void;
    selectedStatus:any;
            setSelectedStatus:React.Dispatch<React.SetStateAction<any>>;
            justification:any;
            setJustification:React.Dispatch<React.SetStateAction<any>>;
};

const VehicleSection: React.FC<VehicleSectionProps> = ({
  isIOS,
  isSmallDevice,
  driverData,
  isCheckedIn,
  isLoggingOut,
  totalLoading,
  vehicleStatus,
  allVehicleStatusData,
  batteryLevel,
  onStatusChange,
    selectedStatus,
    setSelectedStatus,
    justification,
    setJustification
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  // const [selectedStatus, setSelectedStatus] = useState<any>(null);
  // const [justification, setJustification] = useState('');

  const statusColors: any = {
    'Running': { bg: '#DCFCE7', text: '#15803D', icon: '#22C55E' },
    'Charging': { bg: '#FEF3C7', text: '#D97706', icon: '#F59E0B' },
    'Cleaning': { bg: '#DBEAFE', text: '#1D4ED8', icon: '#3B82F6' },
    'Under Maintenance': { bg: '#FEE2E2', text: '#DC2626', icon: '#EF4444' },
    'Idle': { bg: '#F1F5F9', text: '#64748B', icon: '#94A3B8' }
  };

  const handleStatusPress = (status: any) => {
    
    if (status?.name === vehicleStatus) {
      return; // Don't show modal if selecting same status
    }
    setSelectedStatus(status);
    setJustification('');
    setModalVisible(true);
  };

  const handleConfirmStatusChange = () => {
    if (!justification.trim()) {
      // console.log(selectedStatus,'status-----')
      Alert.alert('Error', 'Please provide a justification for changing the status');
      return;
    }
    
    if (selectedStatus) {
      onStatusChange(selectedStatus, justification.trim());
      setModalVisible(false);
      
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setJustification('');
    setSelectedStatus(null);
  };

  const renderStatusIcon = (status: string, isActive: boolean) => {
    const iconColor = isActive ? statusColors[status]?.icon || '#D97706' : '#94A3B8';
    const iconSize = isSmallDevice ? 16 : 20;
{console.log(iconColor,'status++++++')}
    switch (status?.trim()) {
      case 'Running':
        return <NavIcon size={iconSize} color={iconColor} />;
      case 'Charging':
        return <BatteryCharging size={iconSize} color={iconColor} />;
      case 'Idle':
        return <CheckCircle2 size={iconSize} color={iconColor} />;
      case 'Under Maintenance':
        return <AlertTriangle size={iconSize} color={iconColor} />;
      default:
        return <Car size={iconSize} color={iconColor} />;
    }
  };

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Vehicle</Text>
          {isCheckedIn && (
            <View style={styles.connectionStatus}>
              <Wifi size={isSmallDevice ? 10 : 12} color="#22C55E" />
              <View style={styles.pulseDot} />
            </View>
          )}
        </View>
        <View style={[styles.vehicleCard, isIOS && styles.iosShadow]}>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.vehicleLabel}>Current BOV</Text>
              <Text style={styles.vehicleNumber}>{driverData?.vehicle_details?.vehicle_number}</Text>
            </View>
            <View style={styles.vehicleStats}>
              <View style={styles.batteryContainer}>
                {/* Battery Icons */}
                {driverData?.vehicle_details?.vehicle_battery < 20 ? (
                  <Battery size={isSmallDevice ? 16 : 18} color="#DC2626" />
                ) : driverData?.vehicle_details?.vehicle_battery < 50 ? (
                  <BatteryLow size={isSmallDevice ? 16 : 18} color="#F59E0B" />
                ) : driverData?.vehicle_details?.vehicle_battery < 80 ? (
                  <BatteryMedium size={isSmallDevice ? 16 : 18} color="#22C55E" />
                ) : (
                  <BatteryFull size={isSmallDevice ? 16 : 18} color="#22C55E" />
                )}

                {/* Battery Text with matching colors */}
                <Text style={[
                  styles.batteryText,
                  driverData?.vehicle_details?.vehicle_battery < 20 && styles.criticalBatteryText,
                  driverData?.vehicle_details?.vehicle_battery >= 20 && 
                  driverData?.vehicle_details?.vehicle_battery < 50 && styles.lowBatteryText,
                  driverData?.vehicle_details?.vehicle_battery >= 50 && styles.goodBatteryText,
                ]}>
                  {driverData?.vehicle_details?.vehicle_battery}%
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: statusColors[driverData?.vehicle_details?.vehicle_status]?.bg || '#F1F5F9',
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: statusColors[driverData?.vehicle_details?.vehicle_status]?.text || '#64748B' }
                ]}>
                  {driverData?.vehicle_details?.vehicle_status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statusGrid}>
            {/* {console.log(vehicleStatus,allVehicleStatusData?.items,driverData?.vehicle_details?.vehicle_status,'vehicleStatus+++')} */}
            {allVehicleStatusData?.items?.map((status: any, index: any) => {
              if (index <= 3) {
                return (
                  <TouchableOpacity
                    key={status?.id}
                    disabled={!isCheckedIn || isLoggingOut || totalLoading}
                    // disabled={ isLoggingOut || totalLoading}
                    onPress={() => handleStatusPress(status)}
                    style={[
                      styles.statusButton,
                      driverData?.vehicle_details?.vehicle_status === status?.name && styles.statusButtonActive,
                      !isCheckedIn && styles.statusButtonDisabled,
                      isIOS && styles.iosButton
                    ]}
                    activeOpacity={0.7}
                  >
                    {renderStatusIcon(status?.name?.trim(), driverData?.vehicle_details?.vehicle_status === status?.name?.trim())}
                  
                    <Text style={[
                      styles.statusButtonText,
                      driverData?.vehicle_details?.vehicle_status === status?.name?.trim() && styles.statusButtonTextActive
                    ]}>
                      {status?.name}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            })}
          </View>
        </View>
      </View>

      {/* Justification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isIOS && styles.iosModalShadow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Vehicle Status</Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.statusChangeInfo}>
                <Text style={styles.statusChangeLabel}>Changing from:</Text>
                <View style={[styles.currentStatusBadge, { backgroundColor: statusColors[driverData?.vehicle_details?.vehicle_status]?.bg || '#F1F5F9' }]}>
                  <Text style={[styles.currentStatusText, { color: statusColors[driverData?.vehicle_details?.vehicle_status]?.text || '#64748B' }]}>
                    {driverData?.vehicle_details?.vehicle_status}
                  </Text>
                </View>
                
                <Text style={styles.statusChangeLabel}>To:</Text>
                <View style={[styles.newStatusBadge, { backgroundColor: statusColors[selectedStatus?.name]?.bg || '#F1F5F9' }]}>
                  <Text style={[styles.newStatusText, { color: statusColors[selectedStatus?.name]?.text || '#64748B' }]}>
                    {selectedStatus?.name}
                  </Text>
                </View>
              </View>

              <Text style={styles.justificationLabel}>
                Justification <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.justificationInput, isIOS && styles.iosInput]}
                placeholder="Please provide a reason for changing the status..."
                placeholderTextColor="#94A3B8"
                value={justification}
                onChangeText={setJustification}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmStatusChange}
                >
                  <Text style={styles.confirmButtonText}>Confirm Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: 0.5,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    ...Platform.select({
      ios: {
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vehicleLabel: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: 0.5,
  },
  vehicleNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  vehicleStats: {
    alignItems: 'flex-end',
    gap: 5,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    padding: 5,
    borderRadius: 8,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22C55E',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  criticalBatteryText: {
    color: '#DC2626',
  },
  lowBatteryText: {
    color: '#F59E0B',
  },
  goodBatteryText: {
    color: '#22C55E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusButtonActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusButtonDisabled: {
    opacity: 0.5,
  },
  statusButtonText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statusButtonTextActive: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iosButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iosModalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  statusChangeInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    gap: 8,
  },
  statusChangeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  currentStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 5,
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  newStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 5,
  },
  newStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  justificationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  requiredStar: {
    color: '#DC2626',
  },
  justificationInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  iosInput: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  confirmButton: {
    backgroundColor: '#D97706',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default VehicleSection;