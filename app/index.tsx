import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative Background Accents */}
      <View style={styles.topShape} />
      <View style={styles.bottomShape} />

      <View style={styles.content}>
        {/* Logo / Header Section */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <View style={styles.innerBadge}>
              <IconSymbol name="person.fill" size={60} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>Supervisor App</Text>

          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Manage your agricultural operations with ease
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>Login</Text>
            <IconSymbol name="chevron.right" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          {/* Footer with Support link has been removed for a cleaner UI */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  topShape: {
    position: 'absolute',
    top: -width * 0.2,
    right: -width * 0.1,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#E8F5E8',
    opacity: 0.6,
  },
  bottomShape: {
    position: 'absolute',
    bottom: -width * 0.3,
    left: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: '#DCEDDC',
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingBottom: 60, // Increased padding slightly for better visual balance
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
  },
  logoBadge: {
    width: 130,
    height: 130,
    borderRadius: 45,
    backgroundColor: '#DCEDDC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  innerBadge: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1B5E20',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 17,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
  },
  loginButton: {
    height: 60,
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  signupButton: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Adjusted margin since footer is gone
  },
  signupButtonText: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '600',
  },
});