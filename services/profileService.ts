/**
 * Profile Service - Handles profile-related API calls
 */

import { getApiUrl, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '@/config/api';

export interface ProfileData {
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

export interface UpdateProfileData {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

export interface ChangePasswordData {
  id: number;
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: ProfileData;
}

/**
 * Get user profile by ID
 */
export const getProfile = async (id: number, token: string): Promise<ProfileResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(getApiUrl(`/supervisor/profile/${id}`), {
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
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData, token: string): Promise<ProfileResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Prepare the data - handle profile image size
    const requestData = {
      ...data,
      // If profile image is too large (base64), truncate or skip for API
      profileImage: data.profileImage && data.profileImage.length > 500000 
        ? data.profileImage.substring(0, 500000) // Limit to ~500KB
        : data.profileImage,
    };

    const response = await fetch(getApiUrl('/supervisor/profile'), {
      method: 'PUT',
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile update API error:', response.status, errorText);
      return {
        success: false,
        message: `Server error: ${response.status}`,
      };
    }

    const result = await response.json();
    
    // Ensure profile image is included in response
    if (result.success && result.user) {
      result.user.profileImage = data.profileImage || result.user.profileImage;
    }
    
    return result;
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData, token: string): Promise<ProfileResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(getApiUrl('/supervisor/change-password'), {
      method: 'PUT',
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'Failed to change password',
    };
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
};

