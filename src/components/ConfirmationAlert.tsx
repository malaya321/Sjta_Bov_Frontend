// ConfirmLogoutAlert.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ConfirmLogoutAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  isCheckedIn: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationAlert: React.FC<ConfirmLogoutAlertProps> = ({
  visible,
  title = 'Logout',
  message = 'Are you sure you want to logout?',
  isCheckedIn,
  onConfirm,
  onCancel,
  confirmText = 'Logout',
  cancelText = 'Cancel',
}) => {
  const handleConfirm = () => {
    if (isCheckedIn && (title == 'Logout')) {
      // Just show the message in the alert, don't proceed
      return;
    }
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleBackdropPress = () => {
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
              
              {isCheckedIn && (title == 'Logout') && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    You need to check out first.
                  </Text>
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <View style={styles.buttonDivider} />
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isCheckedIn && (title == 'Logout') && styles.disabledButton,
                ]}
                onPress={handleConfirm}
                disabled={isCheckedIn && (title == 'Logout')}
              >
                <Text style={[
                  styles.confirmButtonText,
                  isCheckedIn && (title == 'Logout') && styles.disabledButtonText,
                ]}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  message: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 21,
  },
  warningContainer: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE999',
  },
  warningText: {
    fontSize: 14,
    color: '#B38C00',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    minHeight: 52,
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#999999',
  },
});