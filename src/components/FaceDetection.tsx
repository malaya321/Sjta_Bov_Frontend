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
} from 'react-native';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import FaceDetection, { Face } from '@react-native-ml-kit/face-detection';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

type Props = {
  onSuccess?: (image: any) => void;
};

const FaceDetectionComponent: React.FC<Props> = ({ onSuccess }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [facesCount, setFacesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);

  // Request camera permission
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        // For Android
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera for face verification.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
          setHasCameraPermission(true);
          return true;
        } else {
          console.log('Camera permission denied');
          Alert.alert(
            'Permission Required',
            'Camera permission is required to use face verification. Please enable it in settings.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return false;
        }
      } else {
        // For iOS
        const result = await request(PERMISSIONS.IOS.CAMERA);
        
        if (result === RESULTS.GRANTED) {
          console.log('Camera permission granted');
          setHasCameraPermission(true);
          return true;
        } else {
          console.log('Camera permission denied');
          Alert.alert(
            'Permission Required',
            'Camera permission is required to use face verification. Please enable it in settings.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return false;
        }
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  // Check permission on component mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        setHasCameraPermission(granted);
      } else {
        // For iOS, we'll assume permission needs to be requested
        setHasCameraPermission(false);
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const captureAndDetect = async () => {
    if (loading) return;

    // Check and request permission if needed
    if (!hasCameraPermission) {
      const permissionGranted = await requestCameraPermission();
      if (!permissionGranted) {
        return;
      }
    }

    setLoading(true);

    try {
      // Camera options
      const options = {
        mediaType: 'photo' as const,
        cameraType: 'front' as const,
        quality: 0.8,
        saveToPhotos: false,
        includeBase64: false,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      const result: ImagePickerResponse = await launchCamera(options);

      if (result.didCancel) {
        console.log('User cancelled camera');
        setLoading(false);
        return;
      }

      if (result.errorCode) {
        console.error('Camera error:', result.errorMessage);
        Alert.alert(
          'Camera Error',
          result.errorMessage || 'Unable to access camera. Please try again.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const image = result.assets?.[0];
      if (!image?.uri) {
        Alert.alert('Error', 'Image capture failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Image captured:', image.uri);
      setImageUri(image.uri);

      // Face detection with timeout
      try {
        const faces: Face[] = await Promise.race([
          FaceDetection.detect(image.uri, {
            performanceMode: 'accurate',
            landmarkMode: 'all',
            classificationMode: 'all',
            minFaceSize: 0.15,
          }),
          new Promise<Face[]>((_, reject) =>
            setTimeout(() => reject(new Error('Face detection timeout')), 10000)
          ),
        ]);

        console.log('Faces detected:', faces.length);
        setFacesCount(faces.length);

        if (faces.length === 1) {
          Alert.alert(
            'Success',
            'Face detected successfully!',
            [
              {
                text: 'Continue',
                onPress: () => {
                  onSuccess?.(image);
                },
              },
            ],
            { cancelable: false }
          );
        } else if (faces.length === 0) {
          Alert.alert(
            'No Face Detected',
            'Please keep your face clearly visible within the frame.',
            [
              {
                text: 'Retry',
                onPress: () => {
                  setImageUri(null);
                  setFacesCount(0);
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert(
            'Multiple Faces Detected',
            'Only one person is allowed in the frame. Please ensure you are alone.',
            [
              {
                text: 'Retry',
                onPress: () => {
                  setImageUri(null);
                  setFacesCount(0);
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        }
      } catch (detectionError) {
        console.error('Face detection error:', detectionError);
        Alert.alert(
          'Face Detection Failed',
          'Unable to process face detection. Please try again.',
          [
            {
              text: 'Retry',
              onPress: () => {
                setImageUri(null);
                setFacesCount(0);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Capture error:', error);
      Alert.alert(
        'Error',
        error?.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!hasCameraPermission ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required for face verification
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabled]}
            onPress={captureAndDetect}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.buttonText}>Capture Face</Text>
                <Text style={styles.buttonSubtext}>For verification</Text>
              </>
            )}
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <Text
                style={[
                  styles.info,
                  facesCount === 1
                    ? styles.successText
                    : facesCount === 0
                    ? styles.errorText
                    : styles.warningText,
                ]}
              >
                {facesCount === 1
                  ? '✓ Face detected successfully'
                  : facesCount === 0
                  ? '✗ No face detected'
                  : '⚠ Multiple faces detected'}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    width: '100%',
  },
  permissionText: {
    color: '#D97706',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#D97706',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonSubtext: {
    color: '#FFFBEB',
    fontSize: 12,
    marginTop: 2,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  info: {
    marginTop: 8,
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#22C55E',
  },
  errorText: {
    color: '#DC2626',
  },
  warningText: {
    color: '#F59E0B',
  },
});

export default FaceDetectionComponent;