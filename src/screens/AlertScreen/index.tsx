import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform, // Added for OS-specific logic
} from 'react-native';
import { 
  Bell, 
  CalendarClock, 
  AlertTriangle, 
  RotateCcw, 
  Info,
  ChevronRight
} from 'lucide-react-native';

const AlertScreen = () => {
  const notifications = [
    {
      id: '1',
      type: 'SHIFT_ASSIGN',
      title: 'New Shift Assigned',
      desc: 'You have been assigned to Shift A (08:30 AM - 04:30 PM) for tomorrow.',
      time: '10 mins ago',
      unread: true,
      icon: <CalendarClock size={20} color="#D97706" />,
      bg: '#FFF7ED'
    },
    {
      id: '2',
      type: 'ROSTER_CHANGE',
      title: 'Roster Updated',
      desc: 'Supervisor Sharma updated your vehicle to BOV-405 for the current shift.',
      time: '1 hour ago',
      unread: true,
      icon: <RotateCcw size={20} color="#1D4ED8" />,
      bg: '#DBEAFE'
    },
    {
      id: '3',
      type: 'ATTENDANCE_REMINDER',
      title: 'Check-out Reminder',
      desc: 'Your shift ends in 15 minutes. Please remember to capture the battery photo.',
      time: '2 hours ago',
      unread: false,
      icon: <AlertTriangle size={20} color="#DC2626" />,
      bg: '#FEE2E2'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* On Android, white status bar with dark icons looks best */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="white" 
        translucent={true} 
      />
      
      <View style={styles.mainContainer}>
        {/* Header with Android-specific Padding */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>2 New</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Stay updated with your shift and vehicle status</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.alertCard, item.unread && styles.unreadCard]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                {item.icon}
              </View>
              
              <View style={styles.contentContainer}>
                <View style={styles.contentHeader}>
                  <Text style={[styles.alertTitle, item.unread && styles.boldText]}>
                    {item.title}
                  </Text>
                  {item.unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.alertDesc} numberOfLines={2}>
                  {item.desc}
                </Text>
                <Text style={styles.alertTime}>{item.time}</Text>
              </View>
              
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}

          {/* System Info Notice */}
          <View style={styles.footerNotice}>
            <Info size={14} color="#94A3B8" />
            <Text style={styles.footerNoticeText}>
              Notifications are logged automatically in your shift history. 
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Fixes the Android overlap
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    paddingHorizontal: 24,
    paddingVertical: 20, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9',
    elevation: 2 // Adds shadow for Android
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 4 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  headerSubtitle: { 
    fontSize: 13, 
    color: '#64748B' 
  },
  unreadBadge: { 
    backgroundColor: '#D97706', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6 
  },
  unreadText: { 
    color: '#FFF', 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  scrollContent: { 
    padding: 16,
    paddingBottom: 30 
  },
  alertCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12,
    // Android Elevation
    elevation: 3,
    // iOS Shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'transparent'
  },
  unreadCard: {
    borderColor: '#FFF7ED', // Subtle border for unread
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  contentContainer: { 
    flex: 1, 
    marginRight: 8 
  },
  contentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  alertTitle: { 
    fontSize: 15, 
    color: '#1E293B' 
  },
  boldText: { 
    fontWeight: 'bold' 
  },
  unreadDot: { 
    width: 8, 
    height: 8, 
    backgroundColor: '#D97706', 
    borderRadius: 4 
  },
  alertDesc: { 
    fontSize: 13, 
    color: '#64748B', 
    lineHeight: 18, 
    marginBottom: 6 
  },
  alertTime: { 
    fontSize: 11, 
    color: '#94A3B8', 
    fontWeight: '500' 
  },
  footerNotice: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    justifyContent: 'center', 
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  footerNoticeText: { 
    fontSize: 11, 
    color: '#94A3B8', 
    textAlign: 'center' 
  }
});

export default AlertScreen;