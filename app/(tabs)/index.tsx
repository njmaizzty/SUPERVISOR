import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { AIRecommendationWidget } from "@/components/AIRecommendationWidget";
// import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header with Beautiful Background */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || "Supervisor"}</Text>
              <Text style={styles.userRole}>Farm Supervisor</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <IconSymbol name="house.fill" size={22} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton}>
                <IconSymbol name="house.fill" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Weather Widget */}
        <View style={styles.weatherContainer}>
          <View style={styles.weatherCard}>
            <View style={styles.weatherContent}>
              <View style={styles.weatherLeft}>
                <IconSymbol name="house.fill" size={32} color="#FFFFFF" />
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>28°C</Text>
                  <Text style={styles.weatherDesc}>Sunny</Text>
                </View>
              </View>
              <View style={styles.weatherRight}>
                <Text style={styles.weatherLocation}>Farm Location</Text>
                <Text style={styles.weatherHumidity}>Humidity: 65%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📊 Todays Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Active Tasks"
              value="12"
              icon="house.fill"
              gradient={["#4CAF50", "#66BB6A"]}
              trend="+2"
            />
            <StatCard
              title="Workers"
              value="8"
              icon="house.fill"
              gradient={["#2196F3", "#42A5F5"]}
              trend="online"
            />
            <StatCard
              title="Maintenance"
              value="3"
              icon="house.fill"
              gradient={["#FF9800", "#FFB74D"]}
              trend="due"
            />
            <StatCard
              title="Areas"
              value="5"
              icon="house.fill"
              gradient={["#9C27B0", "#BA68C8"]}
              trend="active"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              title="Create Task"
              subtitle="Assign new work"
              icon="house.fill"
              gradient={["#4CAF50", "#66BB6A"]}
            />
            <TouchableOpacity onPress={() => router.push("/reports")}>
              <ActionCard
                title="View Reports"
                subtitle="Check progress"
                icon="house.fill"
                gradient={["#2196F3", "#42A5F5"]}
              />
            </TouchableOpacity>
            <ActionCard
              title="Manage Workers"
              subtitle="Team overview"
              icon="house.fill"
              gradient={["#FF9800", "#FFB74D"]}
            />
            <ActionCard
              title="Asset Status"
              subtitle="Equipment check"
              icon="house.fill"
              gradient={["#9C27B0", "#BA68C8"]}
            />
          </View>
        </View>

        {/* AI Recommendations */}
        <AIRecommendationWidget maxRecommendations={3} />

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>🕐 Recent Activity</Text>
          <View style={styles.activityCard}>
            <ActivityItem
              title="Task Completed"
              subtitle="Tree pruning in Block A-1 finished successfully"
              time="2 hours ago"
              icon="house.fill"
              iconColor="#4CAF50"
            />
            <ActivityItem
              title="Worker Assigned"
              subtitle="John Smith assigned to irrigation maintenance"
              time="4 hours ago"
              icon="house.fill"
              iconColor="#2196F3"
            />
            <ActivityItem
              title="Maintenance Alert"
              subtitle="Tractor #3 requires scheduled service"
              time="1 day ago"
              icon="house.fill"
              iconColor="#FF9800"
            />
            <ActivityItem
              title="New Area Added"
              subtitle="Block C-4 registered in system"
              time="2 days ago"
              icon="house.fill"
              iconColor="#9C27B0"
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  gradient: string[];
  trend: string;
}) {
  const getStatColor = (index: number) => {
    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"];
    return colors[index % colors.length];
  };

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: gradient[0] }]}
      activeOpacity={0.8}
    >
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <IconSymbol name={icon} size={28} color="#FFFFFF" />
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Action Card Component
function ActionCard({
  title,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  subtitle: string;
  icon: any;
  gradient: string[];
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: gradient[0] }]}
      activeOpacity={0.8}
    >
      <View style={styles.actionContent}>
        <IconSymbol name={icon} size={32} color="#FFFFFF" />
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Activity Item Component
function ActivityItem({
  title,
  subtitle,
  time,
  icon,
  iconColor,
}: {
  title: string;
  subtitle: string;
  time: string;
  icon: any;
  iconColor: string;
}) {
  return (
    <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
      <View
        style={[styles.activityIcon, { backgroundColor: iconColor + "15" }]}
      >
        <IconSymbol name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      <IconSymbol name="chevron.right" size={16} color="#CCCCCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFE",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: "#2E7D32",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#E8F5E8",
    fontWeight: "400",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#C8E6C9",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF5722",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#F8FAFE",
  },
  weatherContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  weatherCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#1976D2",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  weatherContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherInfo: {
    marginLeft: 16,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  weatherDesc: {
    fontSize: 14,
    color: "#E3F2FD",
  },
  weatherRight: {
    alignItems: "flex-end",
  },
  weatherLocation: {
    fontSize: 14,
    color: "#E3F2FD",
    fontWeight: "500",
  },
  weatherHumidity: {
    fontSize: 12,
    color: "#BBDEFB",
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statContent: {
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  trendBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionContent: {
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  activityContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A237E",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#999999",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 32,
  },
});
