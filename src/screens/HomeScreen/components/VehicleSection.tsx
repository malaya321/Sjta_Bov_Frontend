import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Battery,
  BatteryCharging,
  AlertTriangle,
  CheckCircle2,
  Navigation as NavIcon,
  Car,
  Wifi,
} from 'lucide-react-native';

type VehicleSectionProps = {
  isIOS: boolean;
  isSmallDevice: boolean;
  driverData: {
    assignedVehicle: string;
  };
  isCheckedIn: boolean;
  isLoggingOut: boolean;
  totalLoading: boolean;
  vehicleStatus: string;
  batteryLevel: number;
  onStatusChange: (status: string) => void;
};

const VehicleSection: React.FC<VehicleSectionProps> = ({
  isIOS,
  isSmallDevice,
  driverData,
  isCheckedIn,
  isLoggingOut,
  totalLoading,
  vehicleStatus,
  batteryLevel,
  onStatusChange,
}) => {
  const statusColors: any = {
    'Running': { bg: '#DCFCE7', text: '#15803D', icon: '#22C55E' },
    'Charging': { bg: '#FEF3C7', text: '#D97706', icon: '#F59E0B' },
    'Cleaning': { bg: '#DBEAFE', text: '#1D4ED8', icon: '#3B82F6' },
    'Fault': { bg: '#FEE2E2', text: '#DC2626', icon: '#EF4444' },
    'Idle': { bg: '#F1F5F9', text: '#64748B', icon: '#94A3B8' }
  };

  const renderStatusIcon = (status: string, isActive: boolean) => {
    const iconColor = isActive ? statusColors[status]?.icon || '#D97706' : '#94A3B8';
    const iconSize = isSmallDevice ? 16 : 20;

    switch (status) {
      case 'Running':
        return <NavIcon size={iconSize} color={iconColor} />;
      case 'Charging':
        return <BatteryCharging size={iconSize} color={iconColor} />;
      case 'Cleaning':
        return <CheckCircle2 size={iconSize} color={iconColor} />;
      case 'Fault':
        return <AlertTriangle size={iconSize} color={iconColor} />;
      default:
        return <Car size={iconSize} color={iconColor} />;
    }
  };

  return (
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
            <Text style={styles.vehicleNumber}>{driverData.assignedVehicle}</Text>
          </View>
          <View style={styles.vehicleStats}>
            <View style={styles.batteryContainer}>
              <Battery size={isSmallDevice ? 16 : 18} color={batteryLevel < 20 ? '#DC2626' : batteryLevel < 50 ? '#F59E0B' : '#22C55E'} />
              <Text style={[
                styles.batteryText,
                batteryLevel < 20 && styles.lowBatteryText,
                batteryLevel < 50 && batteryLevel >= 20 && styles.mediumBatteryText
              ]}>
                {batteryLevel}%
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: statusColors[vehicleStatus].bg,
              }
            ]}>
              <Text style={[
                styles.statusText,
                { color: statusColors[vehicleStatus].text }
              ]}>
                {vehicleStatus}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusGrid}>
          {['Running', 'Charging', 'Cleaning', 'Fault'].map((status) => (
            <TouchableOpacity
              key={status}
              disabled={!isCheckedIn || isLoggingOut || totalLoading}
              onPress={() => onStatusChange(status)}
              style={[
                styles.statusButton,
                vehicleStatus === status && styles.statusButtonActive,
                !isCheckedIn && styles.statusButtonDisabled,
                isIOS && styles.iosButton
              ]}
              activeOpacity={0.7}
            >
              {renderStatusIcon(status, vehicleStatus === status)}
              <Text style={[
                styles.statusButtonText,
                vehicleStatus === status && styles.statusButtonTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
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
    fontSize: 32,
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
  lowBatteryText: {
    color: '#DC2626',
  },
  mediumBatteryText: {
    color: '#F59E0B',
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
});

export default VehicleSection;