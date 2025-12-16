import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data for tasks
const mockTasks = [
  {
    id: '1',
    title: 'Tree Pruning - Block A',
    description: 'Prune apple trees in the northern section of Block A',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'John Smith',
    assignedToId: 'worker1',
    startDate: '2024-11-29',
    endDate: '2024-12-01',
    progress: 65,
    assetId: 'asset1',
    assetName: 'Pruning Shears Set',
    category: 'Maintenance',
  },
  {
    id: '2',
    title: 'Irrigation System Check',
    description: 'Inspect and test all irrigation lines in Block B',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Maria Garcia',
    assignedToId: 'worker2',
    startDate: '2024-12-02',
    endDate: '2024-12-03',
    progress: 0,
    assetId: 'asset2',
    assetName: 'Irrigation Controller',
    category: 'Inspection',
  },
  {
    id: '3',
    title: 'Fertilizer Application',
    description: 'Apply organic fertilizer to citrus trees in Block C',
    status: 'Completed',
    priority: 'High',
    assignedTo: 'Carlos Rodriguez',
    assignedToId: 'worker3',
    startDate: '2024-11-25',
    endDate: '2024-11-27',
    progress: 100,
    assetId: 'asset3',
    assetName: 'Fertilizer Spreader',
    category: 'Treatment',
  },
  {
    id: '4',
    title: 'Pest Control Inspection',
    description: 'Check for pest damage and apply treatments as needed',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Ana Martinez',
    assignedToId: 'worker4',
    startDate: '2024-11-28',
    endDate: '2024-11-30',
    progress: 30,
    assetId: 'asset4',
    assetName: 'Spray Equipment',
    category: 'Treatment',
  },
  {
    id: '5',
    title: 'Soil Testing',
    description: 'Collect soil samples from all blocks for nutrient analysis',
    status: 'Pending',
    priority: 'Low',
    assignedTo: 'David Wilson',
    assignedToId: 'worker5',
    startDate: '2024-12-05',
    endDate: '2024-12-07',
    progress: 0,
    assetId: 'asset5',
    assetName: 'Soil Testing Kit',
    category: 'Analysis',
  },
];

export default function TasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filters = ['All', 'Pending', 'In Progress', 'Completed'];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || task.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#2196F3';
      case 'Pending': return '#FF9800';
      default: return '#666666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#666666';
    }
  };

  const handleCreateTask = () => {
    router.push('/create-form?type=task');
  };

  const handleTaskPress = (task: any) => {
    router.push(`/task-details?taskId=${task.id}`);
  };

  const renderTaskCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.taskCard} 
      onPress={() => handleTaskPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.taskDetails}>
        <View style={styles.taskDetailRow}>
          <IconSymbol name="person.fill" size={16} color="#666666" />
          <Text style={styles.taskDetailText}>{item.assignedTo}</Text>
        </View>
        <View style={styles.taskDetailRow}>
          <IconSymbol name="house.fill" size={16} color="#666666" />
          <Text style={styles.taskDetailText}>{item.assetName}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: getStatusColor(item.status)
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.taskFooter}>
        <Text style={styles.taskDate}>
          {item.startDate} - {item.endDate}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.aiButton}
              onPress={() => router.push('/ai-recommendations')}
              activeOpacity={0.8}
            >
              <IconSymbol name="brain.head.profile" size={20} color="#9C27B0" />
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateTask}
              activeOpacity={0.8}
            >
              <IconSymbol name="house.fill" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="house.fill" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, workers, or assets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
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

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="house.fill" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  aiBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterTabActive: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 24,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    flex: 1,
    marginRight: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskDetailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: '#1A237E',
    fontWeight: 'bold',
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
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#999999',
  },
  categoryBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '500',
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
});
