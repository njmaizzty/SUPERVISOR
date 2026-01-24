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

  const { login, isLoading } = useAuth(); // no automatic isAuthenticated redirect
  const router = useRouter();

  // Check form validity
  useEffect(() => {
    setIsFormValid(username.trim().length > 0 && password.length >= 1);
  }, [username, password]);

  const handleLogin = async () => {
    if (!isFormValid) return;

    // Call login from AuthContext
    const result = await login({ username: username.trim(), password });

    if (result.success) {
      // Only navigate after successful login
      router.replace('/(tabs)');
    } else {
      // Show error if login fails
      if (Platform.OS === 'web') {
        window.alert(result.message || 'Invalid username or password');
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid username or password');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.headerArea}>
          <Text style={styles.title}>Farm Supervisor</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        {/* Login Form */}
        <View style={styles.card}>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#999"
            style={styles.input}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.loginBtn, (!isFormValid || isLoading) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={styles.footer}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  inner: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  headerArea: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  title: { 
    fontSize: 28, 
    color: '#2E7D32', 
    fontWeight: '700',
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 8,
  },
  card: { 
    width: width > 400 ? 360 : width * 0.9, 
  },
  input: { 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    padding: 16, 
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginBtn: { 
    backgroundColor: '#2E7D32', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 8,
  },
  loginBtnDisabled: {
    backgroundColor: '#A5D6A7',
  },
  loginBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600',
  },
  footer: { 
    marginTop: 30 
  },
  footerText: { 
    color: '#666', 
    fontSize: 15 
  },
  signupLink: { 
    color: '#2E7D32', 
    fontWeight: '600',
  },
});
