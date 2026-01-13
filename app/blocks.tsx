import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  fetchBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  type Block,
  type CreateBlockPayload,
} from '@/services/blockService';
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
const PALM_VARIETIES = ['Tenera', 'Dura', 'Pisifera', 'MPOB Clone', 'Deli Dura', 'Nigerian Tenera'];
const SOIL_TYPES = ['Loamy', 'Sandy Loam', 'Clay Loam', 'Sandy', 'Clay', 'Peat', 'Alluvial'];
const DRAINAGE_OPTIONS = ['Excellent', 'Good', 'Moderate', 'Poor'];
const SLOPE_OPTIONS = ['Flat (0-2%)', 'Gentle (2-5%)', 'Moderate (5-10%)', 'Steep (10-20%)', 'Very Steep (>20%)'];
const ACCESSIBILITY_OPTIONS = ['Easy Access', 'Moderate Access', 'Difficult Access', 'Remote'];
const STATUS_OPTIONS = ['Active', 'Development', 'Maintenance', 'Replanting'];

export default function BlocksScreen() {
  const router = useRouter();
  const { phaseName: initialPhaseName, phaseNumber: initialPhaseNumber } = useLocalSearchParams();

  // Data states
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  // Form states
  const [formBlockName, setFormBlockName] = useState('');
  const [formBlockNumber, setFormBlockNumber] = useState('');
  const [formPhaseName, setFormPhaseName] = useState((initialPhaseName as string) || '');
  const [formPhaseNumber, setFormPhaseNumber] = useState((initialPhaseNumber as string) || '');
  const [formAreaHectare, setFormAreaHectare] = useState('');
  const [formAreaAcre, setFormAreaAcre] = useState('');
  const [formTreesPerHectare, setFormTreesPerHectare] = useState('');
  const [formTotalTrees, setFormTotalTrees] = useState('');
  const [formPalmVariety, setFormPalmVariety] = useState('');
  const [formPlantingDate, setFormPlantingDate] = useState('');
  const [formPalmAge, setFormPalmAge] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formEstimatedYield, setFormEstimatedYield] = useState('');
  const [formSoilType, setFormSoilType] = useState('');
  const [formDrainage, setFormDrainage] = useState('');
  const [formSlope, setFormSlope] = useState('');
  const [formAccessibility, setFormAccessibility] = useState('');

  const filters = ['All', 'Active', 'Development', 'Maintenance', 'Replanting'];

  // Load blocks from API
  const loadBlocks = useCallback(async () => {
    try {
      const response = await fetchBlocks();
      if (response.success && response.data) {
        setBlocks(response.data);
      }
    } catch (error) {
      console.error('Error loading blocks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBlocks();
  }, [loadBlocks]);

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch =
      block.blockName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.phaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.palmVariety?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || block.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50';
      case 'Development': return '#2196F3';
      case 'Maintenance': return '#FF9800';
      case 'Replanting': return '#9C27B0';
      default: return '#666666';
    }
  };

  // Auto-calculate functions
  const handleAreaHectareChange = (value: string) => {
    setFormAreaHectare(value);
    const hectare = parseFloat(value);
    if (!isNaN(hectare)) {
      setFormAreaAcre((hectare * 2.471).toFixed(2));
      const treesPerHa = parseFloat(formTreesPerHectare);
      if (!isNaN(treesPerHa)) {
        setFormTotalTrees(Math.round(hectare * treesPerHa).toString());
      }
    }
  };

  const handleTreesPerHectareChange = (value: string) => {
    setFormTreesPerHectare(value);
    const treesPerHa = parseFloat(value);
    const hectare = parseFloat(formAreaHectare);
    if (!isNaN(treesPerHa) && !isNaN(hectare)) {
      setFormTotalTrees(Math.round(hectare * treesPerHa).toString());
    }
  };

  const handlePlantingDateChange = (value: string) => {
    setFormPlantingDate(value);
    if (value) {
      const plantDate = new Date(value);
      const today = new Date();
      const ageYears = ((today.getTime() - plantDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
      if (parseFloat(ageYears) >= 0) {
        setFormPalmAge(ageYears);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormBlockName('');
    setFormBlockNumber('');
    setFormPhaseName((initialPhaseName as string) || '');
    setFormPhaseNumber((initialPhaseNumber as string) || '');
    setFormAreaHectare('');
    setFormAreaAcre('');
    setFormTreesPerHectare('');
    setFormTotalTrees('');
    setFormPalmVariety('');
    setFormPlantingDate('');
    setFormPalmAge('');
    setFormStatus('Active');
    setFormEstimatedYield('');
    setFormSoilType('');
    setFormDrainage('');
    setFormSlope('');
    setFormAccessibility('');
    setEditingBlock(null);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    // Auto-generate block number
    const nextNumber = blocks.length + 1;
    setFormBlockNumber(nextNumber.toString());
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (block: Block) => {
    setEditingBlock(block);
    setFormBlockName(block.blockName);
    setFormBlockNumber(block.blockNumber);
    setFormPhaseName(block.phaseName);
    setFormPhaseNumber(block.phaseNumber);
    setFormAreaHectare(block.areaHectare);
    setFormAreaAcre(block.areaAcre);
    setFormTreesPerHectare(block.treesPerHectare);
    setFormTotalTrees(block.totalTrees);
    setFormPalmVariety(block.palmVariety);
    setFormPlantingDate(block.plantingDate);
    setFormPalmAge(block.palmAge);
    setFormStatus(block.status);
    setFormEstimatedYield(block.estimatedYield);
    setFormSoilType(block.soilType);
    setFormDrainage(block.drainage);
    setFormSlope(block.slope);
    setFormAccessibility(block.accessibility);
    setShowEditModal(true);
  };

  // Create block
  const handleCreateBlock = async () => {
    if (!formBlockName.trim()) {
      showAlert('Error', 'Block name is required');
      return;
    }
    if (!formBlockNumber.trim()) {
      showAlert('Error', 'Block number is required');
      return;
    }
    if (!formPhaseName.trim()) {
      showAlert('Error', 'Phase name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateBlockPayload = {
        blockName: formBlockName.trim(),
        blockNumber: formBlockNumber.trim(),
        phaseName: formPhaseName.trim(),
        phaseNumber: formPhaseNumber.trim(),
        areaHectare: formAreaHectare,
        areaAcre: formAreaAcre,
        treesPerHectare: formTreesPerHectare,
        totalTrees: formTotalTrees,
        palmVariety: formPalmVariety,
        plantingDate: formPlantingDate,
        palmAge: formPalmAge,
        status: formStatus,
        estimatedYield: formEstimatedYield,
        soilType: formSoilType,
        drainage: formDrainage,
        slope: formSlope,
        accessibility: formAccessibility,
      };

      const response = await createBlock(payload);
      if (response.success && response.data) {
        setBlocks(prev => [...prev, response.data!]);
        setShowCreateModal(false);
        resetForm();
        showAlert('Success', 'Block created successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to create block');
      }
    } catch (error) {
      showAlert('Error', 'Failed to create block. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update block
  const handleUpdateBlock = async () => {
    if (!editingBlock) return;

    if (!formBlockName.trim()) {
      showAlert('Error', 'Block name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        blockName: formBlockName.trim(),
        blockNumber: formBlockNumber.trim(),
        phaseName: formPhaseName.trim(),
        phaseNumber: formPhaseNumber.trim(),
        areaHectare: formAreaHectare,
        areaAcre: formAreaAcre,
        treesPerHectare: formTreesPerHectare,
        totalTrees: formTotalTrees,
        palmVariety: formPalmVariety,
        plantingDate: formPlantingDate,
        palmAge: formPalmAge,
        status: formStatus,
        estimatedYield: formEstimatedYield,
        soilType: formSoilType,
        drainage: formDrainage,
        slope: formSlope,
        accessibility: formAccessibility,
      };

      const response = await updateBlock(editingBlock.id, payload);
      if (response.success && response.data) {
        setBlocks(prev => prev.map(b => b.id === editingBlock.id ? response.data! : b));
        setShowEditModal(false);
        resetForm();
        showAlert('Success', 'Block updated successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to update block');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update block. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete block
  const handleDeleteBlock = async (block: Block) => {
    const confirmDelete = async () => {
      if (Platform.OS === 'web') {
        return window.confirm(`Are you sure you want to delete "${block.blockName}"?`);
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete Block',
          `Are you sure you want to delete "${block.blockName}"?`,
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
      const response = await deleteBlock(block.id);
      if (response.success) {
        setBlocks(prev => prev.filter(b => b.id !== block.id));
        showAlert('Success', 'Block deleted successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to delete block');
      }
    } catch (error) {
      showAlert('Error', 'Failed to delete block. Please try again.');
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

  // Render block form modal
  const renderBlockFormModal = (isEdit: boolean) => (
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
              {isEdit ? 'Edit Block' : 'Create New Block'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Block Name */}
          <Text style={styles.label}>Block Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formBlockName}
            onChangeText={setFormBlockName}
            placeholder="e.g., Block A-1"
            placeholderTextColor="#999"
          />

          {/* Block Number */}
          <Text style={styles.label}>Block Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formBlockNumber}
            onChangeText={setFormBlockNumber}
            placeholder="e.g., 1"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Phase Name & Number */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Phase Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formPhaseName}
                onChangeText={setFormPhaseName}
                placeholder="e.g., Phase A"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Phase Number</Text>
              <TextInput
                style={styles.textInput}
                value={formPhaseNumber}
                onChangeText={setFormPhaseNumber}
                placeholder="e.g., 1"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Section: Area Information */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📐 Area Information</Text>
          </View>

          {/* Area (Hectare) & Area (Acre) */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Area (Hectare)</Text>
              <TextInput
                style={styles.textInput}
                value={formAreaHectare}
                onChangeText={handleAreaHectareChange}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Area (Acre)</Text>
              <TextInput
                style={[styles.textInput, styles.readOnly]}
                value={formAreaAcre}
                placeholder="Auto-calculated"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>
          </View>

          {/* Section: Palm Information */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌴 Palm Information</Text>
          </View>

          {/* Trees per Hectare & Total Trees */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Trees per Hectare</Text>
              <TextInput
                style={styles.textInput}
                value={formTreesPerHectare}
                onChangeText={handleTreesPerHectareChange}
                placeholder="e.g., 136"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Total Trees</Text>
              <TextInput
                style={[styles.textInput, styles.readOnly]}
                value={formTotalTrees}
                placeholder="Auto-calculated"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>
          </View>

          {/* Palm Variety */}
          <Text style={styles.label}>Palm Variety</Text>
          <View style={styles.optionsContainer}>
            {PALM_VARIETIES.map(variety => (
              <TouchableOpacity
                key={variety}
                style={[
                  styles.optionButton,
                  formPalmVariety === variety && styles.optionButtonActive
                ]}
                onPress={() => setFormPalmVariety(variety)}
              >
                <Text style={[
                  styles.optionText,
                  formPalmVariety === variety && styles.optionTextActive
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

          {/* Palm Age */}
          <Text style={styles.label}>Palm Age (Years)</Text>
          <TextInput
            style={[styles.textInput, styles.readOnly]}
            value={formPalmAge}
            placeholder="Auto-calculated from planting date"
            placeholderTextColor="#999"
            editable={false}
          />

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

          {/* Estimated Yield */}
          <Text style={styles.label}>Estimated Yield (MT/Ha/Year)</Text>
          <TextInput
            style={styles.textInput}
            value={formEstimatedYield}
            onChangeText={setFormEstimatedYield}
            placeholder="e.g., 25.5"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />

          {/* Section: Soil & Terrain */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌍 Soil & Terrain</Text>
          </View>

          {/* Soil Type */}
          <Text style={styles.label}>Soil Type</Text>
          <View style={styles.optionsContainer}>
            {SOIL_TYPES.map(soil => (
              <TouchableOpacity
                key={soil}
                style={[
                  styles.optionButton,
                  formSoilType === soil && styles.optionButtonActive
                ]}
                onPress={() => setFormSoilType(soil)}
              >
                <Text style={[
                  styles.optionText,
                  formSoilType === soil && styles.optionTextActive
                ]}>
                  {soil}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Drainage */}
          <Text style={styles.label}>Drainage</Text>
          <View style={styles.optionsContainer}>
            {DRAINAGE_OPTIONS.map(drainage => (
              <TouchableOpacity
                key={drainage}
                style={[
                  styles.optionButton,
                  formDrainage === drainage && styles.optionButtonActive
                ]}
                onPress={() => setFormDrainage(drainage)}
              >
                <Text style={[
                  styles.optionText,
                  formDrainage === drainage && styles.optionTextActive
                ]}>
                  {drainage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Slope */}
          <Text style={styles.label}>Slope</Text>
          <View style={styles.optionsContainer}>
            {SLOPE_OPTIONS.map(slope => (
              <TouchableOpacity
                key={slope}
                style={[
                  styles.optionButton,
                  formSlope === slope && styles.optionButtonActive
                ]}
                onPress={() => setFormSlope(slope)}
              >
                <Text style={[
                  styles.optionText,
                  formSlope === slope && styles.optionTextActive
                ]}>
                  {slope}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Accessibility */}
          <Text style={styles.label}>Accessibility</Text>
          <View style={styles.optionsContainer}>
            {ACCESSIBILITY_OPTIONS.map(access => (
              <TouchableOpacity
                key={access}
                style={[
                  styles.optionButton,
                  formAccessibility === access && styles.optionButtonActive
                ]}
                onPress={() => setFormAccessibility(access)}
              >
                <Text style={[
                  styles.optionText,
                  formAccessibility === access && styles.optionTextActive
                ]}>
                  {access}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={isEdit ? handleUpdateBlock : handleCreateBlock}
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
                  {isEdit ? 'Update Block' : 'Create Block'}
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

  const renderBlockCard = ({ item }: { item: Block }) => (
    <View style={styles.blockCard}>
      <TouchableOpacity
        style={styles.blockCardContent}
        onPress={() => handleOpenEditModal(item)}
        activeOpacity={0.8}
      >
        <View style={styles.blockHeader}>
          <View style={styles.blockIcon}>
            <IconSymbol name="square.grid.2x2.fill" size={24} color="#2E7D32" />
          </View>
          <View style={styles.blockTitleSection}>
            <Text style={styles.blockName} numberOfLines={1}>{item.blockName}</Text>
            <Text style={styles.blockPhase}>{item.phaseName} • Block #{item.blockNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.blockMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.areaHectare || '0'}</Text>
            <Text style={styles.metricLabel}>Hectares</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.totalTrees || '0'}</Text>
            <Text style={styles.metricLabel}>Trees</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.palmAge || '0'}</Text>
            <Text style={styles.metricLabel}>Years</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.estimatedYield || '0'}</Text>
            <Text style={styles.metricLabel}>MT/Ha</Text>
          </View>
        </View>

        <View style={styles.blockDetails}>
          {item.palmVariety && (
            <View style={styles.detailRow}>
              <IconSymbol name="leaf.fill" size={14} color="#666666" />
              <Text style={styles.detailText}>Variety: {item.palmVariety}</Text>
            </View>
          )}
          {item.soilType && (
            <View style={styles.detailRow}>
              <IconSymbol name="globe.americas.fill" size={14} color="#666666" />
              <Text style={styles.detailText}>Soil: {item.soilType} • Drainage: {item.drainage || 'N/A'}</Text>
            </View>
          )}
          {item.accessibility && (
            <View style={styles.detailRow}>
              <IconSymbol name="car.fill" size={14} color="#666666" />
              <Text style={styles.detailText}>{item.accessibility}</Text>
            </View>
          )}
        </View>

        <View style={styles.blockFooter}>
          <Text style={styles.plantingDate}>
            Planted: {item.plantingDate || 'N/A'}
          </Text>
          {item.slope && (
            <View style={styles.slopeBadge}>
              <Text style={styles.slopeText}>{item.slope}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.viewTreesButton}
            onPress={() => router.push(`/trees?blockName=${encodeURIComponent(item.blockName)}`)}
          >
            <Text style={styles.viewTreesEmoji}>🌴</Text>
            <Text style={styles.viewTreesButtonText}>View Trees</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addTreeButton}
            onPress={() => router.push(`/add-tree?blockName=${encodeURIComponent(item.blockName)}`)}
          >
            <IconSymbol name="plus" size={16} color="#2E7D32" />
            <Text style={styles.addTreeButtonText}>Add Tree</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBlock(item)}
      >
        <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading blocks...</Text>
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
          <Text style={styles.headerTitle}>Blocks</Text>
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
            placeholder="Search blocks"
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

      {/* Blocks List */}
      <FlatList
        data={filteredBlocks}
        renderItem={renderBlockCard}
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
            <IconSymbol name="square.grid.2x2.fill" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No blocks found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Create blocks to manage your farm areas'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleOpenCreateModal}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>Create First Block</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Modal */}
      {renderBlockFormModal(false)}

      {/* Edit Modal */}
      {renderBlockFormModal(true)}
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
  blockCard: {
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
  blockCardContent: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  blockTitleSection: {
    flex: 1,
  },
  blockName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 2,
  },
  blockPhase: {
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
  blockMetrics: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  blockDetails: {
    marginBottom: 12,
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
  blockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plantingDate: {
    fontSize: 12,
    color: '#999999',
  },
  slopeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slopeText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewTreesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FF8F00',
  },
  viewTreesEmoji: {
    fontSize: 16,
  },
  viewTreesButtonText: {
    color: '#FF8F00',
    fontSize: 13,
    fontWeight: '600',
  },
  addTreeButton: {
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
  addTreeButtonText: {
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

