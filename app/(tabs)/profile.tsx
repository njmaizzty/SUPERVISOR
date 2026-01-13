import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { updateProfile, changePassword } from '@/services/profileService';

export default function ProfileScreen() {
  const { user, logout, updateUser, getToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Edit profile state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Request permission for image picker
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Required', 'Please allow access to your photo library to change profile picture.');
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          setEditForm({ ...editForm, profileImage: imageUri });
        } else {
          setEditForm({ ...editForm, profileImage: asset.uri });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      showAlert('Not Available', 'Camera is not available on web. Please choose from gallery.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please allow access to your camera to take a photo.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          setEditForm({ ...editForm, profileImage: imageUri });
        } else {
          setEditForm({ ...editForm, profileImage: asset.uri });
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showAlert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    if (Platform.OS === 'web') {
      pickImage();
    } else {
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickImage },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        await logout();
        router.replace('/login');
      } catch (error) {
        showAlert('Error', 'Failed to logout. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      showAlert('Error', 'Full name is required');
      return;
    }

    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      showAlert('Error', 'Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const userId = user?.id || 1;
      
      // Update locally first for immediate feedback
      const updatedUserData = {
        id: userId,
        fullName: editForm.fullName.trim(),
        name: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        profileImage: editForm.profileImage,
        username: user?.username,
        supervisorId: user?.supervisorId,
        status: user?.status,
      };

      // Try API update
      if (token) {
        try {
          const response = await updateProfile({
            id: userId,
            fullName: editForm.fullName.trim(),
            email: editForm.email.trim(),
            phone: editForm.phone.trim(),
            profileImage: editForm.profileImage,
          }, token);

          if (response.success && response.user) {
            await updateUser({
              ...response.user,
              name: response.user.fullName,
              profileImage: editForm.profileImage,
            });
            setIsEditModalVisible(false);
            showAlert('Success', 'Profile updated successfully');
            return;
          }
        } catch (apiError) {
          console.log('API update failed, saving locally:', apiError);
        }
      }

      // Fallback: Save locally even if API fails
      await updateUser(updatedUserData);
      setIsEditModalVisible(false);
      showAlert('Success', 'Profile updated locally');
    } catch (error) {
      console.error('Profile update error:', error);
      showAlert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      showAlert('Error', 'Current password is required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showAlert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const userId = user?.id;
      
      if (!token) {
        showAlert('Error', 'Please login again');
        return;
      }

      const response = await changePassword({
        id: userId || 1,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, token);

      if (response.success) {
        setIsPasswordModalVisible(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showAlert('Success', 'Password changed successfully');
      } else {
        showAlert('Error', response.message || 'Failed to change password');
      }
    } catch (error) {
      showAlert('Error', 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const ProfileItem = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    showArrow = false,
    isDestructive = false 
  }: {
    icon: any;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.profileItemLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.iconContainerDestructive]}>
          <IconSymbol 
            name={icon} 
            size={20} 
            color={isDestructive ? '#FFFFFF' : '#2E7D32'} 
          />
        </View>
        <View style={styles.profileItemText}>
          <Text style={[styles.profileItemTitle, isDestructive && styles.profileItemTitleDestructive]}>
            {title}
          </Text>
          {value && (
            <Text style={styles.profileItemValue} numberOfLines={1}>{value}</Text>
          )}
        </View>
      </View>
      {showArrow && (
        <IconSymbol 
          name="chevron.right" 
          size={16} 
          color={Colors.light.tabIconDefault} 
        />
      )}
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#2E7D32" />
            ) : (
              <Text style={styles.modalSave}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Profile Picture Section */}
          <View style={styles.avatarEditSection}>
            <TouchableOpacity 
              style={styles.avatarEditContainer}
              onPress={showImagePickerOptions}
              activeOpacity={0.8}
            >
              {editForm.profileImage ? (
                <Image source={{ uri: editForm.profileImage }} style={styles.avatarImage} />
              ) : (
                <IconSymbol name="person.fill" size={60} color="#2E7D32" />
              )}
              <View style={styles.cameraOverlay}>
                <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={showImagePickerOptions}
            >
              <IconSymbol name="photo.fill" size={16} color="#2E7D32" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            {editForm.profileImage && (
              <TouchableOpacity 
                style={styles.removePhotoButton}
                onPress={() => setEditForm({ ...editForm, profileImage: '' })}
              >
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              value={editForm.fullName}
              onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email *</Text>
            <TextInput
              style={styles.formInput}
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number</Text>
            <TextInput
              style={styles.formInput}
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Username</Text>
            <TextInput
              style={[styles.formInput, styles.formInputDisabled]}
              value={user?.username || ''}
              editable={false}
            />
            <Text style={styles.formHint}>Username cannot be changed</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Supervisor ID</Text>
            <TextInput
              style={[styles.formInput, styles.formInputDisabled]}
              value={user?.supervisorId || ''}
              editable={false}
            />
            <Text style={styles.formHint}>Supervisor ID cannot be changed</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={isPasswordModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsPasswordModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setIsPasswordModalVisible(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity onPress={handleChangePassword} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#2E7D32" />
            ) : (
              <Text style={styles.modalSave}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Current Password *</Text>
            <TextInput
              style={styles.formInput}
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
              placeholder="Enter current password"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>New Password *</Text>
            <TextInput
              style={styles.formInput}
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Confirm New Password *</Text>
            <TextInput
              style={styles.formInput}
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Profile Card */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          
          <View style={styles.profileCard}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setIsEditModalVisible(true)}
              activeOpacity={0.8}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>👨‍🌾</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <IconSymbol name="pencil" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.fullName || user?.name || 'Supervisor'}</Text>
            <Text style={styles.userRole}>Farm Supervisor</Text>

            {/* Supervisor ID Badge */}
            <View style={styles.supervisorIdBadge}>
              <IconSymbol name="number" size={14} color="#FFFFFF" />
              <Text style={styles.supervisorIdText}>
                ID: {user?.supervisorId || 'SUP-001'}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <IconSymbol name="pencil" size={14} color="#FFFFFF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tasks Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Workers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="person.fill"
              title="Full Name"
              value={user?.fullName || user?.name || 'Not available'}
            />
            <ProfileItem
              icon="envelope.fill"
              title="Email"
              value={user?.email || 'Not available'}
            />
            <ProfileItem
              icon="number"
              title="Supervisor ID"
              value={user?.supervisorId || 'SUP-001'}
            />
            <ProfileItem
              icon="phone.fill"
              title="Phone"
              value={user?.phone || 'Not set'}
            />
            <ProfileItem
              icon="at"
              title="Username"
              value={user?.username || 'Not available'}
            />
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="pencil"
              title="Edit Profile"
              onPress={() => setIsEditModalVisible(true)}
              showArrow
            />
            <ProfileItem
              icon="lock.fill"
              title="Change Password"
              onPress={() => setIsPasswordModalVisible(true)}
              showArrow
            />
            <ProfileItem
              icon="bell.fill"
              title="Notifications"
              onPress={() => showAlert('Coming Soon', 'Notification settings will be available soon.')}
              showArrow
            />
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="info.circle.fill"
              title="Version"
              value="1.0.0"
            />
            <ProfileItem
              icon="questionmark.circle.fill"
              title="Help & Support"
              onPress={() => showAlert('Coming Soon', 'Help & Support will be available soon.')}
              showArrow
            />
            <ProfileItem
              icon="doc.text.fill"
              title="Terms of Service"
              onPress={() => showAlert('Coming Soon', 'Terms of Service will be available soon.')}
              showArrow
            />
            <ProfileItem
              icon="hand.raised.fill"
              title="Privacy Policy"
              onPress={() => showAlert('Coming Soon', 'Privacy Policy will be available soon.')}
              showArrow
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.card}>
            <ProfileItem
              icon="rectangle.portrait.and.arrow.right.fill"
              title="Logout"
              onPress={handleLogout}
              isDestructive
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      {renderEditModal()}
      {renderPasswordModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    paddingBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileCard: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  headerAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  supervisorIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  supervisorIdText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF9800',
    borderRadius: 25,
    gap: 8,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerDestructive: {
    backgroundColor: '#F44336',
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  profileItemTitleDestructive: {
    color: '#F44336',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#666666',
    marginTop: 3,
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666666',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  avatarEditSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarEditContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    gap: 6,
  },
  changePhotoText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  removePhotoButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  removePhotoText: {
    color: '#F44336',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  formInputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999999',
  },
  formHint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});
