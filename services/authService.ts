/**
 * Auth Service - Handles authentication API calls
 */

import { getApiUrl, API_ENDPOINTS, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '@/config/api';

export interface SignupData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  supervisorId: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UserData {
  id: number;
  fullName: string;
  email: string;
  username: string;
  supervisorId: string;
  status: string;
  profileImage?: string;
  phone?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: UserData;
}

export interface CheckAvailabilityResponse {
  success: boolean;
  available: boolean;
  message?: string;
}

/**
 * Create a new supervisor account
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(getApiUrl(API_ENDPOINTS.SIGNUP), {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out. Please try again.',
      };
    }
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Login with username/email and password
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out. Please try again.',
      };
    }
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Logout current user
 */
export const logout = async (token: string): Promise<AuthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(getApiUrl(API_ENDPOINTS.LOGOUT), {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Logout failed',
    };
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (token: string): Promise<AuthResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(getApiUrl(API_ENDPOINTS.SUPERVISOR_PROFILE), {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      message: 'Failed to fetch profile',
    };
  }
};

/**
 * Check if email is available
 */
export const checkEmailAvailability = async (email: string): Promise<CheckAvailabilityResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(getApiUrl(`/supervisor/check-email/${encodeURIComponent(email)}`), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Check email error:', error);
    return {
      success: false,
      available: false,
      message: 'Failed to check email',
    };
  }
};

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (username: string): Promise<CheckAvailabilityResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(getApiUrl(`/supervisor/check-username/${encodeURIComponent(username)}`), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Check username error:', error);
    return {
      success: false,
      available: false,
      message: 'Failed to check username',
    };
  }
};

export default {
  signup,
  login,
  logout,
  getProfile,
  checkEmailAvailability,
  checkUsernameAvailability,
};

