import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  fetchTasks,
  fetchRecommendedWorkers,
  fetchAreas,
  fetchAssets,
  createTask,
  deleteTask,
  type Task,
  type Worker,
  type Area,
  type Asset,
} from '@/services/taskService';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';


const { width } = Dimensions.get('window');

// Task types
const TASK_TYPES = [
  'General Work',
  'Harvesting',
  'Manuring',
  'Weeding',
  'Pest & Disease',
  'Mechanisation Fleet',
];

const TASK_SUBTYPES: Record<string, string[]> = {
  'General Work': [
    'Security Personnel',
    'Gardeners / Line Sweeper',
    'Mechanical Work',
    'Electrical Work',
    'Apprentice',
  ],
  'Harvesting': [
    'Harvester',
    'Loose Fruit Collection',
    'Pruning',
  ],
  'Manuring': [
    'Fertilizer Application',
    'Transporting Fertilizers',
  ],
  'Weeding': [
    'Circle / Path',
    'Selective',
    'Blanket',
  ],
  'Pest & Disease': [
    'Pest & Disease Census',
    'Pest & Disease Control',
  ],
  'Mechanisation Fleet': [
    'Badang A',
    'Badang B',
    'Badang C',
    'Tractor A',
  ],
};

export default function TasksScreen() {
  const router = useRouter();

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [taskType, setTaskType] = useState('');
  const [taskSubType, setTaskSubType] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [recommendedWorkers, setRecommendedWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // Date picker states for mobile
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const filters = ['All', 'Pending', 'In Progress', 'Completed'];

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [tasksRes, areasRes, assetsRes] = await Promise.all([
        fetchTasks({ status: selectedFilter === 'All' ? undefined : selectedFilter }),
        fetchAreas(),
        fetchAssets(),
      ]);

      if (tasksRes.success && tasksRes.data) {
        setTasks(tasksRes.data);
      }
      if (areasRes.success && areasRes.data) {
        setAreas(areasRes.data);
      }
      if (assetsRes.success && assetsRes.data) {
        setAssets(assetsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (task.assigned_to_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || task.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Status & Priority colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#2196F3';
      case 'Pending': return '#FF9800';
      case 'Cancelled': return '#9E9E9E';
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

  // Handle task type selection - fetch recommended workers
  const handleTaskTypeSelect = async (type: string) => {
    setTaskType(type);
    setTaskSubType('');
    setSelectedWorker(null);

    const response = await fetchRecommendedWorkers(type);
    if (response.success && response.data) {
      setRecommendedWorkers(response.data);
    } else {
      setRecommendedWorkers([]);
    }
  };

  // Reset form
  const resetForm = () => {
    setTaskType('');
    setTaskSubType('');
    setPriority('Medium');
    setStartDate(null);
    setEndDate(null);
    setSelectedArea(null);
    setSelectedAsset(null);
    setSelectedWorker(null);
    setRecommendedWorkers([]);
  };

  // Helper for cross-platform alerts
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Handle task creation
  const handleCreateTask = async () => {
    // Validation
    if (!taskType) {
      showAlert('Missing Info', 'Please select a task type.');
      return;
    }
    if (!taskSubType) {
      showAlert('Missing Info', 'Please select a task detail.');
      return;
    }
    if (!selectedWorker) {
      showAlert('Missing Info', 'Please select a worker.');
      return;
    }
    if (!startDate) {
      showAlert('Missing Info', 'Please select a start date.');
      return;
    }
    if (!endDate) {
      showAlert('Missing Info', 'Please select an end date.');
      return;
    }
    if (!selectedArea) {
      showAlert('Missing Info', 'Please select an area/block.');
      return;
    }
    if (!selectedAsset) {
      showAlert('Missing Info', 'Please select an asset/equipment.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createTask({
        title: `${taskType} - ${taskSubType} - ${selectedArea.name}`,
        description: `Assigned to ${selectedWorker.name}`,
        taskType: taskType,
        taskSubtype: taskSubType,
        priority: priority,
        assignedToId: selectedWorker.id,
        assignedToName: selectedWorker.name,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        areaId: selectedArea.id,
        areaName: selectedArea.name,
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        createdBy: 'Supervisor',
      });

      if (response.success && response.data) {
        // Add new task to the list
        setTasks(prev => [response.data!, ...prev]);
        resetForm();
        setShowCreateModal(false);
        showAlert('Success', `Task assigned to ${selectedWorker.name}!`);
      } else {
        showAlert('Error', response.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Task creation error:', error);
      showAlert('Error', 'Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (task: Task) => {
    const confirmDelete = () => {
      return new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          resolve(window.confirm(`Are you sure you want to delete "${task.title}"?`));
        } else {
          Alert.alert(
            'Delete Task',
            `Are you sure you want to delete "${task.title}"?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        }
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      const response = await deleteTask(task.id);
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== task.id));
        if (Platform.OS === 'web') {
          alert('Task deleted successfully!');
        } else {
          Alert.alert('Success', 'Task deleted successfully!');
        }
      } else {
        if (Platform.OS === 'web') {
          alert(response.error || 'Failed to delete task');
        } else {
          Alert.alert('Error', response.error || 'Failed to delete task');
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to delete task. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete task. Please try again.');
      }
    }
  };

  // Render Task Card
  const renderTaskCard = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity 
        style={styles.taskCardContent}
        onPress={() => router.push(`/task-details?taskId=${item.id}`)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.taskDetails}>
          <View style={styles.taskDetailRow}>
            <IconSymbol name="person.fill" size={16} color="#666666" />
            <Text style={styles.taskDetailText}>{item.assigned_to_name || 'Unassigned'}</Text>
          </View>
          <View style={styles.taskDetailRow}>
            <IconSymbol name="map.fill" size={16} color="#666666" />
            <Text style={styles.taskDetailText}>{item.area_name || 'No area'}</Text>
          </View>
        </View>
        <View style={styles.taskMeta}>
          <View style={styles.taskMetaItem}>
            <IconSymbol name="calendar" size={14} color="#999" />
            <Text style={styles.taskMetaText}>
              {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
          {item.asset_name && (
            <View style={styles.taskMetaItem}>
              <IconSymbol name="wrench.fill" size={14} color="#999" />
              <Text style={styles.taskMetaText}>{item.asset_name}</Text>
            </View>
          )}
        </View>
        {item.status === 'In Progress' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item)}
      >
        <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, workers, or areas"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="tray.fill" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>Create a new task to get started</Text>
          </View>
        }
      />

      {/* Create Task Modal */}
      <Modal visible={showCreateModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
              >
                <IconSymbol name="chevron.left" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create & Assign Task</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Task Type */}
            <Text style={styles.label}>Task Type *</Text>
            <View style={styles.optionsContainer}>
              {TASK_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.optionButton, taskType === type && styles.optionButtonActive]}
                  onPress={() => handleTaskTypeSelect(type)}
                >
                  <Text style={[styles.optionText, taskType === type && styles.optionTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Task Subtype */}
            {taskType && TASK_SUBTYPES[taskType] && (
              <>
                <Text style={styles.label}>Task Detail *</Text>
                <View style={styles.optionsContainer}>
                  {TASK_SUBTYPES[taskType].map(sub => (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.optionButton, taskSubType === sub && styles.optionButtonActive]}
                      onPress={() => setTaskSubType(sub)}
                    >
                      <Text style={[styles.optionText, taskSubType === sub && styles.optionTextActive]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* AI Recommended Workers */}
            {recommendedWorkers.length > 0 && (
              <View style={styles.aiSection}>
                <View style={styles.aiHeader}>
                  <View style={styles.aiIconContainer}>
                    <IconSymbol name="sparkles" size={20} color="#9C27B0" />
                  </View>
                  <View>
                    <Text style={styles.aiTitle}>AI Recommended Workers</Text>
                    <Text style={styles.aiSubtitle}>Based on skills, availability & performance</Text>
                  </View>
                </View>
                {recommendedWorkers.map((worker, index) => (
                  <TouchableOpacity
                    key={worker.id}
                    style={[
                      styles.workerCard, 
                      selectedWorker?.id === worker.id && styles.workerCardSelected,
                      index === 0 && styles.topRecommendation
                    ]}
                    onPress={() => setSelectedWorker(worker)}
                  >
                    <View style={styles.workerCardHeader}>
                      <View style={styles.workerNameRow}>
                        <Text style={styles.workerName}>{worker.name}</Text>
                        {index === 0 && (
                          <View style={styles.topBadge}>
                            <Text style={styles.topBadgeText}>Top Match</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Match</Text>
                        <Text style={styles.scoreValue}>{worker.suitability_score ?? 0}%</Text>
                      </View>
                    </View>
                    <View style={styles.workerMetrics}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Availability</Text>
                        <Text style={[
                          styles.metricValue,
                          { color: worker.availability === 'Available' ? '#4CAF50' : '#FF9800' }
                        ]}>
                          {worker.availability || 'Unknown'}
                        </Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Experience</Text>
                        <Text style={styles.metricValue}>{worker.experience ?? 0} years</Text>
                      </View>
                    </View>
                    {worker.current_tasks && worker.current_tasks.length > 0 && (
                      <View style={styles.currentTasksContainer}>
                        <Text style={styles.currentTasksLabel}>Current Tasks:</Text>
                        <Text style={styles.currentTasksText}>
                          {worker.current_tasks.join(', ')}
                        </Text>
                      </View>
                    )}
                    {selectedWorker?.id === worker.id && (
                      <View style={styles.selectedIndicator}>
                        <IconSymbol name="checkmark.circle.fill" size={20} color="#2E7D32" />
                        <Text style={styles.selectedText}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Selected Worker Summary */}
            {selectedWorker && (
              <View style={styles.summaryBox}>
                <IconSymbol name="person.fill" size={16} color="#2E7D32" />
                <Text style={styles.summaryText}>Assigned to: {selectedWorker.name}</Text>
              </View>
            )}

            {/* Priority */}
            <Text style={styles.label}>Priority *</Text>
            <View style={styles.priorityContainer}>
              {(['Low', 'Medium', 'High'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton, 
                    priority === p && styles.priorityButtonActive,
                    { borderColor: getPriorityColor(p) },
                    priority === p && { backgroundColor: getPriorityColor(p) }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.priorityButtonText, 
                    priority === p && styles.priorityButtonTextActive
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Start Date */}
            <Text style={styles.label}>Start Date *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <input
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const date = new Date(value + 'T00:00:00');
                      if (!isNaN(date.getTime())) {
                        setStartDate(date);
                      }
                    } else {
                      setStartDate(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: 14,
                    fontSize: 16,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    color: '#333',
                    cursor: 'pointer',
                  }}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color="#2E7D32" />
                  <Text style={[styles.datePickerButtonText, !startDate && styles.placeholderText]}>
                    {startDate 
                      ? startDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Select start date'
                    }
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                      setShowStartDatePicker(Platform.OS === 'ios');
                      if (event.type === 'set' && selectedDate) {
                        setStartDate(selectedDate);
                        // Reset end date if it's before start date
                        if (endDate && selectedDate > endDate) {
                          setEndDate(null);
                        }
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </>
            )}
            {startDate && Platform.OS === 'web' && (
              <Text style={styles.dateDisplayText}>
                ✓ {startDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            )}

            {/* End Date */}
            <Text style={styles.label}>End Date *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <input
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const date = new Date(value + 'T00:00:00');
                      if (!isNaN(date.getTime())) {
                        setEndDate(date);
                      }
                    } else {
                      setEndDate(null);
                    }
                  }}
                  min={startDate ? startDate.toISOString().split('T')[0] : undefined}
                  style={{
                    width: '100%',
                    padding: 14,
                    fontSize: 16,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    color: '#333',
                    cursor: 'pointer',
                  }}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color="#2E7D32" />
                  <Text style={[styles.datePickerButtonText, !endDate && styles.placeholderText]}>
                    {endDate 
                      ? endDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Select end date'
                    }
                  </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate || startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                      setShowEndDatePicker(Platform.OS === 'ios');
                      if (event.type === 'set' && selectedDate) {
                        setEndDate(selectedDate);
                      }
                    }}
                    minimumDate={startDate || new Date()}
                  />
                )}
              </>
            )}
            {endDate && Platform.OS === 'web' && (
              <Text style={styles.dateDisplayText}>
                ✓ {endDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            )}

            {/* Area / Block */}
            <Text style={styles.label}>Area / Block *</Text>
            <View style={styles.optionsContainer}>
              {areas.map(area => (
                <TouchableOpacity
                  key={area.id}
                  style={[styles.optionButton, selectedArea?.id === area.id && styles.optionButtonActive]}
                  onPress={() => setSelectedArea(area)}
                >
                  <Text style={[styles.optionText, selectedArea?.id === area.id && styles.optionTextActive]}>
                    {area.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Asset / Equipment */}
            <Text style={styles.label}>Asset / Equipment *</Text>
            <View style={styles.optionsContainer}>
              {assets.map(asset => (
                <TouchableOpacity
                  key={asset.id}
                  style={[styles.optionButton, selectedAsset?.id === asset.id && styles.optionButtonActive]}
                  onPress={() => setSelectedAsset(asset)}
                >
                  <Text style={[styles.optionText, selectedAsset?.id === asset.id && styles.optionTextActive]}>
                    {asset.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Asset Summary */}
            {selectedAsset && (
              <View style={styles.summaryBox}>
                <IconSymbol name="wrench.fill" size={16} color="#2E7D32" />
                <Text style={styles.summaryText}>Using: {selectedAsset.name}</Text>
              </View>
            )}

            {/* Create Button */}
            <TouchableOpacity 
              style={[styles.createTaskButton, submitting && styles.buttonDisabled]} 
              onPress={handleCreateTask}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.createTaskButtonText}>Create & Assign Task</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                resetForm();
                setShowCreateModal(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: '#F8FAFE',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 16,
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
    elevation: 4,
  },

  plusIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    marginTop: -2,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#333',
  },

  filterContainer: {
    flexDirection: 'row',
  },

  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },

  filterTabActive: {
    backgroundColor: '#2E7D32',
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listContainer: {
    padding: 24,
    paddingBottom: 100,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  taskCardContent: {
    flex: 1,
    padding: 20,
  },

  deleteButton: {
    backgroundColor: '#F44336',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  taskTitleRow: {
    flex: 1,
    marginRight: 12,
  },

  taskTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 6,
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  priorityText: {
    fontSize: 11,
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

  taskDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  taskDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },

  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskMetaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },

  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },

  modalContent: {
    padding: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  optionButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },

  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  optionTextActive: {
    color: '#FFFFFF',
  },

  // AI Section
  aiSection: {
    marginTop: 20,
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CE93D8',
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },

  aiSubtitle: {
    fontSize: 12,
    color: '#9C27B0',
    marginTop: 2,
  },

  workerCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  workerCardSelected: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
  },

  topRecommendation: {
    borderColor: '#9C27B0',
    borderWidth: 2,
  },

  workerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  workerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A237E',
  },

  topBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },

  topBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  scoreLabel: {
    fontSize: 10,
    color: '#7B1FA2',
    fontWeight: '500',
  },

  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },

  workerMetrics: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  metricItem: {
    flex: 1,
  },

  metricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },

  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  currentTasksContainer: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },

  currentTasksLabel: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '600',
  },

  currentTasksText: {
    fontSize: 12,
    color: '#E65100',
    marginTop: 2,
  },

  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  selectedText: {
    marginLeft: 6,
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },

  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },

  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },

  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  priorityButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },

  priorityButtonActive: {
    borderWidth: 2,
  },

  priorityButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },

  priorityButtonTextActive: {
    color: '#FFFFFF',
  },

  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  dateInputText: {
    fontSize: 15,
    color: '#333',
  },

  dateInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 4,
  },

  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    gap: 12,
  },

  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

  dateTextInput: {
    fontSize: 15,
    color: '#333',
  },

  dateDisplayText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 12,
    marginLeft: 4,
  },

  placeholderText: {
    color: '#999',
  },

  createTaskButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  createTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  cancelButton: {
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});
