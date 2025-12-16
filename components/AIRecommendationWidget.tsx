import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { aiRecommendationService, Recommendation } from '@/services/aiRecommendations';

const { width } = Dimensions.get('window');

interface AIRecommendationWidgetProps {
  maxRecommendations?: number;
}

export const AIRecommendationWidget: React.FC<AIRecommendationWidgetProps> = ({ 
  maxRecommendations = 3 
}) => {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const recs = await aiRecommendationService.getRecommendations();
      // Get top priority recommendations
      const topRecs = recs
        .filter(rec => rec.priority === 'high')
        .slice(0, maxRecommendations);
      setRecommendations(topRecs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
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

  const renderRecommendationItem = (recommendation: Recommendation, index: number) => (
    <TouchableOpacity
      key={recommendation.id}
      style={[styles.recommendationItem, index < recommendations.length - 1 && styles.itemBorder]}
      onPress={() => router.push('/ai-recommendations')}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.itemIcon, { backgroundColor: getTypeColor(recommendation.type) + '20' }]}>
          <IconSymbol 
            name={getTypeIcon(recommendation.type)} 
            size={16} 
            color={getTypeColor(recommendation.type)} 
          />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {recommendation.title}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {recommendation.description}
          </Text>
          <View style={styles.itemMeta}>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>{recommendation.confidence}% confidence</Text>
            </View>
            {recommendation.estimatedSavings && (
              <Text style={styles.savingsText}>Save: {recommendation.estimatedSavings}</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.itemRight}>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(recommendation.priority) }]} />
        <IconSymbol name="chevron.right" size={16} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <IconSymbol name="house.fill" size={20} color="#9C27B0" />
            </View>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#9C27B0" />
          <Text style={styles.loadingText}>AI is analyzing...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => router.push('/ai-recommendations')}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <IconSymbol name="brain.head.profile" size={20} color="#9C27B0" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              {recommendations.length} high priority insight{recommendations.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.aiPulse}>
            <View style={styles.aiPulseInner} />
          </View>
          <IconSymbol name="chevron.right" size={16} color="#9C27B0" />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        {recommendations.length > 0 ? (
          recommendations.map(renderRecommendationItem)
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="house.fill" size={32} color="#CCCCCC" />
            <Text style={styles.emptyText}>No urgent recommendations</Text>
            <Text style={styles.emptySubtext}>AI is monitoring your operations</Text>
          </View>
        )}
      </View>

      {recommendations.length > 0 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/ai-recommendations')}
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllText}>View All Recommendations</Text>
          <IconSymbol name="house.fill" size={14} color="#9C27B0" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3E5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7B1FA2',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiPulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '500',
  },
  savingsText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9C27B0',
  },
});
