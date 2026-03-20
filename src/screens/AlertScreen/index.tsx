import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { 
  Bell, 
  CalendarClock, 
  AlertTriangle, 
  RotateCcw, 
  Info,
  ChevronRight
} from 'lucide-react-native';
import { useNotification, useUpdateNotificationStatus,useUpdateAllNotificationStatus} from '../../hooks/useNotification';
import { useRefresh } from '../../context/RefreshContext';

const AlertScreen = () => {
  const [notificationScreeenData,setNotificationScreenData]=useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const { tick: refreshTick } = useRefresh();
  
    const { 
      data:notificationScreenAPIData, 
      isLoading, 
      error, 
      refetch,
      isRefetching 
    } = useNotification();
 const updateNotificationStatus = useUpdateNotificationStatus();
 const updateAllNotificationStatus = useUpdateAllNotificationStatus();
     useEffect(() => {
        setNotificationScreenData(notificationScreenAPIData)
      }, [notificationScreenAPIData]);
         useEffect(() => {
        refetch();
      }, [isRefetch]);
         useEffect(() => {
        refetch();
      }, [refreshTick]);

    const onNotificationTouch = (id: any) => {
      const notification:any = notificationScreeenData?.data?.find((item: any) => item.id === id);
      setSelectedNotification(notification);
      setModalVisible(true);
       updateNotificationStatus.mutate(id, {
    onSuccess: () => {
      setIsRefetch(!isRefetch);
    }
  });
    };
    
    const closeModal = () => {
      setModalVisible(false);
      setSelectedNotification(null);
    };

    const onTouchAllNotificationRead = () => {
  updateAllNotificationStatus.mutate(undefined, {
    onSuccess: () => {
      setIsRefetch(prev => !prev);
    }
  });
};
    
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <StatusBar 
        barStyle="dark-content" 
        backgroundColor="white" 
        translucent={true} 
      /> */}
      
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{notificationScreeenData?.data?.filter((item:any) => item?.is_seen === 0).length} New</Text>
            </View>
             <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {onTouchAllNotificationRead()}}
            >
            <View style={styles.AllReadButton}>
              <Text style={styles.unreadText}>Mark All As Read</Text>
            </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Stay updated with your shift and vehicle status</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {notificationScreeenData?.data?.map((item:any) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.alertCard, item.unread && styles.unreadCard]}
              activeOpacity={0.7}
              onPress={() => {onNotificationTouch(item.id)}}
            >
              <View style={[styles.iconContainer, { backgroundColor: (item.notification.type=='assigned')?'#FFF7ED':(item.notification.type=='updated')?'#DBEAFE':(item.notification.type=='reminder')?'#FEE2E2':'#FFF7ED' }]}>
                {item.notification.type=='assigned'?<CalendarClock size={20} color="#D97706" />:item.notification.type=='updated'?<RotateCcw size={20} color="#1D4ED8" />:item.notification.type=='reminder'?<AlertTriangle size={20} color="#DC2626" />:<CalendarClock size={20} color="#D97706" />}
              </View>
              
              <View style={styles.contentContainer}>
                <View style={styles.contentHeader}>
                  <Text style={[styles.alertTitle, item.unread && styles.boldText]}>
                    {item.notification.title}
                  </Text>
                  {!item.is_seen && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.alertDesc} numberOfLines={2}>
                  {item?.notification?.message}
                </Text>
                <Text style={styles.alertTime}>{item.created_at}</Text>
              </View>
              
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}

        
          <View style={styles.footerNotice}>
            <Info size={14} color="#94A3B8" />
            <Text style={styles.footerNoticeText}>
              Notifications are logged automatically in your shift history. 
            </Text>
          </View>
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedNotification && (
              <View style={styles.modalBody}>
                <View style={[styles.modalIconContainer, { backgroundColor: 
                  selectedNotification.notification?.type == 'assigned' ? '#FFF7ED' : 
                  selectedNotification.notification?.type == 'updated' ? '#DBEAFE' : 
                  selectedNotification.notification?.type == 'reminder' ? '#FEE2E2' : '#FFF7ED' 
                }]}>
                  {selectedNotification.notification?.type == 'assigned' ? 
                    <CalendarClock size={30} color="#D97706" /> : 
                    selectedNotification.notification?.type == 'updated' ? 
                    <RotateCcw size={30} color="#1D4ED8" /> : 
                    selectedNotification.notification?.type == 'reminder' ? 
                    <AlertTriangle size={30} color="#DC2626" /> : 
                    <CalendarClock size={30} color="#D97706" />
                  }
                </View>
                
                <Text style={styles.modalNotificationTitle}>
                  {selectedNotification.notification?.title}
                </Text>
                
                <View style={styles.modalDetailItem}>
                  <Text style={styles.modalDetailLabel}>Message:</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedNotification.notification?.message}
                  </Text>
                </View>
                
                <View style={styles.modalDetailItem}>
                  <Text style={styles.modalDetailLabel}>Type:</Text>
                  <View style={styles.modalTypeBadge}>
                    <Text style={styles.modalTypeText}>
                      {selectedNotification.notification?.type || 'N/A'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalDetailItem}>
                  <Text style={styles.modalDetailLabel}>Received:</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedNotification.created_at}
                  </Text>
                </View>
                
                <View style={styles.modalDetailItem}>
                  <Text style={styles.modalDetailLabel}>Status:</Text>
                  <Text style={[styles.modalDetailValue, 
                    !selectedNotification.is_seen && styles.unreadStatus
                  ]}>
                    {!selectedNotification.is_seen ? 'Unread' : 'Read'}
                  </Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFF',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
     paddingTop: Platform.OS === 'android' ? 0 : 0
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
    elevation: 2
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
    AllReadButton: { 
    backgroundColor: '#d90606', 
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
    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'transparent'
  },
  unreadCard: {
    borderColor: '#FFF7ED',
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
  },
  // Added modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalNotificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDetailItem: {
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  modalDetailValue: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 20,
  },
  modalTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  modalTypeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  unreadStatus: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlertScreen;
