/**
 * API Configuration
 * Update these values to match your backend API
 */

// Base API URL - Replace with your actual API endpoint
// For local development, use your machine's IP address (not localhost) for mobile testing
// For web development, use localhost
import { Platform } from 'react-native';

const getBaseUrl = () => {
  // For web, use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api';
  }
  // For mobile devices/Android emulator, use 10.0.2.2 (Android emulator localhost)
  // Or use your machine's actual IP address for physical devices
  // 10.0.2.2 is the special alias to the host machine from Android emulator
  return 'http://10.0.2.2:3001/api';
};

export const API_BASE_URL = getBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: '/supervisor/signup',
  LOGIN: '/supervisor/login',
  LOGOUT: '/supervisor/logout',
  REFRESH_TOKEN: '/supervisor/refresh',
  
  // Supervisor
  SUPERVISOR_PROFILE: '/supervisor/profile',
  
  // Tasks
  TASKS: '/tasks',
  TASK_BY_ID: (id: string) => `/tasks/${id}`,
  CREATE_TASK: '/tasks',
  UPDATE_TASK: (id: string) => `/tasks/${id}`,
  DELETE_TASK: (id: string) => `/tasks/${id}`,
  
  // Workers
  WORKERS: '/workers',
  WORKER_BY_ID: (id: string) => `/workers/${id}`,
  WORKER_TASKS: (id: string) => `/workers/${id}/tasks`,
  
  // Assets
  ASSETS: '/assets',
  ASSET_BY_ID: (id: string) => `/assets/${id}`,
  ASSET_MAINTENANCE: (id: string) => `/assets/${id}/maintenance`,
  
  // Areas
  AREAS: '/areas',
  AREA_BY_ID: (id: string) => `/areas/${id}`,
  AREA_BLOCKS: (id: string) => `/areas/${id}/blocks`,
  
  // Blocks
  BLOCKS: '/blocks',
  BLOCK_BY_ID: (id: string) => `/blocks/${id}`,
  BLOCK_TREES: (id: string) => `/blocks/${id}/trees`,
  
  // Trees
  TREES: '/trees',
  TREE_BY_ID: (id: string) => `/trees/${id}`,
  
  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_WEATHER: '/dashboard/weather',
  DASHBOARD_OVERVIEW: '/dashboard/overview',
  DASHBOARD_ANNOUNCEMENTS: '/dashboard/announcements',
  DASHBOARD_ACTIVITY: '/dashboard/activity',
} as const;

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

/**
 * Get full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
