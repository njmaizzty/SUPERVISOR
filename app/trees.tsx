import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  fetchTrees,
  createTree,
  updateTree,
  deleteTree,
  type Tree,
  type CreateTreePayload,
} from '@/services/treeService';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const { width } = Dimensions.get('window');

// Constants
const TAG_TYPES = ['QR Code', 'RFID', 'Barcode', 'Metal Tag', 'Paint Mark', 'None'];
const PALM_VARIETIES = ['Tenera', 'Dura', 'Pisifera', 'MPOB Clone', 'Deli Dura', 'Nigerian Tenera'];
const STATUS_OPTIONS = ['Healthy', 'Diseased', 'Recovering', 'Dead', 'Replanted', 'Under Observation'];
const COMMON_DISEASES = [
  'None',
  'Ganoderma',
  'Basal Stem Rot',
  'Bud Rot',
  'Leaf Spot',
  'Crown Disease',
  'Trunk Rot',
  'Root Rot',
  'Nutrient Deficiency',
  'Pest Infestation',
];

export default function TreesScreen() {
  const router = useRouter();
  const { blockName: initialBlockName } = useLocalSearchParams();

  // Data states
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);

  // Form states
  const [formTreeNumber, setFormTreeNumber] = useState('');
  const [formBlock, setFormBlock] = useState((initialBlockName as string) || '');
  const [formTagType, setFormTagType] = useState('');
  const [formTagId, setFormTagId] = useState('');
  const [formDiseases, setFormDiseases] = useState<string[]>(['None']);
  const [formNotes, setFormNotes] = useState('');
  const [formVariety, setFormVariety] = useState('');
  const [formPlantingDate, setFormPlantingDate] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formTrunkCircumference, setFormTrunkCircumference] = useState('');
  const [formStatus, setFormStatus] = useState('Healthy');
  const [formHealthScore, setFormHealthScore] = useState('100');
  const [formEstimatedYield, setFormEstimatedYield] = useState('');

  const filters = ['All', 'Healthy', 'Diseased', 'Recovering', 'Under Observation'];

  // Load trees from API
  const loadTrees = useCallback(async () => {
    try {
      const response = await fetchTrees();
      if (response.success && response.data) {
        setTrees(response.data);
      }
    } catch (error) {
      console.error('Error loading trees:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrees();
  }, [loadTrees]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrees();
  }, [loadTrees]);

  const filteredTrees = trees.filter(tree => {
    const matchesSearch =
      tree.treeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.tagId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.variety?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || tree.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return '#4CAF50';
      case 'Diseased': return '#F44336';
      case 'Recovering': return '#FF9800';
      case 'Dead': return '#9E9E9E';
      case 'Replanted': return '#2196F3';
      case 'Under Observation': return '#9C27B0';
      default: return '#666666';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FF9800';
    if (score >= 20) return '#FF5722';
    return '#F44336';
  };

  // Handle planting date change and auto-calculate age
  const handlePlantingDateChange = (value: string) => {
    setFormPlantingDate(value);
    if (value) {
      const plantDate = new Date(value);
      const today = new Date();
      const ageYears = ((today.getTime() - plantDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
      if (parseFloat(ageYears) >= 0) {
        setFormAge(ageYears);
      }
    }
  };

  // Toggle disease selection
  const toggleDisease = (disease: string) => {
    if (disease === 'None') {
      setFormDiseases(['None']);
      return;
    }
    
    let newDiseases = formDiseases.filter(d => d !== 'None');
    
    if (newDiseases.includes(disease)) {
      newDiseases = newDiseases.filter(d => d !== disease);
    } else {
      newDiseases.push(disease);
    }
    
    if (newDiseases.length === 0) {
      newDiseases = ['None'];
    }
    
    setFormDiseases(newDiseases);
  };

  // Reset form
  const resetForm = () => {
    setFormTreeNumber('');
    setFormBlock((initialBlockName as string) || '');
    setFormTagType('');
    setFormTagId('');
    setFormDiseases(['None']);
    setFormNotes('');
    setFormVariety('');
    setFormPlantingDate('');
    setFormAge('');
    setFormHeight('');
    setFormTrunkCircumference('');
    setFormStatus('Healthy');
    setFormHealthScore('100');
    setFormEstimatedYield('');
    setEditingTree(null);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    // Auto-generate tree number
    const nextNumber = trees.length + 1;
    setFormTreeNumber(`T${String(nextNumber).padStart(3, '0')}`);
    // Auto-generate tag ID
    setFormTagId(`TAG-${String(nextNumber).padStart(3, '0')}`);
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (tree: Tree) => {
    setEditingTree(tree);
    setFormTreeNumber(tree.treeNumber);
    setFormBlock(tree.block);
    setFormTagType(tree.tagType);
    setFormTagId(tree.tagId);
    setFormDiseases(Array.isArray(tree.diseases) ? tree.diseases : [tree.diseases || 'None']);
    setFormNotes(tree.notes);
    setFormVariety(tree.variety);
    setFormPlantingDate(tree.plantingDate);
    setFormAge(tree.age);
    setFormHeight(tree.height);
    setFormTrunkCircumference(tree.trunkCircumference);
    setFormStatus(tree.status);
    setFormHealthScore(tree.healthScore);
    setFormEstimatedYield(tree.estimatedYield);
    setShowEditModal(true);
  };

  // Create tree
  const handleCreateTree = async () => {
    if (!formTreeNumber.trim()) {
      showAlert('Error', 'Tree number is required');
      return;
    }
    if (!formBlock.trim()) {
      showAlert('Error', 'Block is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTreePayload = {
        treeNumber: formTreeNumber.trim(),
        block: formBlock.trim(),
        tagType: formTagType,
        tagId: formTagId,
        diseases: formDiseases,
        notes: formNotes,
        variety: formVariety,
        plantingDate: formPlantingDate,
        age: formAge,
        height: formHeight,
        trunkCircumference: formTrunkCircumference,
        status: formStatus,
        healthScore: formHealthScore,
        estimatedYield: formEstimatedYield,
      };

      const response = await createTree(payload);
      if (response.success && response.data) {
        setTrees(prev => [...prev, response.data!]);
        setShowCreateModal(false);
        resetForm();
        showAlert('Success', 'Tree added successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to add tree');
      }
    } catch (error) {
      showAlert('Error', 'Failed to add tree. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update tree
  const handleUpdateTree = async () => {
    if (!editingTree) return;

    if (!formTreeNumber.trim()) {
      showAlert('Error', 'Tree number is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        treeNumber: formTreeNumber.trim(),
        block: formBlock.trim(),
        tagType: formTagType,
        tagId: formTagId,
        diseases: formDiseases,
        notes: formNotes,
        variety: formVariety,
        plantingDate: formPlantingDate,
        age: formAge,
        height: formHeight,
        trunkCircumference: formTrunkCircumference,
        status: formStatus,
        healthScore: formHealthScore,
        estimatedYield: formEstimatedYield,
      };

      const response = await updateTree(editingTree.id, payload);
      if (response.success && response.data) {
        setTrees(prev => prev.map(t => t.id === editingTree.id ? response.data! : t));
        setShowEditModal(false);
        resetForm();
        showAlert('Success', 'Tree updated successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to update tree');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update tree. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete tree
  const handleDeleteTree = async (tree: Tree) => {
    const confirmDelete = async () => {
      if (Platform.OS === 'web') {
        return window.confirm(`Are you sure you want to delete tree "${tree.treeNumber}"?`);
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete Tree',
          `Are you sure you want to delete tree "${tree.treeNumber}"?`,
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
      const response = await deleteTree(tree.id);
      if (response.success) {
        setTrees(prev => prev.filter(t => t.id !== tree.id));
        showAlert('Success', 'Tree deleted successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to delete tree');
      }
    } catch (error) {
      showAlert('Error', 'Failed to delete tree. Please try again.');
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

  // Render tree form modal
  const renderTreeFormModal = (isEdit: boolean) => (
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
              {isEdit ? 'Edit Tree' : 'Add New Tree'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Tree Number */}
          <Text style={styles.label}>Tree Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formTreeNumber}
            onChangeText={setFormTreeNumber}
            placeholder="e.g., T001"
            placeholderTextColor="#999"
          />

          {/* Block */}
          <Text style={styles.label}>Block *</Text>
          <TextInput
            style={styles.textInput}
            value={formBlock}
            onChangeText={setFormBlock}
            placeholder="e.g., Block A-1"
            placeholderTextColor="#999"
          />

          {/* Section: Tag Information */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏷️ Tag Information</Text>
          </View>

          {/* Tag Type */}
          <Text style={styles.label}>Tag Type</Text>
          <View style={styles.optionsContainer}>
            {TAG_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formTagType === type && styles.optionButtonActive
                ]}
                onPress={() => setFormTagType(type)}
              >
                <Text style={[
                  styles.optionText,
                  formTagType === type && styles.optionTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tag ID */}
          <Text style={styles.label}>Tag ID</Text>
          <TextInput
            style={styles.textInput}
            value={formTagId}
            onChangeText={setFormTagId}
            placeholder="e.g., TAG-001-A1"
            placeholderTextColor="#999"
          />

          {/* Section: Palm Information */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌴 Palm Information</Text>
          </View>

          {/* Variety */}
          <Text style={styles.label}>Variety</Text>
          <View style={styles.optionsContainer}>
            {PALM_VARIETIES.map(variety => (
              <TouchableOpacity
                key={variety}
                style={[
                  styles.optionButton,
                  formVariety === variety && styles.optionButtonActive
                ]}
                onPress={() => setFormVariety(variety)}
              >
                <Text style={[
                  styles.optionText,
                  formVariety === variety && styles.optionTextActive
                ]}>
                  {variety}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Planting Date */}
          <Text style={styles.label}>Planting Date</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <input
                type="date"
                value={formPlantingDate}
                onChange={(e) => handlePlantingDateChange(e.target.value)}
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
              value={formPlantingDate}
              onChangeText={handlePlantingDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          )}

          {/* Age */}
          <Text style={styles.label}>Age (Years)</Text>
          <TextInput
            style={[styles.textInput, styles.readOnly]}
            value={formAge}
            placeholder="Auto-calculated from planting date"
            placeholderTextColor="#999"
            editable={false}
          />

          {/* Section: Physical Measurements */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📏 Physical Measurements</Text>
          </View>

          {/* Height & Trunk Circumference */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Height (m)</Text>
              <TextInput
                style={styles.textInput}
                value={formHeight}
                onChangeText={setFormHeight}
                placeholder="e.g., 12.5"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Trunk Circumference (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={formTrunkCircumference}
                onChangeText={setFormTrunkCircumference}
                placeholder="e.g., 180"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Section: Health & Status */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💚 Health & Status</Text>
          </View>

          {/* Status */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.optionsContainer}>
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

          {/* Health Score */}
          <Text style={styles.label}>Health Score (0-100)</Text>
          <TextInput
            style={styles.textInput}
            value={formHealthScore}
            onChangeText={setFormHealthScore}
            placeholder="e.g., 100"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Diseases */}
          <Text style={styles.label}>Diseases</Text>
          <View style={styles.optionsContainer}>
            {COMMON_DISEASES.map(disease => (
              <TouchableOpacity
                key={disease}
                style={[
                  styles.diseaseButton,
                  formDiseases.includes(disease) && (disease === 'None' ? styles.diseaseButtonNone : styles.diseaseButtonActive)
                ]}
                onPress={() => toggleDisease(disease)}
              >
                <Text style={[
                  styles.diseaseButtonText,
                  formDiseases.includes(disease) && styles.diseaseButtonTextActive
                ]}>
                  {disease}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section: Yield */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌾 Yield Information</Text>
          </View>

          {/* Estimated Yield */}
          <Text style={styles.label}>Estimated Yield (kg/year)</Text>
          <TextInput
            style={styles.textInput}
            value={formEstimatedYield}
            onChangeText={setFormEstimatedYield}
            placeholder="e.g., 200"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formNotes}
            onChangeText={setFormNotes}
            placeholder="Additional observations or notes..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={isEdit ? handleUpdateTree : handleCreateTree}
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
                  {isEdit ? 'Update Tree' : 'Add Tree'}
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

  const renderTreeCard = ({ item }: { item: Tree }) => {
    const healthScore = parseInt(item.healthScore) || 0;
    const hasDiseases = item.diseases && !item.diseases.includes('None') && item.diseases.length > 0;

    return (
      <View style={styles.treeCard}>
        <TouchableOpacity
          style={styles.treeCardContent}
          onPress={() => handleOpenEditModal(item)}
          activeOpacity={0.8}
        >
          <View style={styles.treeHeader}>
            <View style={styles.treeIcon}>
              <Text style={styles.treeEmoji}>🌴</Text>
            </View>
            <View style={styles.treeTitleSection}>
              <Text style={styles.treeName} numberOfLines={1}>{item.treeNumber}</Text>
              <Text style={styles.treeBlock}>{item.block}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          {/* Health Score Bar */}
          <View style={styles.healthContainer}>
            <View style={styles.healthBar}>
              <View 
                style={[
                  styles.healthFill, 
                  { 
                    width: `${healthScore}%`,
                    backgroundColor: getHealthScoreColor(healthScore)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.healthText, { color: getHealthScoreColor(healthScore) }]}>
              {healthScore}%
            </Text>
          </View>

          <View style={styles.treeMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{item.age || '0'}</Text>
              <Text style={styles.metricLabel}>Years</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{item.height || '-'}</Text>
              <Text style={styles.metricLabel}>Height (m)</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{item.trunkCircumference || '-'}</Text>
              <Text style={styles.metricLabel}>Trunk (cm)</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{item.estimatedYield || '0'}</Text>
              <Text style={styles.metricLabel}>Yield (kg)</Text>
            </View>
          </View>

          <View style={styles.treeDetails}>
            {item.variety && (
              <View style={styles.detailRow}>
                <IconSymbol name="leaf.fill" size={14} color="#666666" />
                <Text style={styles.detailText}>Variety: {item.variety}</Text>
              </View>
            )}
            {item.tagId && (
              <View style={styles.detailRow}>
                <IconSymbol name="tag.fill" size={14} color="#666666" />
                <Text style={styles.detailText}>{item.tagType}: {item.tagId}</Text>
              </View>
            )}
            {hasDiseases && (
              <View style={styles.detailRow}>
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#F44336" />
                <Text style={[styles.detailText, { color: '#F44336' }]}>
                  Diseases: {item.diseases.join(', ')}
                </Text>
              </View>
            )}
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
            </View>
          )}

          <View style={styles.treeFooter}>
            <Text style={styles.plantingDate}>
              Planted: {item.plantingDate || 'N/A'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTree(item)}
        >
          <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading trees...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trees</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenCreateModal}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trees by number, block, tag..."
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

      {/* Trees List */}
      <FlatList
        data={filteredTrees}
        renderItem={renderTreeCard}
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
            <Text style={styles.emptyEmoji}>🌴</Text>
            <Text style={styles.emptyTitle}>No trees found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add trees to track your palms'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleOpenCreateModal}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>Add First Tree</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Modal */}
      {renderTreeFormModal(false)}

      {/* Edit Modal */}
      {renderTreeFormModal(true)}
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
    paddingTop: 16,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  treeCard: {
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
  treeCardContent: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  treeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  treeEmoji: {
    fontSize: 24,
  },
  treeTitleSection: {
    flex: 1,
  },
  treeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 2,
  },
  treeBlock: {
    fontSize: 13,
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
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: 'bold',
    width: 45,
    textAlign: 'right',
  },
  treeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  metricLabel: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  treeDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    color: '#795548',
    fontStyle: 'italic',
  },
  treeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantingDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666666',
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
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
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
    height: 100,
    textAlignVertical: 'top',
  },
  readOnly: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  diseaseButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  diseaseButtonNone: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  diseaseButtonActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  diseaseButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  diseaseButtonTextActive: {
    color: '#FFFFFF',
  },
  dateInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
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
});

