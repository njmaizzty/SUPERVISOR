import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');

  const periods = ['Today', 'This Week', 'This Month', 'This Quarter'];

  // Mock report data
  const reportData = {
    summary: {
      totalTasks: 45,
      completedTasks: 32,
      activeWorkers: 8,
      totalAssets: 15,
      maintenanceDue: 3,
      areasManaged: 5,
    },
    productivity: {
      taskCompletionRate: 71,
      averageTaskTime: 2.3,
      workerEfficiency: 85,
      assetUtilization: 78,
    },
    trends: {
      tasksThisWeek: [5, 8, 12, 15, 18, 22, 25],
      completionRate: [65, 68, 71, 73, 71, 69, 71],
    },
  };

  const ReportCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color, 
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    color: string;
    trend?: string;
  }) => (
    <View style={[styles.reportCard, { backgroundColor: color + '10' }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
          <IconSymbol name={icon} size={20} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <IconSymbol 
              name="house.fill" 
              size={12} 
              color={trend.startsWith('+') ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[
              styles.trendText,
              { color: trend.startsWith('+') ? '#4CAF50' : '#F44336' }
            ]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  );

  const SimpleBarChart = ({ data, color }: { data: number[]; color: string }) => (
    <View style={styles.barChart}>
      {data.map((value, index) => (
        <View key={index} style={styles.barContainer}>
          <View 
            style={[
              styles.bar, 
              { 
                height: (value / Math.max(...data)) * 60,
                backgroundColor: color 
              }
            ]} 
          />
          <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity
          style={styles.exportButton}
          activeOpacity={0.7}
        >
          <IconSymbol name="house.fill" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <View style={styles.periodContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodScroll}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodTab,
                  selectedPeriod === period && styles.periodTabActive
                ]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Overview</Text>
          <View style={styles.cardsGrid}>
            <ReportCard
              title="Total Tasks"
              value={reportData.summary.totalTasks}
              subtitle="All assigned tasks"
              icon="house.fill"
              color="#2196F3"
              trend="+12%"
            />
            <ReportCard
              title="Completed"
              value={reportData.summary.completedTasks}
              subtitle="Tasks finished"
              icon="house.fill"
              color="#4CAF50"
              trend="+8%"
            />
            <ReportCard
              title="Active Workers"
              value={reportData.summary.activeWorkers}
              subtitle="Currently working"
              icon="person.fill"
              color="#FF9800"
              trend="+2"
            />
            <ReportCard
              title="Assets"
              value={reportData.summary.totalAssets}
              subtitle="Total equipment"
              icon="house.fill"
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Task Completion Rate</Text>
                <Text style={styles.performanceValue}>{reportData.productivity.taskCompletionRate}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${reportData.productivity.taskCompletionRate}%`,
                      backgroundColor: '#4CAF50'
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Worker Efficiency</Text>
                <Text style={styles.performanceValue}>{reportData.productivity.workerEfficiency}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${reportData.productivity.workerEfficiency}%`,
                      backgroundColor: '#2196F3'
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Asset Utilization</Text>
                <Text style={styles.performanceValue}>{reportData.productivity.assetUtilization}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${reportData.productivity.assetUtilization}%`,
                      backgroundColor: '#FF9800'
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Trends</Text>
          
          <ChartCard title="Tasks Completed This Week">
            <SimpleBarChart data={reportData.trends.tasksThisWeek} color="#4CAF50" />
          </ChartCard>

          <ChartCard title="Completion Rate Trend">
            <SimpleBarChart data={reportData.trends.completionRate} color="#2196F3" />
          </ChartCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <IconSymbol name="house.fill" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Export Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <IconSymbol name="house.fill" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Schedule Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <IconSymbol name="house.fill" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Custom Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
              <IconSymbol name="house.fill" size={24} color="#2E7D32" />
              <Text style={styles.actionText}>Share Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  periodContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  periodScroll: {
    paddingHorizontal: 24,
  },
  periodTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  periodTabActive: {
    backgroundColor: '#2E7D32',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportCard: {
    width: (width - 72) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  performanceGrid: {
    gap: 16,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: (width - 72) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});
