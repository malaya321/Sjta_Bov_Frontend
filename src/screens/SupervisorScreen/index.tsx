import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Users, Car, Send, LogOut, ChevronRight, MessageSquare, ClipboardCheck } from 'lucide-react-native';
import { useLogout } from '../../hooks/useAuth';

const SupervisorScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [selectedBov, setSelectedBov] = useState('');
  const [message, setMessage] = useState('');
    // Use the logout mutation hook
    const logoutMutation = useLogout();

  const drivers = [
    { id: 'D-1024', name: 'SV Rajesh Kumar', status: 'Available' },
    { id: 'D-1025', name: 'Suresh Mohanty', status: 'In Shift' },
    { id: 'D-1026', name: 'Amit Singh', status: 'Available' },
  ];
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Logout cancelled')
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // If user is checked in, prompt for check-out first
              // if (isCheckedIn) {
              //   Alert.alert(
              //     'Check Out Required',
              //     'Please check out from your shift before logging out.',
              //     [{ text: 'OK' }]
              //   );
              //   return;
              // }

              // Trigger logout mutation
              await logoutMutation.mutateAsync();
              
              // Call the parent logout function after successful logout
              onLogout();
              
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
  const bovs = ['BOV-401', 'BOV-402', 'BOV-403', 'BOV-404', 'BOV-405'];

  const handleAssign = () => {
    if (!selectedDriver || !selectedBov) {
      Alert.alert('Missing Info', 'Please select both a driver and a vehicle.');
      return;
    }
    Alert.alert('Success', `Task assigned to ${selectedDriver.name} with ${selectedBov}`);
    setMessage('');
    setSelectedDriver(null);
    setSelectedBov('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>SJTA ADMIN PANEL</Text>
          <Text style={styles.headerTitle}>Roster Management</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={()=>{handleLogout()}}>
          <LogOut size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Driver Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Driver</Text>
          <View style={styles.card}>
            {drivers.map((driver) => (
              <TouchableOpacity 
                key={driver.id} 
                style={[styles.itemRow, selectedDriver?.id === driver.id && styles.selectedRow]}
                onPress={() => setSelectedDriver(driver)}
              >
                <View style={styles.rowInfo}>
                  <Users size={20} color={selectedDriver?.id === driver.id ? "#D97706" : "#94A3B8"} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.itemName}>{driver.name}</Text>
                    <Text style={styles.itemSub}>{driver.id} • {driver.status}</Text>
                  </View>
                </View>
                {selectedDriver?.id === driver.id && <ChevronRight size={20} color="#D97706" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BOV Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Assign Vehicle (BOV)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {bovs.map((bov) => (
              <TouchableOpacity 
                key={bov} 
                style={[styles.bovChip, selectedBov === bov && styles.selectedBovChip]}
                onPress={() => setSelectedBov(bov)}
              >
                <Car size={18} color={selectedBov === bov ? "#FFF" : "#64748B"} />
                <Text style={[styles.bovText, selectedBov === bov && styles.selectedBovText]}>{bov}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messaging Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Instruction Message</Text>
          <View style={styles.messageBox}>
            <TextInput
              style={styles.input}
              placeholder="Send instruction to driver..."
              multiline
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.sendIcon} onPress={handleAssign}>
              <Send size={20} color="#D97706" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.mainActionBtn} onPress={handleAssign}>
          <ClipboardCheck size={20} color="#FFF" />
          <Text style={styles.mainActionText}>CONFIRM ASSIGNMENT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',paddingTop:50 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 10, fontWeight: 'bold', color: '#D97706' },
  logoutBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', elevation: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  selectedRow: { backgroundColor: '#FFFBEB' },
  rowInfo: { flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#94A3B8' },
  horizontalScroll: { flexDirection: 'row' },
  bovChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedBovChip: { backgroundColor: '#D97706', borderColor: '#D97706' },
  bovText: { fontWeight: 'bold', color: '#64748B' },
  selectedBovText: { color: '#FFF' },
  messageBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, elevation: 2 },
  input: { flex: 1, paddingVertical: 15, fontSize: 14, color: '#1E293B' },
  sendIcon: { padding: 10 },
  mainActionBtn: { backgroundColor: '#1E293B', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16, gap: 12, marginTop: 10 },
  mainActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});

export default SupervisorScreen;