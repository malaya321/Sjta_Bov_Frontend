import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Camera, Mail, Shield, User as UserIcon, IdCard, Car, Clock } from 'lucide-react-native';
import { useDriver } from '../../hooks/useDriver';
import { useUpdateProfileImage } from '../../hooks/useProfileImage';
import LinearGradient from 'react-native-linear-gradient';

const PROFILE_PHOTO_KEY = 'profilePhotoUri';

type DetailItem = {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
};

const ProfileScreen = () => {
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: driverData } = useDriver();
  const updateProfileImage = useUpdateProfileImage();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [storedPhoto, storedType, storedUser] = await Promise.all([
          AsyncStorage.getItem(PROFILE_PHOTO_KEY),
          AsyncStorage.getItem('userType'),
          AsyncStorage.getItem('userData'),
        ]);

        setProfilePhotoUri(storedPhoto || driverData?.profile_image || null);
        setUserType(storedType);
        setUserData(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [driverData?.profile_image]);

  const displayName = useMemo(() => {
    return (
      driverData?.driver_details?.driver_name ||
      driverData?.driver_name ||
      userData?.name ||
      'User'
    );
  }, [driverData, userData]);

  const displayRole = useMemo(() => {
    const role = userData?.role_name || userType || 'User';
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }, [userData, userType]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [displayName]);

  const handleSelectPhoto = async () => {
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Photo Update Failed', 'No photo selected.');
        return;
      }

      const formData = new FormData();
      formData.append('profile_image', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `profile_${Date.now()}.jpg`,
      } as any);

      await updateProfileImage.mutateAsync(formData);
      setProfilePhotoUri(asset.uri);
      await AsyncStorage.setItem('profilePhotoUri', asset.uri);
    } catch (error: any) {
      Alert.alert(
        'Photo Update Failed',
        error?.message || 'Unable to update photo. Please try again.'
      );
    }
  };

  const generalDetails: DetailItem[] = [
    { label: 'Name', value: displayName, icon: <UserIcon size={18} color="#9D140C" /> },
    { label: 'Role', value: displayRole, icon: <Shield size={18} color="#D97706" /> },
    { label: 'Email', value: userData?.email, icon: <Mail size={18} color="#2563EB" /> },
    { label: 'User ID', value: userData?.id, icon: <IdCard size={18} color="#0F172A" /> },
  ];

  const driverDetails: DetailItem[] = [
    {
      label: 'Driver ID',
      value: driverData?.driver_details?.driver_userid || driverData?.driver_userid,
      icon: <IdCard size={18} color="#0F172A" />,
    },
    {
      label: 'Shift',
      value: driverData?.shift_details?.shift_name
        ? `${driverData?.shift_details?.shift_name} (${driverData?.shift_details?.start_time} - ${driverData?.shift_details?.end_time})`
        : undefined,
      icon: <Clock size={18} color="#0F172A" />,
    },
    {
      label: 'Vehicle',
      value: driverData?.vehicle_details?.vehicle_number || driverData?.vehicle_details?.vehicle_model,
      icon: <Car size={18} color="#10B981" />,
    },
  ];

  const supervisorDetails: DetailItem[] = [
    { label: 'Supervisor ID', value: userData?.id, icon: <IdCard size={18} color="#0F172A" /> },
    { label: 'Email', value: userData?.email, icon: <Mail size={18} color="#2563EB" /> },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9D140C" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#9D140C', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.photoWrapper}>
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitials}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.photoButton} onPress={handleSelectPhoto}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.roleText}>{displayRole}</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Details</Text>
          {generalDetails.filter(item => item.value).map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <View style={styles.detailIcon}>{item.icon}</View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {displayRole.toLowerCase() === 'driver' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Details</Text>
            {driverDetails.filter(item => item.value).map((item) => (
              <View key={item.label} style={styles.detailRow}>
                <View style={styles.detailIcon}>{item.icon}</View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {displayRole.toLowerCase() === 'supervisor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supervisor Details</Text>
            {supervisorDetails.filter(item => item.value).map((item) => (
              <View key={item.label} style={styles.detailRow}>
                <View style={styles.detailIcon}>{item.icon}</View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  photoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  photoPlaceholder: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#9D140C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roleText: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9D140C',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ProfileScreen;
