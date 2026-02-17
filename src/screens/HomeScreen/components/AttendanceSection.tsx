import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Power, CheckCircle2, MapPin } from 'lucide-react-native';

type AttendanceSectionProps = {
  isIOS: boolean;
  isSmallDevice: boolean;
  isCheckedIn: boolean;
  isLoggingOut: boolean;
  totalLoading: boolean;
  checkinTime: string | null;
  checkoutTime: string | null;
  onCheckinPress: () => void;
  onCheckoutPress: () => void;
};

const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  isIOS,
  isSmallDevice,
  isCheckedIn,
  isLoggingOut,
  totalLoading,
  checkinTime,
  checkoutTime,
  onCheckinPress,
  onCheckoutPress,
}) => {
  
  const handleButtonPress = () => {
    console.log('Button pressed - isCheckedIn:', isCheckedIn);
    if (isCheckedIn) {
      console.log('Calling onCheckoutPress');
      onCheckoutPress();
    } else {
      console.log('Calling onCheckinPress');
      onCheckinPress();
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shift Attendance</Text>
        <View style={styles.gpsBadge}>
          <MapPin size={isSmallDevice ? 9 : 10} color="#D97706" />
          <Text style={styles.gpsText}>GPS Recorded</Text>
        </View>
      </View>
      <View style={[styles.attendanceCard, isIOS && styles.iosShadow]}>
        <View style={styles.attendanceContent}>
          <View style={styles.attendanceLeft}>
            <View style={[
              styles.attendanceIcon,
              isCheckedIn ? styles.attendanceIconActive : styles.attendanceIconInactive,
              isIOS && styles.iosButton
            ]}>
              {isCheckedIn ? (
                <CheckCircle2 size={isSmallDevice ? 28 : 32} color="#FFFFFF" />
              ) : (
                <Power size={isSmallDevice ? 28 : 32} color="#CBD5E1" />
              )}
            </View>
            <View>
              <Text style={styles.attendanceStatus}>
                {isCheckedIn ? 'Shift Active' : 'Off-Duty'}
              </Text>
              <Text style={styles.attendanceTime}>
                {isCheckedIn 
                  ? `Check-in: ${formatTime(checkinTime)}` 
                  : checkoutTime 
                    ? `Last check-out: ${formatTime(checkoutTime)}`
                    : 'Check-in Required'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              isCheckedIn ? styles.checkOutButton : styles.checkInButtonActive,
              isIOS && styles.iosButton,
              !isCheckedIn && isIOS && styles.iosPrimaryButton,
              (isLoggingOut || totalLoading) && styles.buttonDisabled
            ]}
            onPress={handleButtonPress}
            activeOpacity={0.7}
            disabled={isLoggingOut || totalLoading}
          >
            <Text style={[
              styles.checkInButtonText,
              isCheckedIn && styles.checkOutButtonText
            ]}>
              {isCheckedIn ? 'CHECK OUT' : 'CHECK IN'}
            </Text>
          </TouchableOpacity>
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
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gpsText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  attendanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
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
  attendanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendanceIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceIconActive: {
    backgroundColor: '#22C55E',
  },
  attendanceIconInactive: {
    backgroundColor: '#F1F5F9',
  },
  attendanceStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  attendanceTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  checkInButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkInButtonActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  checkOutButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FEE2E2',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  checkOutButtonText: {
    color: '#DC2626',
  },
  buttonDisabled: {
    opacity: 0.5,
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
  iosPrimaryButton: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default AttendanceSection;