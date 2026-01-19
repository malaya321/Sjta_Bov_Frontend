import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform, // Required for OS check
} from 'react-native';
import { 
  MapPin, 
  Map as MapIcon,
  Navigation, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Info
} from 'lucide-react-native';

const ZoneScreen = () => {
  const assignedZone = {
    name: "Grand Road (Bada Danda)",
    type: "Temple / High Traffic", 
    assignedBy: "Supervisor Sharma", 
    restriction: "Restricted Zone (No entry after 8 PM)" 
  };

  const checkpoints = [
    { name: 'Singhadwara (Lion Gate)', status: 'Pickup Point' },
    { name: 'Gundicha Temple', status: 'Drop-off Point' },
    { name: 'Parking Lot A', status: 'Charging Point' }, 
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* On Android, we set translucent to true so we can 
        control the padding manually for a cleaner look.
      */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="white"
        translucent={Platform.OS === 'android'} 
      />
      
      <View style={styles.mainContainer}>
        {/* Driver Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>MY ASSIGNED AREA</Text>
            <Text style={styles.headerTitle}>{assignedZone.name}</Text>
          </View>
          <View style={styles.badge}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.badgeText}>ZONE ACTIVE</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.privacyBanner}>
            <Info size={18} color="#1E293B" />
            <Text style={styles.privacyText}>
              Privacy Note: Your live location is not monitored. GPS is only saved during Check-in and Check-out. 
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ZONE INFORMATION</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MapIcon size={20} color="#D97706" />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoTitle}>Zone Type</Text>
                  <Text style={styles.infoValue}>{assignedZone.type} </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <AlertCircle size={20} color="#DC2626" />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoTitle}>Rules / Restrictions</Text>
                  <Text style={styles.infoValue}>{assignedZone.restriction} </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESIGNATED STOPS</Text>
            {checkpoints.map((point, index) => (
              <View key={index} style={styles.checkpointCard}>
                <View style={styles.checkpointLeft}>
                  <View style={styles.iconCircle}>
                    <Navigation size={16} color="#D97706" />
                  </View>
                  <View>
                    <Text style={styles.pointName}>{point.name}</Text>
                    <Text style={styles.pointStatus}>{point.status}</Text>
                  </View>
                </View>
                <View style={styles.distanceTag}>
                  <Clock size={12} color="#94A3B8" />
                  <Text style={styles.distanceText}>Zone Hub</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.chipNotice}>
            <MapPin size={16} color="#64748B" />
            <Text style={styles.chipNoticeText}>
              Vehicle tracking chip active for geo-fence safety monitoring.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFF',
    // THIS FIXES THE TOP MARGIN ON ANDROID
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    paddingHorizontal: 24,
    paddingVertical: 15,
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2, // Shadow for Android
  },
  headerSubtitle: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#D97706', 
    letterSpacing: 1.5 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1E293B', 
    marginTop: 4 
  },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#DCFCE7', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  badgeText: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#15803D' 
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40 
  },
  privacyBanner: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', 
    padding: 16, 
    borderRadius: 16, 
    gap: 12,
    marginBottom: 24,
    alignItems: 'center'
  },
  privacyText: { 
    flex: 1, 
    fontSize: 12, 
    color: '#475569', 
    lineHeight: 18 
  },
  section: { 
    marginBottom: 24 
  },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#94A3B8', 
    marginBottom: 12, 
    marginLeft: 4 
  },
  infoCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    elevation: 3,
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    paddingVertical: 8 
  },
  infoTextGroup: { 
    flex: 1 
  },
  infoTitle: { 
    fontSize: 11, 
    color: '#94A3B8', 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  infoValue: { 
    fontSize: 14, 
    color: '#1E293B', 
    fontWeight: '600', 
    marginTop: 2 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F1F5F9', 
    marginVertical: 8 
  },
  checkpointCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  checkpointLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  iconCircle: { 
    width: 36, 
    height: 36, 
    backgroundColor: '#FFF7ED', 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  pointName: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  pointStatus: { 
    fontSize: 12, 
    color: '#94A3B8', 
    marginTop: 1 
  },
  distanceTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  distanceText: { 
    fontSize: 11, 
    color: '#94A3B8', 
    fontWeight: '600' 
  },
  chipNotice: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    justifyContent: 'center', 
    marginTop: 10,
    paddingBottom: 20 
  },
  chipNoticeText: { 
    fontSize: 11, 
    color: '#94A3B8', 
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20
  }
});

export default ZoneScreen;