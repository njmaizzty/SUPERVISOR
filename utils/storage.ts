import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for secure storage
const JWT_TOKEN_KEY = 'jwt_token';
const USER_DATA_KEY = 'user_data';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface UserData {
  id: string;
  name: string;
  email: string;
  supervisorId: string;
}

/**
 * Secure storage utilities for authentication tokens and user data
 */
export class AuthStorage {
  /**
   * Store JWT token securely
   */
  static async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(JWT_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing JWT token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve JWT token
   */
  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(JWT_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving JWT token:', error);
      return null;
    }
  }

  /**
   * Store refresh token securely
   */
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Retrieve refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  static async setUserData(userData: UserData): Promise<void> {
    try {
      const jsonData = JSON.stringify(userData);
      await AsyncStorage.setItem(USER_DATA_KEY, jsonData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  /**
   * Retrieve user data
   */
  static async getUserData(): Promise<UserData | null> {
    try {
      const jsonData = await AsyncStorage.getItem(USER_DATA_KEY);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data (logout)
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(JWT_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing authentication data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AuthStorage.getToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
}
