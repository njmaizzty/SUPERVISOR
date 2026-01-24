import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  createArea,
  deleteArea,
  fetchAreas,
  updateArea,
  type Area,
  type CreateAreaPayload,
} from '@/services/areaService';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
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

const { width } = Dimensions.get('window');

// Status options
const STATUS_OPTIONS = ['Active', 'Maintenance', 'Development', 'Inactive'];

export default function AreasScreen() {
  const router = useRouter();

  // Data states
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Form states
  const [formPhaseName, setFormPhaseName] = useState('');
  const [formPhaseNumber, setFormPhaseNumber] = useState('');
  const [formExpectedBlocks, setFormExpectedBlocks] = useState('');
  const [formStatus, setFormStatus] = useState('Development');
  const [formEstablishedDate, setFormEstablishedDate] = useState('');

  const filters = ['All', 'Active', 'Maintenance', 'Development'];

  // Load areas from API
  const loadAreas = useCallback(async () => {
    try {
      const response = await fetchAreas();
      if (response.success && response.data) {
        setAreas(response.data);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAreas();
  }, [loadAreas]);

  const filteredAreas = areas.filter(area => {
    const matchesSearch =
      area.phaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.phaseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || area.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50';
      case 'Maintenance': return '#FF9800';
      case 'Development': return '#2196F3';
      case 'Inactive': return '#9E9E9E';
      default: return '#666666';
    }
  };

  const getProductivityColor = (productivity: string) => {
    switch (productivity) {
      case 'Very High': return '#4CAF50';
      case 'High': return '#8BC34A';
      case 'Medium': return '#FFC107';
      case 'Low': return '#FF9800';
      default: return '#666666';
    }
  };

  // Reset form
  const resetForm = () => {
    setFormPhaseName('');
    setFormPhaseNumber('');
    setFormExpectedBlocks('');
    setFormStatus('Development');
    setFormEstablishedDate('');
    setEditingArea(null);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    // Auto-generate phase number
    const nextNumber = areas.length + 1;
    setFormPhaseNumber(nextNumber.toString());
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (area: Area) => {
    setEditingArea(area);
    setFormPhaseName(area.phaseName);
    setFormPhaseNumber(area.phaseNumber);
    setFormExpectedBlocks(area.expectedBlocks.toString());
    setFormStatus(area.status);
    setFormEstablishedDate(area.establishedDate);
    setShowEditModal(true);
  };

  // Create area
  const handleCreateArea = async () => {
    if (!formPhaseName.trim()) {
      showAlert('Error', 'Phase name is required');
      return;
    }
    if (!formPhaseNumber.trim()) {
      showAlert('Error', 'Phase number is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateAreaPayload = {
        phaseName: formPhaseName.trim(),
        phaseNumber: formPhaseNumber.trim(),
        expectedBlocks: parseInt(formExpectedBlocks) || 0,
        status: formStatus,
        establishedDate: formEstablishedDate || new Date().toISOString().split('T')[0],
      };

      const response = await createArea(payload);
      if (response.success && response.data) {
        setAreas(prev => [...prev, response.data!]);
        setShowCreateModal(false);
        resetForm();
        showAlert('Success', 'Area/Phase added successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to create area');
      }
    } catch (error) {
      showAlert('Error', 'Failed to create area. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update area
  const handleUpdateArea = async () => {
    if (!editingArea) return;

    if (!formPhaseName.trim()) {
      showAlert('Error', 'Phase name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        phaseName: formPhaseName.trim(),
        phaseNumber: formPhaseNumber.trim(),
        expectedBlocks: parseInt(formExpectedBlocks) || 0,
        status: formStatus,
        establishedDate: formEstablishedDate,
      };

      const response = await updateArea(editingArea.id, payload);
      if (response.success && response.data) {
        setAreas(prev => prev.map(a => a.id === editingArea.id ? response.data! : a));
        setShowEditModal(false);
        resetForm();
        showAlert('Success', 'Area/Phase updated successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to update area');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update area. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete area
  const handleDeleteArea = async (area: Area) => {
    const confirmDelete = async () => {
      if (Platform.OS === 'web') {
        return window.confirm(`Are you sure you want to delete "${area.phaseName}"?`);
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete Area',
          `Are you sure you want to delete "${area.phaseName}"?`,
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
      const response = await deleteArea(area.id);
      if (response.success) {
        setAreas(prev => prev.filter(a => a.id !== area.id));
        showAlert('Success', 'Area/Phase deleted successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to delete area');
      }
    } catch (error) {
      showAlert('Error', 'Failed to delete area. Please try again.');
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

  // Navigate to create block
  const handleCreateBlock = (area: Area) => {
    router.push(`/create-block?phaseName=${encodeURIComponent(area.phaseName)}&phaseNumber=${area.phaseNumber}`);
  };

  // Render area form modal
  const renderAreaFormModal = (isEdit: boolean) => (
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
              {isEdit ? 'Edit Area/Phase' : 'Add New Area/Phase'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Phase Name */}
          <Text style={styles.label}>Phase Name </Text>
          <TextInput
            style={styles.textInput}
            value={formPhaseName}
            onChangeText={setFormPhaseName}
            placeholder="e.g., Phase A, North Block"
            placeholderTextColor="#999"
          />

          {/* Phase Number */}
          <Text style={styles.label}>Phase Number </Text>
          <TextInput
            style={styles.textInput}
            value={formPhaseNumber}
            onChangeText={setFormPhaseNumber}
            placeholder="e.g., 1, 2, 3"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Expected Number of Blocks */}
          <Text style={styles.label}>Expected Number of Blocks</Text>
          <TextInput
            style={styles.textInput}
            value={formExpectedBlocks}
            onChangeText={setFormExpectedBlocks}
            placeholder="e.g., 12"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Status */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.verticalOptionsContainer}>
            {STATUS_OPTIONS.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  formStatus === status && { backgroundColor: getStatusColor(status) }
                ]}
                onPress={() => setFormStatus(status)}
              >
                <Text style={[
                  styles.statusButtonText,
                  formStatus === status && styles.statusButtonTextActive
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Established Date */}
          <Text style={styles.label}>Established Date</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <input
                type="date"
                value={formEstablishedDate}
                onChange={(e) => setFormEstablishedDate(e.target.value)}
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
            <TextInput
              style={styles.textInput}
              value={formEstablishedDate}
              onChangeText={setFormEstablishedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          )}

          {/* Summary */}
          {formPhaseName && (
            <View style={styles.summaryBox}>
              <IconSymbol name="map.fill" size={20} color="#2E7D32" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>{formPhaseName}</Text>
                <Text style={styles.summarySubtitle}>
                  Phase #{formPhaseNumber} • {formExpectedBlocks || '0'} expected blocks • {formStatus}
                </Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={isEdit ? handleUpdateArea : handleCreateArea}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  name={isEdit ? "checkmark.circle.fill" : "plus.circle.fill"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>
                  {isEdit ? 'Update Area' : 'Add Area'}
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

  const renderAreaCard = ({ item }: { item: Area }) => (
    <View style={styles.areaCard}>
      <TouchableOpacity
        style={styles.areaCardContent}
        onPress={() => handleOpenEditModal(item)}
        activeOpacity={0.8}
      >
        <View style={styles.areaHeader}>
          <View style={styles.areaIcon}>
            <IconSymbol name="map.fill" size={24} color="#2E7D32" />
          </View>
          <View style={styles.areaTitleSection}>
            <Text style={styles.areaName} numberOfLines={1}>{item.phaseName}</Text>
            <Text style={styles.areaPhase}>Phase #{item.phaseNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.areaMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.expectedBlocks}</Text>
            <Text style={styles.metricLabel}>Expected Blocks</Text>
          </View>

          {/*<View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.actualBlocks || 0}</Text>
            <Text style={styles.metricLabel}>Actual Blocks</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.totalArea?.toFixed(1) || '0'}</Text>
            <Text style={styles.metricLabel}>Hectares</Text>
          </View>
        </View>*/}

</View>
        {/*{item.healthScore !== undefined && item.healthScore > 0 && (
          <View style={styles.healthContainer}>
            <View style={styles.healthBar}>
              <View 
                style={[
                  styles.healthFill, 
                  { 
                    width: `${item.healthScore}%`,
                    backgroundColor: item.healthScore >= 80 ? '#4CAF50' : item.healthScore >= 60 ? '#FF9800' : '#F44336'
                  }
                ]} 
              />
            </View>
            <Text style={styles.healthText}>{item.healthScore}% Health</Text>
          </View>
        )}*/}

        <View style={styles.areaFooter}>
          <Text style={styles.establishedDate}>
            Established: {item.establishedDate || 'N/A'}
          </Text>
          {item.productivity && item.productivity !== 'N/A' && (
            <View style={[styles.productivityBadge, { backgroundColor: getProductivityColor(item.productivity) + '20' }]}>
              <Text style={[styles.productivityText, { color: getProductivityColor(item.productivity) }]}>
                {item.productivity}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.viewBlocksButton}
            onPress={() => router.push(`/blocks?phaseName=${encodeURIComponent(item.phaseName)}&phaseNumber=${item.phaseNumber}`)}
          >
            <IconSymbol name="square.grid.2x2.fill" size={16} color="#1976D2" />
            <Text style={styles.viewBlocksButtonText}>View Blocks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBlockButton}
            onPress={() => handleCreateBlock(item)}
          >
            <IconSymbol name="plus" size={16} color="#2E7D32" />
            <Text style={styles.addBlockButtonText}>Add Block</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteArea(item)}
      >
        <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading areas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Areas</Text>
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
            placeholder="Search areas by phase name or number"
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

      {/* Areas List */}
      <FlatList
        data={filteredAreas}
        renderItem={renderAreaCard}
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
            <IconSymbol name="map.fill" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No areas found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add areas to start managing your farm phases'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleOpenCreateModal}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>Add First Area</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Modal */}
      {renderAreaFormModal(false)}

      {/* Edit Modal */}
      {renderAreaFormModal(true)}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  areaCard: {
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
  areaCardContent: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  areaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  areaTitleSection: {
    flex: 1,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 2,
  },
  areaPhase: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  areaMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  healthBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 80,
    textAlign: 'right',
  },
  areaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  establishedDate: {
    fontSize: 12,
    color: '#999999',
  },
  productivityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productivityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewBlocksButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  viewBlocksButtonText: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '600',
  },
  addBlockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  addBlockButtonText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  dateInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
});
