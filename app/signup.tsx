import { IconSymbol } from '@/components/ui/icon-symbol';
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const { fullName, email, username, password, confirmPassword, supervisorId } = formData;
    const newErrors: {[key: string]: string} = {};
    
    if (fullName.trim().length > 0 && fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    if (email.trim().length > 0 && (!email.includes('@') || !email.includes('.'))) {
      newErrors.email = 'Please enter a valid email';
    }
    if (username.trim().length > 0 && username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (password.length > 0 && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (supervisorId.trim().length > 0 && supervisorId.trim().length < 3) {
      newErrors.supervisorId = 'Supervisor ID is required';
    }
    
    setErrors(newErrors);
    setIsFormValid(
      Object.keys(newErrors).length === 0 && 
      fullName.trim().length >= 2 && 
      email.includes('@') && 
      username.trim().length >= 3 && 
      password.length >= 6 &&
      password === confirmPassword &&
      supervisorId.trim().length >= 3
    );
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label: string, field: keyof typeof formData, icon: string, props = {}) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, focusedField === field && styles.labelActive]}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        focusedField === field && styles.inputWrapperFocused,
        errors[field] && styles.inputWrapperError
      ]}>
        <IconSymbol name={icon as any} size={20} color={focusedField === field ? '#2E7D32' : '#999'} />
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          placeholderTextColor="#999"
          editable={!isLoading}
          {...props}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      
      {/* Decorative Background */}
      <View style={styles.bgDecor} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
              <IconSymbol name="arrow.left" size={20} color="#2E7D32" />
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join as a supervisor</Text>
            </View>
          </View>

          <View style={styles.card}>
            {renderInput('Full Name', 'fullName', 'person.fill', { placeholder: 'John Doe', autoCapitalize: 'words' })}
            {renderInput('Email', 'email', 'envelope.fill', { placeholder: 'name@example.com', keyboardType: 'email-address', autoCapitalize: 'none' })}
            {renderInput('Username', 'username', 'at', { placeholder: 'supervisor_01', autoCapitalize: 'none' })}
            {renderInput('Supervisor ID', 'supervisorId', 'checkmark.shield.fill', { placeholder: 'ID-12345', autoCapitalize: 'characters' })}
            {renderInput('Password', 'password', 'lock.fill', { placeholder: '••••••••', secureTextEntry: true })}
            {renderInput('Confirm Password', 'confirmPassword', 'lock.shield.fill', { placeholder: '••••••••', secureTextEntry: true })}

            <TouchableOpacity
              style={[styles.signupButton, !isFormValid && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  bgDecor: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E8F5E8',
    opacity: 0.5,
  },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  content: { flex: 1, maxWidth: 450, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingHorizontal: 4 },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTextContainer: { marginLeft: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1B5E20' },
  subtitle: { fontSize: 15, color: '#666' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8, marginLeft: 4 },
  labelActive: { color: '#2E7D32' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapperFocused: { borderColor: '#2E7D32', backgroundColor: '#FFFFFF' },
  inputWrapperError: { borderColor: '#D32F2F' },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#333' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 4 },
  signupButton: {
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  signupButtonDisabled: { backgroundColor: '#A5D6A7', shadowOpacity: 0, elevation: 0 },
  signupButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginLinkText: { color: '#666', fontSize: 14 },
  loginLink: { color: '#2E7D32', fontSize: 14, fontWeight: '700' },
});