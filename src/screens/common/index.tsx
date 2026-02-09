import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import FaceDetectionComponent from '../../components/FaceDetectionComponent';
import { useCheckin } from '../../hooks/useCheckin';

// Define the image file type
type ImageFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
};

const CheckinScreen = () => {
  const { checkin, isLoading, error, resetError } = useCheckin();
  const [capturedImageFile, setCapturedImageFile] = useState<ImageFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageCaptured = (imageFile: ImageFile) => {
    console.log('Image captured:', {
      uri: imageFile.uri?.substring(0, 50) + '...',
      type: imageFile.type,
      name: imageFile.name,
      size: imageFile.size,
    });
    resetError();
    setCapturedImageFile(imageFile);
  };

  const handleCheckin = async () => {
    if (!capturedImageFile) {
      Alert.alert('Error', 'Please capture face image before checking in.');
      return;
    }

    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      
      // ✅ CHANGE: Append with field name 'image' (not 'face_image')
      formData.append('image', {
        uri: capturedImageFile.uri,
        type: capturedImageFile.type || 'image/jpeg',
        name: capturedImageFile.name || `image_${Date.now()}.jpg`,
      } as any);
      
      console.log('Sending FormData to checkin API...');
      console.log('Field name: "image"');
      console.log('File name:', capturedImageFile.name);
      
      // Call the checkin hook with formData
      const res = await checkin(formData);
      
      Alert.alert('Success', res.message || 'Check-in successful!');
      
      // Reset after successful check-in
      setCapturedImageFile(null);
      
    } catch (err: any) {
      console.error('Checkin error:', err);
      Alert.alert(
        'Check-in Failed', 
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = () => {
    setCapturedImageFile(null);
    resetError();
  };

  const totalLoading = isLoading || uploading;

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Face Verification Check-in</Text>
        <Text style={styles.subtitle}>
          Please capture a clear image of your face for verification
        </Text>

        <FaceDetectionComponent
          onImageCaptured={handleImageCaptured}
          imageUri={null}
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={resetError} style={styles.dismissButton}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkinBtn,
            (!capturedImageFile || totalLoading) && styles.checkinBtnDisabled
          ]}
          onPress={handleCheckin}
          disabled={!capturedImageFile || totalLoading}
        >
          {totalLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkinText}>
              {capturedImageFile ? 'Check In' : 'Capture Image First'}
            </Text>
          )}
        </TouchableOpacity>

        {capturedImageFile && (
          <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.statusTitle}>Image Ready</Text>
            </View>
            <Text style={styles.statusText}>
              {capturedImageFile.name || 'Face image captured'}
            </Text>
            {capturedImageFile.size && (
              <Text style={styles.fileSizeText}>
                Size: {(capturedImageFile.size / 1024).toFixed(2)} KB
              </Text>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearImage}
                disabled={totalLoading}
              >
                <Text style={styles.clearButtonText}>Clear Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setCapturedImageFile(null)}
                disabled={totalLoading}
              >
                <Text style={styles.retryButtonText}>Retry Capture</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {totalLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              {uploading ? 'Uploading image...' : 'Processing...'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'flex-start',
    paddingTop: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: 20,
  },
  checkinBtn: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  checkinBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  checkinText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 8,
  },
  dismissButton: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  dismissButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statusContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  successIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTitle: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  statusText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 4,
  },
  fileSizeText: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  retryButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    color: '#374151',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default CheckinScreen;