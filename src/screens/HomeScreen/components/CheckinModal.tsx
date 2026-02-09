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
} from 'react-native';
import { X, Battery, CheckCircle2, ChevronRight, ChevronLeft, Info, AlertCircle } from 'lucide-react-native';
import FaceDetectionComponent from '../../../components/FaceDetectionComponent';

const { width } = Dimensions.get('window');

type ImageFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
};

type CheckinModalProps = {
  visible: boolean;
  onClose: () => void;
  capturedImageFile: ImageFile | null;
  batteryText: string;
  batteryLevel: number;
  isIOS: boolean;
  isSmallDevice: boolean;
  totalLoading: boolean;
  error: string | null;
  onImageCaptured: (imageFile: ImageFile) => void;
  onBatteryTextChange: (text: string) => void;
  onBatteryLevelChange: (level: number) => void;
  onCheckinSuccess: () => void;
  verifyImage: (formData: FormData) => Promise<any>;
  checkin: (formData: FormData) => Promise<any>;
};

const CheckinModal: React.FC<CheckinModalProps> = ({
  visible,
  onClose,
  capturedImageFile,
  batteryText,
  batteryLevel,
  isIOS,
  onImageCaptured,
  onBatteryTextChange,
  onBatteryLevelChange,
  onCheckinSuccess,
  verifyImage,
  checkin,
  error,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setVerificationResult(null);
    }
  }, [visible]);

  const handleFaceCapture = (imageFile: ImageFile) => {
    onImageCaptured(imageFile);
    setVerificationResult(null); // Reset verification result when new image is captured
  };

  const handleVerifyImage = async () => {
    if (!capturedImageFile) {
      Alert.alert('Missing Photo', 'Please capture your face photo first.');
      return;
    }

    setIsVerifying(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: capturedImageFile.uri,
        type: capturedImageFile.type || 'image/jpeg',
        name: capturedImageFile.name || `checkin_${Date.now()}.jpg`,
      } as any);
      const res = await checkin(formData);
      setVerificationResult({
        success: true,
        message: res.message || 'Identity verified successfully!'
      });
      
      // Auto-advance to next step after a short delay
      setTimeout(() => {
        setCurrentStep(2);
      }, 1500);
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || 'Verification failed. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitCheckin = async () => {
    if (!capturedImageFile) {
      Alert.alert('Missing Photo', 'Please verify your identity first.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: capturedImageFile.uri,
        type: capturedImageFile.type || 'image/jpeg',
        name: capturedImageFile.name || `checkin_${Date.now()}.jpg`,
      } as any);
      
      formData.append('battery_remarks', batteryText);
      formData.append('battery_percentage', batteryLevel.toString());

      const res = await checkin(formData);
      Alert.alert('Success', res.message || 'Check-in completed!', [
        { text: 'Done', onPress: onCheckinSuccess }
      ]);
    } catch (err: any) {
      Alert.alert('Check-in Failed', err.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <Text style={styles.headerTitle}>Daily Check-in</Text>
              <Text style={styles.headerSubtitle}>Step {currentStep} of 2</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(currentStep / 2) * 100}%` }]} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 ? (
              <View style={styles.stepWrapper}>
                <Text style={styles.title}>Face Verification</Text>
                <Text style={styles.description}>
                  Take a clear photo of your face and verify your identity before starting.
                </Text>

                <View style={styles.cameraContainer}>
                  <FaceDetectionComponent 
                    onImageCaptured={handleFaceCapture}
                    imageUri={capturedImageFile?.uri || null}
                  />
                  {verificationResult?.success && (
                    <View style={styles.overlaySuccess}>
                      <CheckCircle2 size={40} color="#22C55E" />
                      <Text style={styles.overlayText}>Verified</Text>
                      <Text style={styles.overlaySubtext}>
                        {verificationResult.message}
                      </Text>
                    </View>
                  )}
                  {verificationResult?.success === false && (
                    <View style={styles.overlayError}>
                      <AlertCircle size={40} color="#DC2626" />
                      <Text style={styles.overlayText}>Verification Failed</Text>
                      <Text style={styles.overlaySubtext}>
                        {verificationResult.message}
                      </Text>
                    </View>
                  )}
                </View>

                {capturedImageFile && !verificationResult?.success && (
                  <TouchableOpacity 
                    style={[
                      styles.verifyButton,
                      isVerifying && styles.buttonDisabled
                    ]}
                    onPress={handleVerifyImage}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.verifyButtonText}>Verify Identity</Text>
                        <CheckCircle2 size={20} color="#FFF" />
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <View style={styles.infoCard}>
                  <Info size={18} color="#0EA5E9" />
                  <Text style={styles.infoText}>
                    Ensure your face is well-lit and remove any sunglasses or hats for verification.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.stepWrapper}>
                <View style={styles.verificationBadge}>
                  <CheckCircle2 size={20} color="#22C55E" />
                  <Text style={styles.verificationBadgeText}>Identity Verified</Text>
                </View>

                <Text style={styles.title}>Vehicle Status</Text>
                <Text style={styles.description}>
                  Select the current battery percentage of your vehicle.
                </Text>

                <View style={styles.batteryGrid}>
                  {[20, 40, 60, 80, 100].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.batteryCard,
                        batteryLevel === level && styles.batteryCardActive
                      ]}
                      onPress={() => onBatteryLevelChange(level)}
                    >
                      <Battery 
                        size={28} 
                        color={batteryLevel === level ? '#FFF' : '#64748B'} 
                      />
                      <Text style={[
                        styles.batteryLevelText,
                        batteryLevel === level && styles.textWhite
                      ]}>{level}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Additional Remarks</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Battery needs charging, vehicle making noise..."
                  placeholderTextColor="#94A3B8"
                  value={batteryText}
                  onChangeText={onBatteryTextChange}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {currentStep === 2 && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setCurrentStep(1)}
              >
                <ChevronLeft size={20} color="#64748B" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (currentStep === 1 || isSubmitting) && styles.buttonDisabled
              ]}
              onPress={currentStep === 1 ? () => {} : handleSubmitCheckin}
              disabled={currentStep === 1 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {currentStep === 1 ? 'Verify to Continue' : 'Complete Check-in'}
                  </Text>
                  {currentStep === 2 && <ChevronRight size={20} color="#FFF" />}
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
  },
  overlaySuccess: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayError: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayText: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },
  overlaySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  verificationBadgeText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  batteryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  batteryCard: {
    width: (width - 72) / 3,
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  batteryCardActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
    elevation: 4,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  batteryLevelText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
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
  textWhite: { color: '#FFF' },
  errorBox: {
    marginTop: 20,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CheckinModal;