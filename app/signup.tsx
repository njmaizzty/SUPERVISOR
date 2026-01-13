import { signup } from '@/services/authService';
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
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    supervisorId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const { fullName, email, username, password, confirmPassword, supervisorId } = formData;
    setIsFormValid(
      fullName.trim().length >= 1 && 
      email.trim().length >= 1 && 
      username.trim().length >= 1 && 
      password.length >= 1 &&
      confirmPassword.length >= 1 &&
      password === confirmPassword &&
      supervisorId.trim().length >= 1
    );
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (!isFormValid) return;
    
    if (formData.password !== formData.confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Passwords do not match');
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        supervisorId: formData.supervisorId.trim(),
      });

      if (response.success) {
        if (Platform.OS === 'web') {
          window.alert('Account created successfully!');
        } else {
          Alert.alert('Success', 'Account created successfully!');
        }
        router.replace('/login');
      } else {
        if (Platform.OS === 'web') {
          window.alert(response.message || 'Failed to create account');
        } else {
          Alert.alert('Error', response.message || 'Failed to create account');
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to create account. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            placeholder="Full Name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(text) => handleInputChange('username', text)}
            placeholder="Username"
            placeholderTextColor="#999"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            value={formData.supervisorId}
            onChangeText={(text) => handleInputChange('supervisorId', text)}
            placeholder="Supervisor ID"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.signupBtn, !isFormValid && styles.signupBtnDisabled]}
            onPress={handleSignup}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
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
  signupBtn: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  signupBtnDisabled: {
    backgroundColor: '#A5D6A7',
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    marginBottom: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});
