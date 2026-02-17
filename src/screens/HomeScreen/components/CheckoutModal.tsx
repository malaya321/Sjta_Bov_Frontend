import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Image,
  Linking,
} from 'react-native';
import { X, Battery, CheckCircle2, ChevronRight, ChevronLeft, Info, AlertCircle, MapPin } from 'lucide-react-native';
import Geolocation from '@react-native-community/geolocation';
import FaceDetectionComponent from '../../../components/FaceDetectionComponent';
import BatteryPhotoComponent from '../../../components/BatteryPhotoComponent';

const { width } = Dimensions.get('window');

type ImageFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
};

type LocationType = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

type CheckoutModalProps = {
  visible: boolean;
  onClose: () => void;
  capturedImageFile: ImageFile | null;
  batteryText: string;
  batteryLevel: number;
  checkinTime: string | null;
  isIOS: boolean;
  isSmallDevice: boolean;
  totalLoading: boolean;
  error: string | null;
  onImageCaptured: (imageFile: ImageFile) => void;
  onBatteryImageCaptured: (imageFile: ImageFile) => void;
  onBatteryTextChange: (text: string) => void;
  onBatteryLevelChange: (level: number) => void;
  onCheckoutSuccess: (data?: any) => void;
  checkout: (formData: FormData) => Promise<any>;
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  onClose,
  capturedImageFile,
  batteryText,
  batteryLevel,
  checkinTime,
  isIOS,
  isSmallDevice,
  totalLoading,
  error,
  onImageCaptured,
  onBatteryImageCaptured,
  onBatteryTextChange,
  onBatteryLevelChange,
  onCheckoutSuccess,
  checkout,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [location, setLocation] = useState<LocationType>({
    latitude: null,
    longitude: null,
    accuracy: null
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [batteryPhoto, setBatteryPhoto] = useState<ImageFile | null>(null);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        return true;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for checkout.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasLocationPermission(true);
          return true;
        } else {
          setHasLocationPermission(false);
          return false;
        }
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      setHasLocationPermission(false);
      return false;
    }
  };

  // Check location permission
  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasLocationPermission(granted);
        return granted;
      } else {
        setHasLocationPermission(false);
        return false;
      }
    } catch (err) {
      console.warn('Permission check error:', err);
      setHasLocationPermission(false);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<LocationType> => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    return new Promise((resolve, reject) => {
      requestLocationPermission().then(hasPermission => {
        if (!hasPermission) {
          const error = new Error('Location permission denied. Please enable location services.');
          setIsGettingLocation(false);
          setLocationError(error.message);
          reject(error);
          return;
        }

        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
          locationProvider: 'auto',
        });

        let attempts = 0;
        const maxAttempts = 2;
        
        const tryGetLocation = (useHighAccuracy: boolean) => {
          attempts++;
          
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              const newLocation = {
                latitude,
                longitude,
                accuracy
              };
              setLocation(newLocation);
              setIsGettingLocation(false);
              setHasLocationPermission(true);
              resolve(newLocation);
            },
            (error) => {
              setIsGettingLocation(false);
              
              if (useHighAccuracy && attempts < maxAttempts) {
                console.log('High accuracy failed, trying low accuracy...');
                tryGetLocation(false);
                return;
              }
              
              let errorMessage = 'Failed to get location';
              
              if (error.code === 1) {
                errorMessage = 'Location permission denied. Please enable location services in settings.';
                setHasLocationPermission(false);
              } else if (error.code === 2) {
                errorMessage = 'Location information unavailable. Please check your GPS or network connection.';
              } else if (error.code === 3) {
                errorMessage = 'Location request timed out. Please go to an open area with clear sky view and try again.';
              } else {
                errorMessage = error.message || 'Failed to get location';
              }
              
              setLocationError(errorMessage);
              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: useHighAccuracy,
              timeout: useHighAccuracy ? 10000 : 15000,
              maximumAge: useHighAccuracy ? 0 : 60000,
              distanceFilter: useHighAccuracy ? 0 : 10,
            }
          );
        };
        
        tryGetLocation(true);
        
      }).catch(err => {
        setIsGettingLocation(false);
        const error = new Error('Failed to request location permission.');
        setLocationError(error.message);
        reject(error);
      });
    });
  };

  // Handle battery photo capture
  const handleBatteryPhotoCaptured = (imageFile: ImageFile) => {
    setBatteryPhoto(imageFile);
    onBatteryImageCaptured(imageFile);
  };

  // Remove battery photo
  const handleRemoveBatteryPhoto = () => {
    setBatteryPhoto(null);
  };

  // Check permission when modal opens
  useEffect(() => {
    if (visible) {
      checkLocationPermission();
    }
  }, [visible]);

  // Reset states when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setVerificationResult(null);
      setLocation({ latitude: null, longitude: null, accuracy: null });
      setLocationError(null);
      setIsGettingLocation(false);
      setBatteryPhoto(null);
    }
  }, [visible]);

  const handleFaceCapture = (imageFile: ImageFile) => {
    onImageCaptured(imageFile);
    setVerificationResult(null);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && capturedImageFile) {
      setCurrentStep(2);
    } else if (currentStep === 2 && batteryPhoto) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleVerifyAndSubmit = async () => {
    if (!capturedImageFile) {
      Alert.alert('Missing Photo', 'Please capture your face photo first.');
      setCurrentStep(1);
      return;
    }

    if (!batteryPhoto) {
      Alert.alert('Missing Battery Photo', 'Please capture battery photo.');
      setCurrentStep(2);
      return;
    }

    if (!checkinTime) {
      Alert.alert('Error', 'Check-in time not found. Please check-in first.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      // Get location first
      let locationData = location;
      if (!location.latitude || !location.longitude) {
        try {
          locationData = await getCurrentLocation();
        } catch (locationErr: any) {
          const shouldContinue = await new Promise((resolve) => {
            Alert.alert(
              'Location Error',
              `Failed to get location: ${locationErr.message}. Do you want to submit without location?`,
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Submit Anyway', onPress: () => resolve(true) }
              ]
            );
          });
          
          if (!shouldContinue) {
            setIsVerifying(false);
            return;
          }
        }
      }

      // Create FormData with all checkout data
      const checkoutFormData = new FormData();
      
      // Add face image
      checkoutFormData.append('image', {
        uri: capturedImageFile.uri,
        type: capturedImageFile.type || 'image/jpeg',
        name: capturedImageFile.name || `checkout_face_${Date.now()}.jpg`,
      } as any);
      
      // Add check-in time
      checkoutFormData.append('check_in', checkinTime);
      
      // Add battery photo
      if (batteryPhoto) {
        checkoutFormData.append('check_out_battery_percentage', {
          uri: batteryPhoto.uri,
          type: batteryPhoto.type || 'image/jpeg',
          name: batteryPhoto.name || `checkout_battery_${Date.now()}.jpg`,
        } as any);
      }
      
      // Add battery status text
      checkoutFormData.append('check_out_battery_status', batteryText || 'No remarks');
      
      // Add location if available
      if (locationData.latitude && locationData.longitude) {
        checkoutFormData.append('longitude', locationData.longitude.toString());
        checkoutFormData.append('latitude', locationData.latitude.toString());
      }

      // Log FormData contents for debugging
      console.log('Checkout FormData contents:');
      // @ts-ignore
      if (checkoutFormData._parts) {
        // @ts-ignore
        checkoutFormData._parts.forEach((part: any) => {
          console.log(`Field: ${part[0]}`, part[1]?.uri ? '[Image File]' : part[1]);
        });
      }

      // Single API call for checkout
      const checkoutResult = await checkout(checkoutFormData);
      console.log('Checkout result:', checkoutResult);
      
      setVerificationResult({
        success: true,
        message: 'Check-out completed successfully!'
      });
      
      // Show success and close after delay
      setTimeout(() => {
        Alert.alert('Success', checkoutResult.message || 'Check-out completed!', [
          { text: 'Done', onPress: () => onCheckoutSuccess(checkoutResult) }
        ]);
      }, 500);
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      let errorMessage = err.message || 'Check-out failed. Please try again.';
      
      if (err.message?.toLowerCase().includes('face') || 
          err.message?.toLowerCase().includes('verification') || 
          err.message?.toLowerCase().includes('identity')) {
        errorMessage = 'Identity verification failed. Please take a clear face photo and try again.';
      } else if (err.message?.toLowerCase().includes('location')) {
        errorMessage = 'Location is required for check-out. Please enable location services.';
      }
      
      setVerificationResult({
        success: false,
        message: errorMessage
      });
      
      Alert.alert('Check-out Failed', errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  // Render location status
  const renderLocationStatus = () => {
    if (!hasLocationPermission && Platform.OS === 'android') {
      return (
        <View style={styles.permissionDeniedCard}>
          <AlertCircle size={24} color="#DC2626" />
          <View style={styles.permissionDeniedTextContainer}>
            <Text style={styles.permissionDeniedTitle}>
              Location Access Required
            </Text>
            <Text style={styles.permissionDeniedDescription}>
              Tap the button below to enable location permissions.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isGettingLocation) {
      return (
        <View style={styles.locationLoading}>
          <ActivityIndicator size="small" color="#64748B" />
          <Text style={styles.locationLoadingText}>
            Fetching your location...
          </Text>
        </View>
      );
    }

    if (locationError) {
      return (
        <View style={styles.locationErrorContainer}>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={styles.locationErrorText}>{locationError}</Text>
          <View style={styles.locationActionButtons}>
            <TouchableOpacity 
              style={styles.smallButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.smallButtonText}>Retry GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (location.latitude && location.longitude) {
      return (
        <View style={styles.locationCoordinates}>
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>Latitude:</Text>
            <Text style={styles.coordinateValue}>{location.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>Longitude:</Text>
            <Text style={styles.coordinateValue}>{location.longitude.toFixed(6)}</Text>
          </View>
          {location.accuracy && (
            <Text style={styles.accuracyText}>
              Accuracy: ±{Math.round(location.accuracy)} meters
            </Text>
          )}
          <TouchableOpacity 
            style={[styles.smallButton, { marginTop: 8, alignSelf: 'flex-start' }]}
            onPress={getCurrentLocation}
          >
            <Text style={styles.smallButtonText}>Refresh Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.locationPrompt}>
        <Text style={styles.locationPromptText}>
          Location will be fetched when you submit your check-out.
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <X size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Daily Check-out</Text>
              <Text style={styles.headerSubtitle}>Step {currentStep} of 3</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 ? (
              <View style={styles.stepWrapper}>
                <Text style={styles.title}>Take Photo</Text>
                <Text style={styles.description}>
                  Take a clear photo of your face for identity verification before check-out.
                </Text>

                <View style={styles.cameraContainer}>
                  <FaceDetectionComponent
                    onImageCaptured={handleFaceCapture}
                    imageUri={capturedImageFile?.uri || null}
                  />
                </View>

                <View style={styles.infoCard}>
                  <Info size={18} color="#0EA5E9" />
                  <Text style={styles.infoText}>
                    Ensure your face is well-lit and remove any sunglasses or hats.
                  </Text>
                </View>
              </View>
            ) : currentStep === 2 ? (
              <View style={styles.stepWrapper}>
                <Text style={styles.title}>Battery Photo</Text>
                <Text style={styles.description}>
                  Take a photo of your battery or meter reading for check-out.
                </Text>

                <View style={styles.batteryPhotoSection}>
                  {batteryPhoto ? (
                    <View style={styles.batteryPhotoPreviewContainer}>
                      <Image 
                        source={{ uri: batteryPhoto.uri }}
                        style={styles.batteryPhotoPreview}
                      />
                      <TouchableOpacity 
                        style={styles.removePhotoButton}
                        onPress={handleRemoveBatteryPhoto}
                      >
                        <X size={20} color="#DC2626" />
                      </TouchableOpacity>
                      <View style={styles.photoSuccessBadge}>
                        <CheckCircle2 size={16} color="#22C55E" />
                        <Text style={styles.photoSuccessText}>Photo captured</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.batteryCameraContainer}>
                      <BatteryPhotoComponent
                        onImageCaptured={handleBatteryPhotoCaptured}
                        imageUri={null}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.stepWrapper}>
                <Text style={styles.title}>Review & Submit</Text>
                <Text style={styles.description}>
                  Verify your information and submit your check-out.
                </Text>

                {/* Face Photo Review */}
                <View style={styles.reviewCard}>
                  <Text style={styles.reviewCardTitle}>Face Photo</Text>
                  {capturedImageFile ? (
                    <Image 
                      source={{ uri: capturedImageFile.uri }}
                      style={styles.reviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.reviewMissing}>No photo taken</Text>
                  )}
                </View>

                {/* Battery Photo Review */}
                {batteryPhoto && (
                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardTitle}>Battery Photo</Text>
                    <Image 
                      source={{ uri: batteryPhoto.uri }}
                      style={styles.reviewBatteryImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Battery Status Review */}
                <View style={styles.reviewCard}>
                  <Text style={styles.reviewCardTitle}>Battery Status</Text>
                  <View style={styles.reviewRow}>
                    <Battery size={20} color="#64748B" />
                    <Text style={styles.reviewValue}>{batteryText || 'No remarks'}</Text>
                  </View>
                </View>

                {/* Check-in Time Review */}
                <View style={styles.reviewCard}>
                  <Text style={styles.reviewCardTitle}>Check-in Time</Text>
                  <Text style={styles.reviewValue}>
                    {checkinTime ? new Date(checkinTime).toLocaleString() : 'Not available'}
                  </Text>
                </View>

                {/* Location Status */}
                <View style={styles.reviewCard}>
                  <View style={styles.locationHeader}>
                    <MapPin size={20} color="#64748B" />
                    <Text style={styles.locationTitle}>Current Location</Text>
                  </View>
                  {renderLocationStatus()}
                </View>

                {/* Verification Status */}
                {verificationResult && (
                  <View style={[
                    styles.verificationResult,
                    verificationResult.success ? styles.successCard : styles.errorCard
                  ]}>
                    {verificationResult.success ? (
                      <CheckCircle2 size={24} color="#22C55E" />
                    ) : (
                      <AlertCircle size={24} color="#DC2626" />
                    )}
                    <Text style={styles.verificationResultText}>
                      {verificationResult.message}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handlePreviousStep}
              >
                <ChevronLeft size={20} color="#64748B" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (currentStep === 1 && !capturedImageFile) && styles.buttonDisabled,
                (currentStep === 2 && !batteryPhoto) && styles.buttonDisabled
              ]}
              onPress={currentStep === 3 ? handleVerifyAndSubmit : handleNextStep}
              disabled={
                (currentStep === 1 && !capturedImageFile) ||
                (currentStep === 2 && !batteryPhoto) ||
                (currentStep === 3 && isVerifying)
              }
            >
              {currentStep === 3 && isVerifying ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {currentStep === 3 ? 'Verify & Submit' : 'Continue'}
                  </Text>
                  {currentStep < 3 && <ChevronRight size={20} color="#FFF" />}
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  closeIcon: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D97706',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  stepWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 32,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#D97706',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    gap: 4,
  },
  backButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  textWhite: { 
    color: '#FFF' 
  },
  errorBox: {
    marginTop: 20,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  reviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  reviewMissing: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewValue: {
    fontSize: 16,
    color: '#1E293B',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  locationPrompt: {
    paddingVertical: 8,
  },
  locationPromptText: {
    color: '#64748B',
    fontSize: 14,
  },
  locationCoordinates: {
    marginTop: 4,
  },
  coordinateRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#64748B',
    width: 80,
  },
  coordinateValue: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  accuracyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  locationLoadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  locationErrorContainer: {
    paddingVertical: 8,
  },
  locationErrorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  locationActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 16,
  },
  successCard: {
    backgroundColor: '#F0FDF4',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
  },
  verificationResultText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  permissionDeniedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  permissionDeniedTextContainer: {
    flex: 1,
  },
  permissionDeniedTitle: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  permissionDeniedDescription: {
    color: '#DC2626',
    fontSize: 12,
    opacity: 0.8,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  batteryPhotoSection: {
    marginBottom: 24,
  },
  batteryCameraContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  batteryPhotoPreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  batteryPhotoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoSuccessBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoSuccessText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  reviewBatteryImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 8,
  },
});

export default CheckoutModal;