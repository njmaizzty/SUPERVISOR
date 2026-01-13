import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* GLOBAL SCREENS 
          Available regardless of authentication status 
        */}
        <Stack.Screen 
          name="support" 
          options={{ 
            headerShown: false,
            gestureEnabled: true,
            presentation: 'card' 
          }} 
        />

        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: false }} />
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
            <Stack.Screen 
              name="create-block" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="add-tree" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="blocks" 
              options={{ 
                headerShown: false,
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="trees" 
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