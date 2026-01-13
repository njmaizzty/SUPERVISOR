import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AIChatButton } from '@/components/AIChatButton';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { logout, user } = useAuth();

  // Get user initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return 'SU';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Logout logic - works on both web and native
  const handleLogout = async () => {
    // On web, use window.confirm; on native, use Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to end your session?');
      if (confirmed) {
        await logout();
        router.replace('/login');
      }
    } else {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to end your session?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Logout", 
            style: "destructive", 
            onPress: async () => {
              await logout();
              router.replace('/login');
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabIconDefault,
          
          // Header settings
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.card,
            height: Platform.OS === 'ios' ? 100 : 70,
            shadowOpacity: 0,
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          },
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.text,
            fontSize: 18,
          },
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity 
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                style={styles.profileButton}
              >
                {user?.profileImage ? (
                  <Image 
                    source={{ uri: user.profileImage }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Text style={styles.profileInitials}>
                      {getInitials(user?.fullName || user?.name)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ),

          // Tab bar styling
          tabBarButton: HapticTab,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 8,
          },
          tabBarStyle: {
            backgroundColor: colors.card,
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            height: Platform.OS === 'ios' ? 80 : 70,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: colors.borderLight,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
          },
        }}
      >
        {/* Dashboard */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconSymbol size={24} name="house.fill" color={focused ? '#FFFFFF' : color} />
              </View>
            ),
          }}
        />

        {/* Tasks */}
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconSymbol size={24} name="checklist" color={focused ? '#FFFFFF' : color} />
              </View>
            ),
          }}
        />

        {/* Workers */}
        <Tabs.Screen
          name="workers"
          options={{
            title: 'Workers',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconSymbol size={24} name="person.2.fill" color={focused ? '#FFFFFF' : color} />
              </View>
            ),
          }}
        />

        {/* Assets */}
        <Tabs.Screen
          name="assets"
          options={{
            title: 'Assets',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconSymbol size={24} name="wrench.and.screwdriver.fill" color={focused ? '#FFFFFF' : color} />
              </View>
            ),
          }}
        />

        {/* Areas */}
        <Tabs.Screen
          name="areas"
          options={{
            title: 'Areas',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconSymbol size={24} name="map.fill" color={focused ? '#FFFFFF' : color} />
              </View>
            ),
          }}
        />

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconSymbol size={24} name="person.fill" color={focused ? '#FFFFFF' : color} />
              </View>
            ),
          }}
        />
      </Tabs>
      
      {/* AI Chat Floating Button */}
      <AIChatButton showTooltip={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    padding: 6,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: Colors.light.primary,
    transform: [{ scale: 1.05 }],
    borderRadius: BorderRadius.md,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 10,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  profileButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1B5E20',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
