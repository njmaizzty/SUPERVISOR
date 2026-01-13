const express = require('express');
const router = express.Router();

// Mock data - In production, replace with database queries

// Weather data (mock - integrate with real weather API like OpenWeatherMap)
const getWeatherData = () => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
    condition: randomCondition,
    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
    windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
    location: 'Farm Location',
    icon: getWeatherIcon(randomCondition),
    forecast: [
      { day: 'Tomorrow', temp: Math.floor(Math.random() * 15) + 20, condition: 'Sunny' },
      { day: 'Wed', temp: Math.floor(Math.random() * 15) + 20, condition: 'Cloudy' },
      { day: 'Thu', temp: Math.floor(Math.random() * 15) + 20, condition: 'Partly Cloudy' },
    ],
    lastUpdated: new Date().toISOString(),
  };
};

const getWeatherIcon = (condition) => {
  const icons = {
    'Sunny': 'sun.max.fill',
    'Partly Cloudy': 'cloud.sun.fill',
    'Cloudy': 'cloud.fill',
    'Light Rain': 'cloud.rain.fill',
    'Clear': 'moon.stars.fill',
  };
  return icons[condition] || 'sun.max.fill';
};

// Today's Overview data
const getTodaysOverview = () => {
  return {
    activeTasks: {
      value: Math.floor(Math.random() * 10) + 8,
      trend: '+' + Math.floor(Math.random() * 5),
      trendType: 'increase',
    },
    workers: {
      value: Math.floor(Math.random() * 5) + 6,
      trend: 'online',
      trendType: 'status',
    },
    maintenance: {
      value: Math.floor(Math.random() * 5) + 1,
      trend: 'due',
      trendType: 'warning',
    },
    areas: {
      value: Math.floor(Math.random() * 3) + 4,
      trend: 'active',
      trendType: 'status',
    },
    completedToday: {
      value: Math.floor(Math.random() * 8) + 2,
      trend: 'tasks',
      trendType: 'info',
    },
    pendingApprovals: {
      value: Math.floor(Math.random() * 4),
      trend: 'pending',
      trendType: 'warning',
    },
  };
};

// Announcements data
const getAnnouncements = () => {
  const announcements = [
    {
      id: '1',
      title: 'System Maintenance',
      subtitle: 'Scheduled maintenance tonight at 11 PM - 2 AM',
      time: 'Today',
      priority: 'high',
      icon: 'wrench.fill',
      read: false,
    },
    {
      id: '2',
      title: 'Safety Reminder',
      subtitle: 'All workers must wear PPE in designated zones',
      time: 'Yesterday',
      priority: 'medium',
      icon: 'exclamationmark.shield.fill',
      read: false,
    },
    {
      id: '3',
      title: 'Team Meeting',
      subtitle: 'Weekly supervisor meeting tomorrow at 9 AM',
      time: 'Yesterday',
      priority: 'normal',
      icon: 'person.3.fill',
      read: true,
    },
    {
      id: '4',
      title: 'New Equipment Arrival',
      subtitle: 'Irrigation equipment arriving next Monday',
      time: '2 days ago',
      priority: 'normal',
      icon: 'shippingbox.fill',
      read: true,
    },
    {
      id: '5',
      title: 'Weather Alert',
      subtitle: 'Heavy rain expected this weekend, plan accordingly',
      time: '3 days ago',
      priority: 'high',
      icon: 'cloud.rain.fill',
      read: true,
    },
  ];
  
  return announcements;
};

// Recent Activity data
const getRecentActivity = () => {
  const activities = [
    {
      id: '1',
      title: 'Task Completed',
      subtitle: 'Tree pruning in Block A-1 finished',
      time: '2 hours ago',
      type: 'task_complete',
      icon: 'checkmark.circle.fill',
      user: 'John Doe',
    },
    {
      id: '2',
      title: 'Worker Assigned',
      subtitle: 'Maria assigned to irrigation maintenance',
      time: '3 hours ago',
      type: 'assignment',
      icon: 'person.badge.plus',
      user: 'System',
    },
    {
      id: '3',
      title: 'Maintenance Alert',
      subtitle: 'Tractor #3 requires oil change',
      time: '4 hours ago',
      type: 'maintenance',
      icon: 'exclamationmark.triangle.fill',
      user: 'System',
    },
    {
      id: '4',
      title: 'New Task Created',
      subtitle: 'Fertilizer application for Block B-2',
      time: '5 hours ago',
      type: 'task_created',
      icon: 'plus.circle.fill',
      user: 'Admin',
    },
    {
      id: '5',
      title: 'Area Inspection',
      subtitle: 'Block C inspection completed by supervisor',
      time: '6 hours ago',
      type: 'inspection',
      icon: 'eye.fill',
      user: 'Supervisor',
    },
    {
      id: '6',
      title: 'Report Generated',
      subtitle: 'Weekly productivity report available',
      time: 'Yesterday',
      type: 'report',
      icon: 'doc.text.fill',
      user: 'System',
    },
    {
      id: '7',
      title: 'Equipment Check-in',
      subtitle: 'Sprayer returned to equipment shed',
      time: 'Yesterday',
      type: 'equipment',
      icon: 'arrow.down.circle.fill',
      user: 'Carlos',
    },
  ];
  
  return activities;
};

// ============ API ROUTES ============

// GET /api/dashboard - Get all dashboard data
router.get('/', (req, res) => {
  try {
    const dashboardData = {
      weather: getWeatherData(),
      overview: getTodaysOverview(),
      announcements: getAnnouncements(),
      recentActivity: getRecentActivity(),
      lastUpdated: new Date().toISOString(),
    };
    
    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

// GET /api/dashboard/weather - Get weather data only
router.get('/weather', (req, res) => {
  try {
    res.json({
      success: true,
      data: getWeatherData(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
    });
  }
});

// GET /api/dashboard/overview - Get today's overview
router.get('/overview', (req, res) => {
  try {
    res.json({
      success: true,
      data: getTodaysOverview(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview data',
    });
  }
});

// GET /api/dashboard/announcements - Get announcements
router.get('/announcements', (req, res) => {
  try {
    res.json({
      success: true,
      data: getAnnouncements(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch announcements',
    });
  }
});

// POST /api/dashboard/announcements/:id/read - Mark announcement as read
router.post('/announcements/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    // In production, update database
    res.json({
      success: true,
      message: `Announcement ${id} marked as read`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement',
    });
  }
});

// GET /api/dashboard/activity - Get recent activity
router.get('/activity', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activities = getRecentActivity().slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity data',
    });
  }
});

module.exports = router;

