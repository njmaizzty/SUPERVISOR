import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { aiRecommendationService, Recommendation, AIAnalytics } from '@/services/aiRecommendations';

const { width } = Dimensions.get('window');

export default function AIRecommendationsScreen() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [generating, setGenerating] = useState(false);

  const filters = ['All', 'High Priority', 'Task Assignment', 'Maintenance', 'Optimization'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recsData, analyticsData] = await Promise.all([
        aiRecommendationService.getRecommendations(),
        aiRecommendationService.getAnalytics()
      ]);
      setRecommendations(recsData);
      setAnalytics(analyticsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const generateNewRecommendations = async () => {
    try {
      setGenerating(true);
      const newRecs = await aiRecommendationService.generateNewRecommendations();
      await loadData(); // Reload all data
      Alert.alert(
        'AI Analysis Complete',
        `Generated ${newRecs.length} new recommendation${newRecs.length !== 1 ? 's' : ''} based on latest data patterns.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate new recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleImplement = async (recommendation: Recommendation) => {
    Alert.alert(
      'Implement Recommendation',
      `Are you sure you want to implement this recommendation?\n\n"${recommendation.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Implement',
          onPress: async () => {
            try {
              await aiRecommendationService.implementRecommendation(recommendation.id);
              Alert.alert('Success', 'Recommendation implemented successfully!');
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to implement recommendation');
            }
          }
        }
      ]
    );
  };

  const handleDismiss = async (recommendation: Recommendation) => {
    Alert.alert(
      'Dismiss Recommendation',
      'Are you sure you want to dismiss this recommendation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: async () => {
            try {
              await aiRecommendationService.dismissRecommendation(recommendation.id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to dismiss recommendation');
            }
          }
        }
      ]
    );
  };

  const getFilteredRecommendations = () => {
    switch (selectedFilter) {
      case 'High Priority':
        return recommendations.filter(rec => rec.priority === 'high');
      case 'Task Assignment':
        return recommendations.filter(rec => rec.type === 'task_assignment');
      case 'Maintenance':
        return recommendations.filter(rec => rec.type === 'maintenance');
      case 'Optimization':
        return recommendations.filter(rec => rec.type === 'optimization');
      default:
        return recommendations;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_assignment': return 'person.fill';
      case 'maintenance': return 'house.fill';
      case 'optimization': return 'gear.fill';
      case 'alert': return 'house.fill';
      case 'productivity': return 'chart.bar.fill';
      default: return 'house.fill';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task_assignment': return '#2196F3';
      case 'maintenance': return '#FF9800';
      case 'optimization': return '#4CAF50';
      case 'alert': return '#F44336';
      case 'productivity': return '#9C27B0';
      default: return '#666666';
    }
  };

  const renderRecommendationCard = (recommendation: Recommendation) => (
    <View key={recommendation.id} style={styles.recommendationCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(recommendation.type) + '20' }]}>
            <IconSymbol 
              name={getTypeIcon(recommendation.type)} 
              size={20} 
              color={getTypeColor(recommendation.type)} 
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>{recommendation.title}</Text>
            <Text style={styles.cardCategory}>{recommendation.category}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}>
          <Text style={styles.priorityText}>{recommendation.priority.toUpperCase()}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.cardDescription}>{recommendation.description}</Text>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { 
                  width: `${recommendation.confidence}%`,
                  backgroundColor: recommendation.confidence >= 80 ? '#4CAF50' : 
                                  recommendation.confidence >= 60 ? '#FF9800' : '#F44336'
                }
              ]} 
            />
          </View>
          <Text style={styles.metricValue}>{recommendation.confidence}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Impact</Text>
          <Text style={[styles.metricValue, { color: getTypeColor(recommendation.type) }]}>
            {recommendation.impact.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Benefits */}
      {(recommendation.estimatedSavings || recommendation.timeToImplement) && (
        <View style={styles.benefitsRow}>
          {recommendation.estimatedSavings && (
            <View style={styles.benefit}>
              <IconSymbol name="house.fill" size={14} color="#4CAF50" />
              <Text style={styles.benefitText}>Save: {recommendation.estimatedSavings}</Text>
            </View>
          )}
          {recommendation.timeToImplement && (
            <View style={styles.benefit}>
              <IconSymbol name="house.fill" size={14} color="#2196F3" />
              <Text style={styles.benefitText}>Time: {recommendation.timeToImplement}</Text>
            </View>
          )}
        </View>
      )}

      {/* AI Insight */}
      <View style={styles.aiInsightContainer}>
        <View style={styles.aiInsightHeader}>
          <IconSymbol name="sparkles" size={16} color="#9C27B0" />
          <Text style={styles.aiInsightLabel}>AI Insight</Text>
        </View>
        <Text style={styles.aiInsightText}>{recommendation.aiInsight}</Text>
      </View>

      {/* Actions */}
      {recommendation.actionable && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismiss(recommendation)}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.implementButton}
            onPress={() => handleImplement(recommendation)}
            activeOpacity={0.8}
          >
            <IconSymbol name="house.fill" size={16} color="#FFFFFF" />
            <Text style={styles.implementButtonText}>Implement</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>AI is analyzing your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <IconSymbol name="chevron.left" size={24} color="#9C27B0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Recommendations</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push('/ai-chat')}
            activeOpacity={0.8}
          >
            <IconSymbol name="wand.and.stars" size={18} color="#9C27B0" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={generateNewRecommendations}
            disabled={generating}
            activeOpacity={0.8}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="house.fill" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Analytics Summary */}
        {analytics && (
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsHeader}>
              <IconSymbol name="chart.bar.fill" size={24} color="#9C27B0" />
              <Text style={styles.analyticsTitle}>AI Performance</Text>
            </View>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.totalRecommendations}</Text>
                <Text style={styles.analyticsLabel}>Total Recommendations</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.implementedRecommendations}</Text>
                <Text style={styles.analyticsLabel}>Implemented</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.potentialSavings}</Text>
                <Text style={styles.analyticsLabel}>Potential Savings</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsValue}>{analytics.efficiencyGain}%</Text>
                <Text style={styles.analyticsLabel}>Efficiency Gain</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  selectedFilter === filter && styles.filterTabActive
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommendations List */}
        <View style={styles.recommendationsContainer}>
          {getFilteredRecommendations().length > 0 ? (
            getFilteredRecommendations().map(renderRecommendationCard)
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="house.fill" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No recommendations found</Text>
              <Text style={styles.emptySubtitle}>
                AI is continuously analyzing your data to provide intelligent insights
              </Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
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
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  scrollView: {
    flex: 1,
  },
  analyticsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginLeft: 8,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: (width - 88) / 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScroll: {
    paddingHorizontal: 24,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterTabActive: {
    backgroundColor: '#9C27B0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  recommendationsContainer: {
    padding: 24,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: '#666666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    marginRight: 16,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 4,
    fontWeight: '500',
  },
  aiInsightContainer: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiInsightLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginLeft: 4,
  },
  aiInsightText: {
    fontSize: 12,
    color: '#4A148C',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dismissButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  implementButton: {
    flex: 2,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  implementButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomSpacing: {
    height: 32,
  },
});
