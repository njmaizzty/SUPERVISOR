import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  createWorker,
  deleteWorker,
  fetchWorkers,
  updateWorker,
  type CreateWorkerPayload,
  type Worker,
} from '@/services/workerService';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
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

const { width } = Dimensions.get('window');

// Skill options
const SKILL_OPTIONS = [
  'Pruning',
  'Harvesting',
  'Weeding',
  'Spraying',
  'Pest & Disease',
  'Manuring',
  'Mechanisation Fleet',
  'Equipment Maintenance',
  'General Work',
];

// Position options
const POSITION_OPTIONS = [
  'General Worker',
  'Harvester',
  'Loose Fruit Collector',
  'Pruner',
  'Weeding Worker',
  'Fertilizer Worker',
  'Sprayer',
];

// Location options
const BLOCKS = Array.from({ length: 26 }, (_, i) => `Block ${String.fromCharCode(65 + i)}`); // Block A-Z

export default function WorkersScreen() {
  const router = useRouter();
  
  // Data states
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPosition, setFormPosition] = useState('Field Worker');
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formLocation, setFormLocation] = useState('Block A');
  const [formRemarks, setFormRemarks] = useState('');

  const filters = ['All', 'Available', 'Busy', 'Unavailable'];

  // Load workers from API
  const loadWorkers = useCallback(async () => {
    try {
      const response = await fetchWorkers();
      if (response.success && response.data) {
        setWorkers(response.data);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWorkers();
  }, [loadWorkers]);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || worker.availability === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return '#4CAF50';
      case 'Busy': return '#FF9800';
      case 'Unavailable': return '#F44336';
      default: return '#666666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50';
      case 'On Leave': return '#FF9800';
      case 'Inactive': return '#F44336';
      default: return '#666666';
    }
  };

  const handleCallWorker = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailWorker = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPosition('Field Worker');
    setFormSkills([]);
    setFormLocation('Block A');
    setFormRemarks('');
    setEditingWorker(null);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormName(worker.name);
    setFormEmail(worker.email);
    setFormPhone(worker.phone);
    setFormPosition(worker.position);
    setFormSkills(worker.skills || []);
    setFormLocation(worker.location);
    setFormRemarks(worker.remarks || '');
    setShowEditModal(true);
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setFormSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Create worker
  const handleCreateWorker = async () => {
    if (!formName.trim()) {
      showAlert('Error', 'Worker name is required');
      return;
    }
    if (!formEmail.trim()) {
      showAlert('Error', 'Email is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateWorkerPayload = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        position: formPosition,
        skills: formSkills.join(', '),
        location: formLocation,
        remarks: formRemarks.trim(),
      };

      const response = await createWorker(payload);
      if (response.success && response.data) {
        setWorkers(prev => [...prev, response.data!]);
        setShowCreateModal(false);
        resetForm();
        showAlert('Success', 'Worker added successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to create worker');
      }
    } catch (error) {
      showAlert('Error', 'Failed to create worker. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update worker
  const handleUpdateWorker = async () => {
    if (!editingWorker) return;
    
    if (!formName.trim()) {
      showAlert('Error', 'Worker name is required');
      return;
    }
    if (!formEmail.trim()) {
      showAlert('Error', 'Email is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        position: formPosition,
        skills: formSkills,
        location: formLocation,
        remarks: formRemarks.trim(),
      };

      const response = await updateWorker(editingWorker.id, payload);
      if (response.success && response.data) {
        setWorkers(prev => prev.map(w => w.id === editingWorker.id ? response.data! : w));
        setShowEditModal(false);
        resetForm();
        showAlert('Success', 'Worker updated successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to update worker');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update worker. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete worker
  const handleDeleteWorker = async (worker: Worker) => {
    const confirmDelete = async () => {
      if (Platform.OS === 'web') {
        return window.confirm(`Are you sure you want to delete "${worker.name}"?`);
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete Worker',
          `Are you sure you want to delete "${worker.name}"?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      const response = await deleteWorker(worker.id);
      if (response.success) {
        setWorkers(prev => prev.filter(w => w.id !== worker.id));
        showAlert('Success', 'Worker deleted successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to delete worker');
      }
    } catch (error) {
      showAlert('Error', 'Failed to delete worker. Please try again.');
    }
  };

  // Show alert (cross-platform)
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Render worker form modal
  const renderWorkerFormModal = (isEdit: boolean) => (
    <Modal 
      visible={isEdit ? showEditModal : showCreateModal} 
      animationType="slide"
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView 
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                isEdit ? setShowEditModal(false) : setShowCreateModal(false);
                resetForm();
              }}
            >
              <IconSymbol name="chevron.left" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEdit ? 'Edit Worker' : 'Add New Worker'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Name */}
          <Text style={styles.label}>Worker Name </Text>
          <TextInput
            style={styles.textInput}
            value={formName}
            onChangeText={setFormName}
            placeholder="Enter worker name"
            placeholderTextColor="#999"
          />

          {/* Email */}
          <Text style={styles.label}>Email </Text>
          <TextInput
            style={styles.textInput}
            value={formEmail}
            onChangeText={setFormEmail}
            placeholder="Enter email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={formPhone}
            onChangeText={setFormPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />

          {/* Position */}
          <Text style={styles.label}>Position</Text>
          <View style={styles.verticalOptionsContainer}>
            {POSITION_OPTIONS.map(pos => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.optionButton,
                  formPosition === pos && styles.optionButtonActive
                ]}
                onPress={() => setFormPosition(pos)}
              >
                <Text style={[
                  styles.optionText,
                  formPosition === pos && styles.optionTextActive
                ]}>
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Skills */}
          <Text style={styles.label}>Skills</Text>
          <View style={styles.verticalOptionsContainer}>
            {SKILL_OPTIONS.map(skill => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillButton,
                  formSkills.includes(skill) && styles.skillButtonActive
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text style={[
                  styles.skillButtonText,
                  formSkills.includes(skill) && styles.skillButtonTextActive
                ]}>
                  {skill}
                </Text>
                {formSkills.includes(skill) && (
                  <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Location */}
                
<Text style={styles.label}>Location</Text>
<View style={styles.blockContainer}>
  <ScrollView
    style={{ maxHeight: 200 }}
    showsVerticalScrollIndicator={true}
    nestedScrollEnabled
  >
    {BLOCKS.map((block) => (
      <TouchableOpacity
        key={block}
        style={[
          styles.blockItem,
          formLocation === block && styles.blockItemActive,
        ]}
        onPress={() => setFormLocation(block)}
      >
        <Text
          style={[
            styles.blockText,
            formLocation === block && styles.blockTextActive,
          ]}
        >
          {block}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>


          {/* Remarks */}
          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formRemarks}
            onChangeText={setFormRemarks}
            placeholder="Additional notes about the worker"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.buttonDisabled]} 
            onPress={isEdit ? handleUpdateWorker : handleCreateWorker}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol 
                  name={isEdit ? "checkmark.circle.fill" : "person.badge.plus"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.submitButtonText}>
                  {isEdit ? 'Update Worker' : 'Add Worker'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              isEdit ? setShowEditModal(false) : setShowCreateModal(false);
              resetForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderWorkerCard = ({ item }: { item: Worker }) => (
    <View style={styles.workerCard}>
      <TouchableOpacity 
        style={styles.workerCardContent}
        onPress={() => handleOpenEditModal(item)}
        activeOpacity={0.8}
      >
        <View style={styles.workerHeader}>
          <View style={styles.workerAvatar}>
            <IconSymbol name="person.fill" size={32} color="#2E7D32" />
          </View>
          <View style={styles.workerInfo}>
            <View style={styles.workerNameRow}>
              <Text style={styles.workerName}>{item.name}</Text>
              <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(item.availability) }]} />
            </View>
            <Text style={styles.workerPosition}>{item.position}</Text>
            <Text style={styles.workerEmail}>{item.email}</Text>
          </View>
          <View style={styles.workerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCallWorker(item.phone)}
              activeOpacity={0.7}
            >
              <IconSymbol name="phone.fill" size={20} color="#2E7D32" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEmailWorker(item.email)}
              activeOpacity={0.7}
            >
              <IconSymbol name="envelope.fill" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.workerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.hoursWorked}h</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.currentTasks}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.rating || '-'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.workerDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="location.fill" size={14} color="#666666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="phone.fill" size={14} color="#666666" />
            <Text style={styles.detailText}>{item.phone || 'No phone'}</Text>
          </View>
        </View>

        {item.skills && item.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Skills:</Text>
            <View style={styles.skillsList}>
              {item.skills.slice(0, 3).map((skill: string, index: number) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {item.skills.length > 3 && (
                <View style={styles.skillBadge}>
                  <Text style={styles.skillText}>+{item.skills.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.workerFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.joinDate}>Joined {item.joinDate}</Text>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteWorker(item)}
      >
        <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading workers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Workers</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleOpenCreateModal}
              activeOpacity={0.8}
            >
              <IconSymbol name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workers"
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

      {/* Workers List */}
      <FlatList
        data={filteredWorkers}
        renderItem={renderWorkerCard}
        keyExtractor={(item) => item.id.toString()}
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
            <IconSymbol name="person.fill" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No workers found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add workers to start managing your team'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={handleOpenCreateModal}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>Add First Worker</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Modal */}
      {renderWorkerFormModal(false)}

      {/* Edit Modal */}
      {renderWorkerFormModal(true)}
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
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  addButton: {
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
    paddingBottom: 100,
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  workerCardContent: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginRight: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workerPosition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  workerEmail: {
    fontSize: 12,
    color: '#666666',
  },
  workerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  workerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  workerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  joinDate: {
    fontSize: 12,
    color: '#999999',
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
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
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
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  skillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  skillButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  skillButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  skillButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
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
  verticalOptionsContainer: {
  flexDirection: 'column',
  gap: 10,
},
blockContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  padding: 8,
},

blockItem: {
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},

blockItemActive: {
  backgroundColor: '#E8F5E9',
  borderRadius: 8,
},

blockText: {
  fontSize: 15,
  color: '#333',
},

blockTextActive: {
  color: '#2E7D32',
  fontWeight: '600',
},
});
