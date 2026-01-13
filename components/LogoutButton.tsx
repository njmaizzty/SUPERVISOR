import React from 'react';
import { TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LogoutButtonProps {
  color?: string;
  size?: number;
  style?: object;
}

export function LogoutButton({ color = '#D32F2F', size = 24, style }: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // For web, use confirm dialog
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        performLogout();
      }
    } else {
      // For mobile, use Alert
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
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      await logout();
      // Redirect to login page
      router.replace('/login');
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleLogout}
      activeOpacity={0.7}
    >
      <IconSymbol name="rectangle.portrait.and.arrow.right.fill" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
  },
});

