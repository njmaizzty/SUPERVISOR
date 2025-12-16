import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen 
              name="create-form" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="task-details" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="reports" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="ai-recommendations" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="ai-chat" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
          </>
        ) : (
          // Authentication screens
          <>
            <Stack.Screen 
              name="index" 
              options={{ 
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="login" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="signup" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
