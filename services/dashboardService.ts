import { API_BASE_URL } from '@/config/api';

const DASHBOARD_API = `${API_BASE_URL}/dashboard`;

// Types
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
  lastUpdated: string;
}

export interface OverviewItem {
  value: number;
  trend: string;
  trendType: 'increase' | 'decrease' | 'status' | 'warning' | 'info';
}

export interface OverviewData {
  activeTasks: OverviewItem;
  workers: OverviewItem;
  maintenance: OverviewItem;
  areas: OverviewItem;
  completedToday: OverviewItem;
  pendingApprovals: OverviewItem;
}

export interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  priority: 'high' | 'medium' | 'normal';
  icon: string;
  read: boolean;
}

export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: string;
  icon: string;
  user: string;
}

export interface DashboardData {
  weather: WeatherData;
  overview: OverviewData;
  announcements: Announcement[];
  recentActivity: Activity[];
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Fetch all dashboard data
export const fetchDashboardData = async (): Promise<ApiResponse<DashboardData>> => {
  try {
    const response = await fetch(DASHBOARD_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Fetch weather data only
export const fetchWeather = async (): Promise<ApiResponse<WeatherData>> => {
  try {
    const response = await fetch(`${DASHBOARD_API}/weather`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Fetch today's overview
export const fetchOverview = async (): Promise<ApiResponse<OverviewData>> => {
  try {
    const response = await fetch(`${DASHBOARD_API}/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch overview data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Overview fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Fetch announcements
export const fetchAnnouncements = async (): Promise<ApiResponse<Announcement[]>> => {
  try {
    const response = await fetch(`${DASHBOARD_API}/announcements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Mark announcement as read
export const markAnnouncementRead = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${DASHBOARD_API}/announcements/${id}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark announcement as read');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Mark read error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Fetch recent activity
export const fetchRecentActivity = async (limit: number = 10): Promise<ApiResponse<Activity[]>> => {
  try {
    const response = await fetch(`${DASHBOARD_API}/activity?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Activity fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

