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
import { Camera, RefreshCw, UserCheck, ShieldAlert, Sparkles } from 'lucide-react-native';

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

const FaceDetectionComponent: React.FC<Props> = ({ 
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
          'Please enable camera permissions in your device settings to proceed with check-in.',
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
        cameraType: 'front',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        saveToPhotos: false,
      });

      if (result.assets && result.assets[0].uri) {
        const asset = result.assets[0];
        const file: ImageFile = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `face_${Date.now()}.jpg`,
          size: asset.fileSize,
        };

        setImageUri(asset.uri);
        onImageCaptured?.(file);
        onSuccess?.(file);
      }
    } catch (error) {
      Alert.alert('Capture Failed', 'An error occurred while opening the camera.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.biometricRing}>
        <View style={styles.innerBiometricRing}>
          <Camera size={48} color="#94A3B8" strokeWidth={1.5} />
        </View>
      </View>
      
      <Text style={styles.stateTitle}>Front-Face Photo</Text>
      <Text style={styles.stateSubtitle}>Required for biometric attendance</Text>

      <TouchableOpacity
        style={styles.primaryAction}
        onPress={captureImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Start Verification</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPreviewState = () => (
    <View style={styles.previewWrapper}>
      <View style={styles.imageFrame}>
        <Image source={{ uri: imageUri! }} style={styles.previewImage} />
        <View style={styles.successTag}>
          <UserCheck size={14} color="#FFFFFF" />
          <Text style={styles.successTagText}>Ready</Text>
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
      <Text style={styles.deniedTitle}>Camera Access Disabled</Text>
      <TouchableOpacity onPress={requestCameraPermission}>
        <Text style={styles.linkText}>Enable in Settings</Text>
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
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  biometricRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  innerBiometricRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stateSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  primaryAction: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
    width: '100%',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewWrapper: {
    alignItems: 'center',
  },
  imageFrame: {
    width: 160,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#F8FAFC',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
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
    backgroundColor: '#10B981',
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    gap: 8,
  },
  secondaryActionText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  textAction: {
    padding: 10,
  },
  textActionLabel: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  permissionDeniedCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
  },
  deniedTitle: {
    color: '#991B1B',
    fontWeight: '700',
    marginTop: 12,
    fontSize: 15,
  },
  linkText: {
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});

export default FaceDetectionComponent;