import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthStorage, UserData } from '@/utils/storage';
import { getApiUrl, API_ENDPOINTS, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '@/config/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: UserData;
  message?: string;
}

export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const [token, userData] = await Promise.all([
        AuthStorage.getToken(),
        AuthStorage.getUserData(),
      ]);

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // API call to login endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        if (data.token) {
          await AuthStorage.setToken(data.token);
        }
        if (data.refreshToken) {
          await AuthStorage.setRefreshToken(data.refreshToken);
        }
        if (data.user) {
          await AuthStorage.setUserData(data.user);
          setUser(data.user);
        }

        setIsAuthenticated(true);
        setError(null);

        return {
          success: true,
          token: data.token,
          refreshToken: data.refreshToken,
          user: data.user,
        };
      } else {
        // Handle login failure
        const errorMessage = data.message || 'Invalid credentials';
        setError(errorMessage);
        
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Network error. Please check your connection.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please try again.';
      }
      
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear all stored authentication data
      await AuthStorage.clearAll();
      
      // Reset state
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if clearing storage fails, reset the state
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
