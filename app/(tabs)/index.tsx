import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchDashboardData,
  type WeatherData,
  type OverviewData,
  type Announcement,
  type Activity,
} from "@/services/dashboardService";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Mock data for when API is unavailable
const mockDashboardData = {
  weather: {
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    location: "Farm Estate",
    icon: "cloud.sun.fill",
    forecast: [
      { day: "Tomorrow", temp: 29, condition: "Sunny" },
      { day: "Wed", temp: 27, condition: "Cloudy" },
      { day: "Thu", temp: 30, condition: "Sunny" },
    ],
    lastUpdated: new Date().toISOString(),
  },
  overview: {
    activeTasks: { value: 12, trend: "+3 today", trendType: "increase" as const },
    workers: { value: 8, trend: "online", trendType: "status" as const },
    maintenance: { value: 3, trend: "due", trendType: "warning" as const },
    areas: { value: 6, trend: "active", trendType: "status" as const },
    completedToday: { value: 5, trend: "tasks", trendType: "info" as const },
    pendingApprovals: { value: 2, trend: "pending", trendType: "warning" as const },
  },
  announcements: [
    { id: "1", title: "System Maintenance", subtitle: "Scheduled tonight at 11 PM", time: "Today", priority: "high" as const, icon: "wrench.fill", read: false },
    { id: "2", title: "Safety Reminder", subtitle: "All workers must wear PPE", time: "Yesterday", priority: "medium" as const, icon: "exclamationmark.shield.fill", read: false },
    { id: "3", title: "Team Meeting", subtitle: "Weekly meeting tomorrow 9 AM", time: "Yesterday", priority: "normal" as const, icon: "person.3.fill", read: true },
  ],
  recentActivity: [
    { id: "1", title: "Task Completed", subtitle: "Tree pruning in Block A-1", time: "2 hours ago", type: "task_complete", icon: "checkmark.circle.fill", user: "Ahmad" },
    { id: "2", title: "Worker Assigned", subtitle: "Maria assigned to irrigation", time: "3 hours ago", type: "assignment", icon: "person.badge.plus", user: "System" },
    { id: "3", title: "Maintenance Alert", subtitle: "Tractor #3 requires oil change", time: "4 hours ago", type: "maintenance", icon: "exclamationmark.triangle.fill", user: "System" },
  ],
};

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // State for dashboard data
  const [weather, setWeather] = useState<WeatherData | null>(mockDashboardData.weather);
  const [overview, setOverview] = useState<OverviewData | null>(mockDashboardData.overview);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockDashboardData.announcements);
  const [recentActivity, setRecentActivity] = useState<Activity[]>(mockDashboardData.recentActivity);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await fetchDashboardData();
      
      if (response.success && response.data) {
        setWeather(response.data.weather);
        setOverview(response.data.overview);
        setAnnouncements(response.data.announcements);
        setRecentActivity(response.data.recentActivity);
      }
      // If API fails, keep using mock data (already set as initial state)
    } catch (err) {
      console.log('Using mock data - API unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = async () => {
    // On web, use window.confirm; on native, use Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to end your session?');
      if (confirmed) {
        await logout();
        router.replace('/login');
      }
    } else {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to end your session?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Logout", 
            style: "destructive", 
            onPress: async () => {
              await logout();
              router.replace('/login');
            }
          }
        ]
      );
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Supervisor';

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {displayName} 👋
            </Text>
            <Text style={[styles.userRole, { color: colors.textMuted }]}>
              Farm Supervisor
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
            >
              <IconSymbol name="bell.fill" size={20} color={colors.icon} />
              {announcements.filter(a => !a.read).length > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.notificationCount}>
                    {announcements.filter(a => !a.read).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
            >
              <IconSymbol name="questionmark.circle.fill" size={20} color={colors.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Avatar
                source={user?.profileImage}
                name={user?.fullName || user?.name || "Supervisor"}
                size={44}
                status="online"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: colors.error }]}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Progress Card */}
        <Card variant="elevated" style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.progressTitle, { color: colors.text }]}>Weekly Progress</Text>
              <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                {overview?.completedToday.value || 0} tasks completed today
              </Text>
            </View>
            <View style={[styles.progressCircle, { borderColor: colors.primary }]}>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>
                {Math.round(((overview?.completedToday.value || 0) / (overview?.activeTasks.value || 1)) * 100)}%
              </Text>
            </View>
          </View>
          <ProgressBar 
            progress={Math.round(((overview?.completedToday.value || 0) / (overview?.activeTasks.value || 1)) * 100)} 
            height={10} 
            variant="primary" 
          />
        </Card>

        {/* Weather Widget */}
        <WeatherCard weather={weather} colors={colors} />

        {/* Stats Overview */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Active Tasks" 
            value={overview?.activeTasks.value.toString() || "--"} 
            trend={overview?.activeTasks.trend || ""}
            trendType={overview?.activeTasks.trendType}
            icon="checklist"
            colors={colors}
          />
          <StatCard 
            title="Workers" 
            value={overview?.workers.value.toString() || "--"} 
            trend={overview?.workers.trend || ""}
            trendType={overview?.workers.trendType}
            icon="person.2.fill"
            colors={colors}
          />
          <StatCard 
            title="Completed" 
            value={overview?.completedToday.value.toString() || "--"} 
            trend={overview?.completedToday.trend || ""}
            trendType={overview?.completedToday.trendType}
            icon="checkmark.circle.fill"
            colors={colors}
          />
          <StatCard 
            title="Pending" 
            value={overview?.pendingApprovals.value.toString() || "--"} 
            trend={overview?.pendingApprovals.trend || ""}
            trendType={overview?.pendingApprovals.trendType}
            icon="clock.fill"
            colors={colors}
          />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity onPress={() => router.push("/create-form")}>
            <Card variant="elevated" style={[styles.actionCard, { backgroundColor: colors.primary }]}>
              <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
              <Text style={styles.actionTitle}>Create Task</Text>
              <Text style={styles.actionSubtitle}>Assign new work</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/reports")}>
            <Card variant="elevated" style={[styles.actionCard, { backgroundColor: colors.info }]}>
              <IconSymbol name="doc.text.fill" size={28} color="#FFFFFF" />
              <Text style={styles.actionTitle}>View Reports</Text>
              <Text style={styles.actionSubtitle}>Check progress</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/workers")}>
            <Card variant="elevated" style={[styles.actionCard, { backgroundColor: '#7B1FA2' }]}>
              <IconSymbol name="person.2.fill" size={28} color="#FFFFFF" />
              <Text style={styles.actionTitle}>Manage Team</Text>
              <Text style={styles.actionSubtitle}>Team overview</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/ai-recommendations")}>
            <Card variant="elevated" style={[styles.actionCard, { backgroundColor: '#00897B' }]}>
              <IconSymbol name="brain.head.profile" size={28} color="#FFFFFF" />
              <Text style={styles.actionTitle}>AI Insights</Text>
              <Text style={styles.actionSubtitle}>Smart suggestions</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Announcements */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>📢 Announcements</Text>
          {announcements.filter(a => !a.read).length > 0 && (
            <Badge 
              label={`${announcements.filter(a => !a.read).length} new`} 
              variant="error" 
              size="sm" 
            />
          )}
        </View>
        <AnnouncementsList announcements={announcements} colors={colors} />

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>🕐 Recent Activity</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ActivityList activities={recentActivity} colors={colors} />

      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- COMPONENTS ---------- */

function WeatherCard({ weather, colors }: { weather: WeatherData | null; colors: typeof Colors.light }) {
  if (!weather) {
    return (
      <Card variant="elevated" style={[styles.weatherCard, { backgroundColor: '#1976D2' }]}>
        <Text style={styles.weatherPlaceholder}>Weather data unavailable</Text>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={[styles.weatherCard, { backgroundColor: '#1976D2' }]} padding="lg">
      <View style={styles.weatherContent}>
        <View style={styles.weatherLeft}>
          <View style={styles.weatherIconContainer}>
            <IconSymbol name="sun.max.fill" size={48} color="#FFD93D" />
          </View>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
            <Text style={styles.weatherDesc}>{weather.condition}</Text>
          </View>
        </View>

        <View style={styles.weatherRight}>
          <Text style={styles.weatherLocation}>{weather.location}</Text>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetailItem}>
              <IconSymbol name="drop.fill" size={14} color="#E3F2FD" />
              <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <IconSymbol name="wind" size={14} color="#E3F2FD" />
              <Text style={styles.weatherDetailText}>{weather.windSpeed} km/h</Text>
            </View>
          </View>
        </View>
      </View>

      {weather.forecast && weather.forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          {weather.forecast.map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{day.day}</Text>
              <Text style={styles.forecastTemp}>{day.temp}°</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function StatCard({
  title,
  value,
  trend,
  trendType = 'status',
  icon,
  colors,
}: {
  title: string;
  value: string;
  trend: string;
  trendType?: 'increase' | 'decrease' | 'status' | 'warning' | 'info';
  icon: string;
  colors: typeof Colors.light;
}) {
  const getIconBgColor = () => {
    switch (trendType) {
      case 'increase': return colors.successLight;
      case 'decrease': return colors.errorLight;
      case 'warning': return colors.warningLight;
      case 'info': return colors.infoLight;
      default: return colors.primaryLight;
    }
  };

  const getIconColor = () => {
    switch (trendType) {
      case 'increase': return colors.success;
      case 'decrease': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.primary;
    }
  };

  return (
    <Card variant="elevated" style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: getIconBgColor() }]}>
        <IconSymbol name={icon as any} size={22} color={getIconColor()} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.statTrend, { color: getIconColor() }]}>{trend}</Text>
    </Card>
  );
}

function AnnouncementsList({ announcements, colors }: { announcements: Announcement[]; colors: typeof Colors.light }) {
  if (announcements.length === 0) {
    return (
      <Card variant="elevated" style={styles.listCard}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No announcements</Text>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.success;
    }
  };

  return (
    <Card variant="elevated" style={styles.listCard}>
      {announcements.slice(0, 3).map((announcement, index) => (
        <View 
          key={announcement.id} 
          style={[
            styles.listItem,
            !announcement.read && { backgroundColor: colors.infoLight },
            index < announcements.length - 1 && styles.itemBorder,
          ]}
        >
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(announcement.priority) }]} />
          <View style={styles.listItemContent}>
            <View style={styles.listItemHeader}>
              <Text style={[styles.listItemTitle, { color: colors.text }]}>{announcement.title}</Text>
              {!announcement.read && <View style={[styles.unreadDot, { backgroundColor: colors.info }]} />}
            </View>
            <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>{announcement.subtitle}</Text>
            <Text style={[styles.listItemTime, { color: colors.textMuted }]}>{announcement.time}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

function ActivityList({ activities, colors }: { activities: Activity[]; colors: typeof Colors.light }) {
  if (activities.length === 0) {
    return (
      <Card variant="elevated" style={styles.listCard}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent activity</Text>
      </Card>
    );
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_complete': return colors.success;
      case 'assignment': return colors.info;
      case 'maintenance': return colors.warning;
      case 'task_created': return '#9C27B0';
      default: return colors.textMuted;
    }
  };

  return (
    <Card variant="elevated" style={styles.listCard}>
      {activities.slice(0, 4).map((activity, index) => (
        <View 
          key={activity.id} 
          style={[
            styles.listItem,
            index < activities.length - 1 && styles.itemBorder,
          ]}
        >
          <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
            <IconSymbol name={activity.icon as any || "checkmark.circle.fill"} size={16} color="#FFFFFF" />
          </View>
          <View style={styles.listItemContent}>
            <Text style={[styles.listItemTitle, { color: colors.text }]}>{activity.title}</Text>
            <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>{activity.subtitle}</Text>
            <View style={styles.activityMeta}>
              <Text style={[styles.listItemTime, { color: colors.textMuted }]}>{activity.time}</Text>
              <Text style={[styles.activityUser, { color: colors.textMuted }]}>by {activity.user}</Text>
            </View>
          </View>
        </View>
      ))}
    </Card>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greeting: {
    fontSize: FontSizes.md,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  userRole: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },

  // Progress Card
  progressCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  progressSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },

  // Weather
  weatherCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  weatherPlaceholder: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: FontSizes.md,
    padding: Spacing.lg,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherInfo: {
    marginLeft: Spacing.md,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  weatherDesc: {
    color: '#E3F2FD',
    fontSize: FontSizes.md,
  },
  weatherRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  weatherLocation: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  weatherDetails: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    color: '#BBDEFB',
    fontSize: FontSizes.xs,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastDay: {
    color: '#BBDEFB',
    fontSize: FontSizes.xs,
  },
  forecastTemp: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },

  // Section
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm) / 2,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  statTitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  statTrend: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm) / 2,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
    marginTop: Spacing.sm,
    fontSize: FontSizes.sm,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.xs,
    marginTop: 2,
  },

  // Lists
  listCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listItemTitle: {
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.md,
  },
  listItemSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  listItemTime: {
    fontSize: FontSizes.xs,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  activityUser: {
    fontSize: FontSizes.xs,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});
