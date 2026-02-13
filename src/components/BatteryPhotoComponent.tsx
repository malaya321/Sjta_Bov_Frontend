import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
  Dimensions,
} from 'react-native';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS, check } from 'react-native-permissions';
import { Camera, RefreshCw, Battery, ShieldAlert, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ImageFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
};

type Props = {
  onImageCaptured?: (imageFile: ImageFile) => void;
  onSuccess?: (image: any) => void;
  imageUri?: string | null;
};

const BatteryPhotoComponent: React.FC<Props> = ({ 
  onImageCaptured, 
  onSuccess, 
  imageUri: propImageUri 
}) => {
  const [imageUri, setImageUri] = useState<string | null>(propImageUri || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (propImageUri !== undefined) setImageUri(propImageUri);
  }, [propImageUri]);

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      const status = Platform.OS === 'ios' 
        ? await check(PERMISSIONS.IOS.CAMERA)
        : await check(PERMISSIONS.ANDROID.CAMERA);
      setHasCameraPermission(status === RESULTS.GRANTED);
    } catch (e) {
      setHasCameraPermission(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const result = Platform.OS === 'ios'
        ? await request(PERMISSIONS.IOS.CAMERA)
        : await request(PERMISSIONS.ANDROID.CAMERA);
      
      const isGranted = result === RESULTS.GRANTED;
      setHasCameraPermission(isGranted);

      if (!isGranted) {
        Alert.alert(
          'Camera Required',
          'Please enable camera permissions in your device settings to capture battery photo.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return isGranted;
    } catch (error) {
      return false;
    }
  };

  const captureImage = async () => {
    if (loading) return;

    const granted = hasCameraPermission || await requestCameraPermission();
    if (!granted) return;

    setLoading(true);

    try {
      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back', // Use back camera for battery photo
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        saveToPhotos: false,
      });

      if (result.assets && result.assets[0].uri) {
        const asset = result.assets[0];
        const file: ImageFile = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `battery_${Date.now()}.jpg`,
          size: asset.fileSize,
        };

        setImageUri(asset.uri);
        onImageCaptured?.(file);
        onSuccess?.(file);
      }
    } catch (error) {
      // Alert.alert('Capture Failed', 'An error occurred while opening the camera.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.batteryRing}>
        <View style={styles.innerBatteryRing}>
          <Battery size={48} color="#94A3B8" strokeWidth={1.5} />
        </View>
      </View>
      
      <Text style={styles.stateTitle}>Battery Photo</Text>
      <Text style={styles.stateSubtitle}>Take a photo of your battery or meter reading</Text>

      <TouchableOpacity
        style={styles.primaryAction}
        onPress={captureImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Camera size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Capture Battery Photo</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.helperText}>
        Make sure the battery label and reading are clearly visible
      </Text>
    </View>
  );

  const renderPreviewState = () => (
    <View style={styles.previewWrapper}>
      <View style={styles.imageFrame}>
        <Image source={{ uri: imageUri! }} style={styles.previewImage} />
        <View style={styles.successTag}>
          <CheckCircle2 size={14} color="#FFFFFF" />
          <Text style={styles.successTagText}>Photo Captured</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryAction} onPress={captureImage}>
          <RefreshCw size={16} color="#475569" />
          <Text style={styles.secondaryActionText}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.textAction} 
          onPress={() => setImageUri(null)}
        >
          <Text style={styles.textActionLabel}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPermissionState = () => (
    <View style={styles.permissionDeniedCard}>
      <ShieldAlert size={32} color="#EF4444" />
      <Text style={styles.deniedTitle}>Camera Access Required</Text>
      <Text style={styles.deniedSubtitle}>Enable camera access to capture battery photo</Text>
      <TouchableOpacity style={styles.settingsButton} onPress={requestCameraPermission}>
        <Text style={styles.settingsButtonText}>Enable Camera</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {hasCameraPermission === false ? renderPermissionState() : 
       imageUri ? renderPreviewState() : renderEmptyState()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  batteryRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  innerBatteryRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stateSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryAction: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  previewWrapper: {
    alignItems: 'center',
  },
  imageFrame: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F8FAFC',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  successTag: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  successTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    gap: 6,
  },
  secondaryActionText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  textAction: {
    padding: 8,
  },
  textActionLabel: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  permissionDeniedCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  deniedTitle: {
    color: '#991B1B',
    fontWeight: '700',
    marginTop: 12,
    fontSize: 15,
  },
  deniedSubtitle: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default BatteryPhotoComponent;