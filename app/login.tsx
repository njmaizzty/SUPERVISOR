import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsFormValid(username.trim().length > 0 && password.length >= 6);
  }, [username, password]);

  const handleLogin = async () => {
    if (!isFormValid) return;
    const result = await login({ username: username.trim(), password });
    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <View style={styles.circleDecorator} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>

          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.push('/')}
            >
              <IconSymbol name="arrow.left" size={20} color="#2E7D32" />
            </TouchableOpacity>
            
            <View style={styles.brandContainer}>
              {/* Profile Icon at the Top */}
              <View style={styles.profileCircle}>
                <IconSymbol name="person.crop.circle.fill" size={80} color="#2E7D32" />
              </View>

              <Text style={styles.title}>Supervisor App</Text>
              <Text style={styles.subtitle}>Login</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, focusedField === 'user' && styles.labelActive]}>Username</Text>
              <View style={[styles.inputWrapper, focusedField === 'user' && styles.inputWrapperActive]}>
                <IconSymbol name="person.fill" size={18} color={focusedField === 'user' ? '#2E7D32' : '#999'} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  onFocus={() => setFocusedField('user')}
                  onBlur={() => setFocusedField(null)}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, focusedField === 'pass' && styles.labelActive]}>Password</Text>
              <View style={[styles.inputWrapper, focusedField === 'pass' && styles.inputWrapperActive]}>
                <IconSymbol name="lock.fill" size={18} color={focusedField === 'pass' ? '#2E7D32' : '#999'} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.loginButton, !isFormValid && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Create new account?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupText}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  circleDecorator: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E8F5E8',
    zIndex: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    maxWidth: 450,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  profileCircle: {
    marginBottom: 16,
    // Adds a soft glow/shadow behind the profile icon
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginLeft: 4,
  },
  labelActive: {
    color: '#2E7D32',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapperActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  forgotBtn: {
    marginTop: 16,
    alignSelf: 'center',
  },
  forgotText: {
    color: '#666',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  signupText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '700',
  },
});