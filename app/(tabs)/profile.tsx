import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
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
            <Text style={styles.profileItemValue}>{value}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.fill" size={80} color="#2E7D32" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Supervisor'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'supervisor@company.com'}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="person.fill"
              title="Full Name"
              value={user?.name || 'Not available'}
            />
            <ProfileItem
              icon="envelope.fill"
              title="Email"
              value={user?.email || 'Not available'}
            />
            <ProfileItem
              icon="number"
              title="Supervisor ID"
              value={user?.supervisorId || 'Not available'}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="bell.fill"
              title="Notifications"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon.')}
              showArrow
            />
            <ProfileItem
              icon="lock.fill"
              title="Change Password"
              onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')}
              showArrow
            />
            <ProfileItem
              icon="questionmark.circle.fill"
              title="Help & Support"
              onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available soon.')}
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
              icon="doc.text.fill"
              title="Terms of Service"
              onPress={() => Alert.alert('Coming Soon', 'Terms of Service will be available soon.')}
              showArrow
            />
            <ProfileItem
              icon="hand.raised.fill"
              title="Privacy Policy"
              onPress={() => Alert.alert('Coming Soon', 'Privacy Policy will be available soon.')}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDestructive: {
    backgroundColor: '#D32F2F',
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  profileItemTitleDestructive: {
    color: '#D32F2F',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 32,
  },
});
