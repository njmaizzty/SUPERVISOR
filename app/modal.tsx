import { useAuth } from '@/contexts/AuthContext'; // make sure this path is correct
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';


export default function LoginScreen({ navigation }: any) {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const response = await login({ username, password });
    setLoading(false);

    if (response.success) {
      // Navigate to main tabs after successful login
      navigation.replace('MainTabs'); 
    } else {
      // Show alert if login fails
      Alert.alert('Login Failed', response.message || 'Invalid username or password');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Supervisor Login</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
});
