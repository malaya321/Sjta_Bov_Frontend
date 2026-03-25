import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import { Bell, LogOut, User } from 'lucide-react-native';

type HeaderSectionProps = {
  isIOS: boolean;
  isSmallDevice: boolean;
  driverData: any;
  isCheckedIn: boolean;
  isLoggingOut: boolean;
  hasNotifications: boolean;
  profilePhotoUri?: string | null;
  userName?: string;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
};

const HeaderSection: React.FC<HeaderSectionProps> = ({
  isIOS,
  isSmallDevice,
  driverData,
  isCheckedIn,
  isLoggingOut,
  hasNotifications,
  profilePhotoUri,
  userName,
  onNotificationPress,
  onProfilePress,
  onLogoutPress,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const initials = useMemo(() => {
    const nameSource = userName || driverData?.driver_name || '';
    const parts = nameSource.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [userName, driverData?.driver_name]);

  const handleMenuAction = (action: () => void) => {
    setShowMenu(false);
    action();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image
              source={require('../../../assets/image/purilogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.logoSubtitle}>SJTA Driver App</Text>
            <Text style={styles.logoTitle}>Jai Jagannath</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={[styles.notificationButton, isIOS && styles.iosShadow]}
            onPress={onNotificationPress}
            activeOpacity={0.7}
            disabled={isLoggingOut}
          >
            <Bell size={isSmallDevice ? 18 : 20} color="#94A3B8" />
            {hasNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.avatarContainer, isIOS && styles.iosShadow]}
            onPress={() => setShowMenu((prev) => !prev)}
            activeOpacity={0.7}
            disabled={isLoggingOut}
          >
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showMenu && (
        <View style={styles.menuWrapper}>
          <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
          <View style={[styles.menu, isIOS && styles.iosShadow]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuAction(onProfilePress)}
          >
            <User size={16} color="#0F172A" />
            <Text style={styles.menuText}>My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuAction(onLogoutPress)}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={[styles.menuText, styles.menuLogoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
        </View>
      )}

      <View style={[styles.profileCard, isIOS && styles.iosShadow]}>
        <View style={styles.profileContent}>
          <View style={styles.profileInfo}>
            <Text style={styles.shiftText}>{`${driverData?.shift_details?.shift_name} (${driverData?.shift_details?.start_time} - ${driverData?.shift_details?.end_time})`}</Text>
            <Text style={styles.driverName}>{driverData?.driver_name}</Text>
            <View style={[styles.idBadge, isCheckedIn && styles.idBadgeActive]}>
              <View style={[styles.statusDot, isCheckedIn && styles.statusDotActive]} />
              <Text style={[styles.idText, isCheckedIn && styles.idTextActive]}>
                ID: {driverData?.driver_userid} • {isCheckedIn ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              isIOS && styles.iosButton,
              isLoggingOut && styles.logoutButtonDisabled
            ]}
            onPress={onLogoutPress}
            activeOpacity={0.7}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
              </View>
            ) : (
              <LogOut size={isSmallDevice ? 18 : 22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgb(157, 20, 12)',
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: { width: '100%', height: '100%' },
  logoSubtitle: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9D140C',
  },
  menu: {
    position: 'absolute',
    right: 20,
    top: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: 180,
    zIndex: 20,
    ...Platform.select({
      android: {
        elevation: 6,
      },
    }),
  },
  menuWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuLogoutText: {
    color: '#DC2626',
  },
  profileCard: {
    backgroundColor: '#D97706',
    borderRadius: 24,
    padding: 16,
    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  shiftText: {
    fontSize: 12,
    color: 'rgb(157, 20, 12)',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  idBadgeActive: {
    backgroundColor: 'rgba(11, 141, 59, 0.12)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  statusDotActive: {
    backgroundColor: '#22C55E',
  },
  idText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  idTextActive: {
    color: '#038934',
  },
  logoutButton: {
    backgroundColor: 'rgb(188, 16, 7)',
    padding: 12,
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iosButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default HeaderSection;
