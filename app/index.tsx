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

      <View style={styles.inner}>
        {/* Header with Emojis */}
        <View style={styles.headerArea}>
          <Text style={styles.emoji}>🌾🚜👨‍🌾</Text>
          <Text style={styles.title}>SUPERVISOR</Text>
          <Text style={styles.titleBold}>QUEST</Text>
          <Text style={styles.subtitle}>Manage your farm like a pro</Text>
        </View>

        {/* Action Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎮 START YOUR JOURNEY</Text>
          </View>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🌱 Farm Management Made Fun 🌱</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8efdeff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    color: '#000000ff',
    letterSpacing: 6,
    fontWeight: '500',
  },
  titleBold: {
    fontSize: 50,
    fontWeight: '900',
    color: '#2E7D32',
    marginTop: -5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    fontWeight: '500',
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#000000ff',
    borderRadius: 30,
    padding: 25,
    elevation: 8,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 2,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#2E7D32',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#000000ff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  signupButton: {
    backgroundColor: '#FFB300',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#E65100',
  },
  signupButtonText: {
    color: '#000000ff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
});
