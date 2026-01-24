import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  createAsset,
  deleteAsset,
  fetchAssets,
  updateAsset,
  type Asset,
  type CreateAssetPayload,
} from '@/services/assetService';
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

// Asset type options
const ASSET_TYPE_OPTIONS = [
  'Machinery',
  'Electrical',
  'Vehicle',
  'Tool',
  'Equipment',
  'Infrastructure',
];

// Category options
const CATEGORY_OPTIONS = [
  'Field Equipment',
  'Irrigation Equipment',
  'Application Equipment',
  'Treatment Equipment',
  'Testing Equipment',
  'Transport',
  'Storage',
];

// Status options
const STATUS_OPTIONS = ['Active', 'Maintenance Required', 'Out of Service'];

const BLOCKS = Array.from({ length: 26 }, (_, i) => ({
  id: i + 1,
  name: `Block ${String.fromCharCode(65 + i)}`, // A-Z
}));

export default function AssetsScreen() {
  const router = useRouter();

  // Data states
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form states
  const [formAssetName, setFormAssetName] = useState('');
  const [formAssetId, setFormAssetId] = useState('');
  const [formAssetType, setFormAssetType] = useState('Machinery');
  const [formCategory, setFormCategory] = useState('Field Equipment');
  const [formStatus, setFormStatus] = useState('Active');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formLocation, setFormLocation] = useState('Block A');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState('');
  const [formEfficiency, setFormEfficiency] = useState('100');

  const filters = ['All', 'Active', 'Maintenance Required', 'Out of Service'];

  // Load assets from API
  const loadAssets = useCallback(async () => {
    try {
      const response = await fetchAssets();
      if (response.success && response.data) {
        setAssets(response.data);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || asset.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50';
      case 'Maintenance Required': return '#FF9800';
      case 'Out of Service': return '#F44336';
      case 'Reserved': return '#2196F3';
      default: return '#666666';
    }
  };

  // Reset form
  const resetForm = () => {
    setFormAssetName('');
    setFormAssetId('');
    setFormAssetType('Machinery');
    setFormCategory('Field Equipment');
    setFormStatus('Active');
    setFormManufacturer('');
    setFormModel('');
    setFormYear(new Date().getFullYear().toString());
    setFormSerialNumber('');
    setFormLocation('Block A');
    setFormPurchaseDate('');
    setFormPurchasePrice('');
    setFormEfficiency('100');
    setEditingAsset(null);
  };

  // Generate Asset ID
  const generateAssetId = () => {
    const prefix = 'AST';
    const num = String(assets.length + 1).padStart(3, '0');
    setFormAssetId(`${prefix}-${num}`);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    generateAssetId();
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormAssetName(asset.assetName);
    setFormAssetId(asset.assetId);
    setFormAssetType(asset.assetType);
    setFormCategory(asset.category);
    setFormStatus(asset.status);
    setFormManufacturer(asset.manufacturer);
    setFormModel(asset.model);
    setFormYear(asset.year);
    setFormSerialNumber(asset.serialNumber);
    setFormLocation(asset.location);
    setFormPurchaseDate(asset.purchaseDate);
    setFormPurchasePrice(asset.purchasePrice);
    setFormEfficiency(asset.efficiency.replace('%', ''));
    setShowEditModal(true);
  };

  // Create asset
  const handleCreateAsset = async () => {
    if (!formAssetName.trim()) {
      showAlert('Error', 'Asset name is required');
      return;
    }
    if (!formAssetId.trim()) {
      showAlert('Error', 'Asset ID is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateAssetPayload = {
        assetName: formAssetName.trim(),
        assetId: formAssetId.trim(),
        assetType: formAssetType,
        category: formCategory,
        status: formStatus,
        manufacturer: formManufacturer.trim(),
        model: formModel.trim(),
        year: formYear,
        serialNumber: formSerialNumber.trim(),
        location: formLocation,
        purchaseDate: formPurchaseDate,
        purchasePrice: formPurchasePrice,
        efficiency: `${formEfficiency}%`,
      };

      const response = await createAsset(payload);
      if (response.success && response.data) {
        setAssets(prev => [...prev, response.data!]);
        setShowCreateModal(false);
        resetForm();
        showAlert('Success', 'Asset added successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to create asset');
      }
    } catch (error) {
      showAlert('Error', 'Failed to create asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update asset
  const handleUpdateAsset = async () => {
    if (!editingAsset) return;

    if (!formAssetName.trim()) {
      showAlert('Error', 'Asset name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        assetName: formAssetName.trim(),
        assetId: formAssetId.trim(),
        assetType: formAssetType,
        category: formCategory,
        status: formStatus,
        manufacturer: formManufacturer.trim(),
        model: formModel.trim(),
        year: formYear,
        serialNumber: formSerialNumber.trim(),
        location: formLocation,
        purchaseDate: formPurchaseDate,
        purchasePrice: formPurchasePrice,
        efficiency: `${formEfficiency}%`,
      };

      const response = await updateAsset(editingAsset.id, payload);
      if (response.success && response.data) {
        setAssets(prev => prev.map(a => a.id === editingAsset.id ? response.data! : a));
        setShowEditModal(false);
        resetForm();
        showAlert('Success', 'Asset updated successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to update asset');
      }
    } catch (error) {
      showAlert('Error', 'Failed to update asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete asset
  const handleDeleteAsset = async (asset: Asset) => {
    const confirmDelete = async () => {
      if (Platform.OS === 'web') {
        return window.confirm(`Are you sure you want to delete "${asset.assetName}"?`);
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete Asset',
          `Are you sure you want to delete "${asset.assetName}"?`,
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
      const response = await deleteAsset(asset.id);
      if (response.success) {
        setAssets(prev => prev.filter(a => a.id !== asset.id));
        showAlert('Success', 'Asset deleted successfully!');
      } else {
        showAlert('Error', response.error || 'Failed to delete asset');
      }
    } catch (error) {
      showAlert('Error', 'Failed to delete asset. Please try again.');
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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'MYR 0';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Render asset form modal
  const renderAssetFormModal = (isEdit: boolean) => (
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
              {isEdit ? 'Edit Asset' : 'Add New Asset'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Asset Name */}
          <Text style={styles.label}>Asset Name </Text>
          <TextInput
            style={styles.textInput}
            value={formAssetName}
            onChangeText={setFormAssetName}
            placeholder="Enter asset name"
            placeholderTextColor="#999"
          />

          {/* Asset ID */}
          <Text style={styles.label}>Asset ID </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              value={formAssetId}
              onChangeText={setFormAssetId}
              placeholder="e.g., AST-001"
              placeholderTextColor="#999"
            />
            {!isEdit && (
              <TouchableOpacity style={styles.generateButton} onPress={generateAssetId}>
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Asset Type */}
          <Text style={styles.label}>Asset Type</Text>
          <View style={styles.verticalOptionsContainer}>
            {ASSET_TYPE_OPTIONS.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formAssetType === type && styles.optionButtonActive
                ]}
                onPress={() => setFormAssetType(type)}
              >
                <Text style={[
                  styles.optionText,
                  formAssetType === type && styles.optionTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.verticalOptionsContainer}>
            {CATEGORY_OPTIONS.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionButton,
                  formCategory === cat && styles.optionButtonActive
                ]}
                onPress={() => setFormCategory(cat)}
              >
                <Text style={[
                  styles.optionText,
                  formCategory === cat && styles.optionTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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

          {/* Manufacturer & Model Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Manufacturer</Text>
              <TextInput
                style={styles.textInput}
                value={formManufacturer}
                onChangeText={setFormManufacturer}
                placeholder="e.g., John Deere"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.textInput}
                value={formModel}
                onChangeText={setFormModel}
                placeholder="e.g., 5075E"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Year & Serial Number Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.textInput}
                value={formYear}
                onChangeText={setFormYear}
                placeholder="e.g., 2024"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Serial Number</Text>
              <TextInput
                style={styles.textInput}
                value={formSerialNumber}
                onChangeText={setFormSerialNumber}
                placeholder="Enter serial number"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Location */}
          <Text style={styles.label}>Location </Text>
          <View style={styles.blockContainer}>
  <ScrollView 
    style={{ maxHeight: 200 }}
    showsVerticalScrollIndicator={true}
    nestedScrollEnabled
  >
    {BLOCKS.map(block => (
      <TouchableOpacity
        key={block.id}
        style={[
          styles.blockItem,
          formLocation === block.name && styles.blockItemActive,
        ]}
        onPress={() => setFormLocation(block.name)}
      >
        <Text
          style={[
            styles.blockText,
            formLocation === block.name && styles.blockTextActive,
          ]}
        >
          {block.name}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

          {/* Purchase Date */}
          <Text style={styles.label}>Purchase Date</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <input
                type="date"
                value={formPurchaseDate}
                onChange={(e) => setFormPurchaseDate(e.target.value)}
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
              value={formPurchaseDate}
              onChangeText={setFormPurchaseDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          )}

          {/* Purchase Price & Efficiency Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Purchase Price (MYR)</Text>
              <TextInput
                style={styles.textInput}
                value={formPurchasePrice}
                onChangeText={setFormPurchasePrice}
                placeholder="e.g., 45000"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Efficiency (%)</Text>
              <TextInput
                style={styles.textInput}
                value={formEfficiency}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  if (text === '' || (num >= 0 && num <= 100)) {
                    setFormEfficiency(text);
                  }
                }}
                placeholder="0-100"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={isEdit ? handleUpdateAsset : handleCreateAsset}
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
                  {isEdit ? 'Update Asset' : 'Add Asset'}
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

  const renderAssetCard = ({ item }: { item: Asset }) => (
    <View style={styles.assetCard}>
      <TouchableOpacity
        style={styles.assetCardContent}
        onPress={() => handleOpenEditModal(item)}
        activeOpacity={0.8}
      >
        <View style={styles.assetHeader}>
          <View style={styles.assetIcon}>
            <IconSymbol name="wrench.and.screwdriver.fill" size={24} color="#2E7D32" />
          </View>
          <View style={styles.assetTitleSection}>
            <Text style={styles.assetName} numberOfLines={1}>{item.assetName}</Text>
            <Text style={styles.assetIdText}>ID: {item.assetId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.assetDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="tag.fill" size={14} color="#666666" />
            <Text style={styles.detailText}>{item.assetType} • {item.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="building.2.fill" size={14} color="#666666" />
            <Text style={styles.detailText}>{item.manufacturer} {item.model}</Text>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="location.fill" size={14} color="#666666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.assetMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.year}</Text>
            <Text style={styles.metricLabel}>Year</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.efficiency}</Text>
            <Text style={styles.metricLabel}>Efficiency</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{formatCurrency(item.purchasePrice)}</Text>
            <Text style={styles.metricLabel}>Price</Text>
          </View>
        </View>

        <View style={styles.assetFooter}>
          <Text style={styles.serialNumber}>S/N: {item.serialNumber || 'N/A'}</Text>
          <Text style={styles.purchaseDate}>
            Purchased: {item.purchaseDate || 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAsset(item)}
      >
        <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading assets...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Assets</Text>
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

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
          />
        </View>

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

      <FlatList
        data={filteredAssets}
        renderItem={renderAssetCard}
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
            <IconSymbol name="wrench.and.screwdriver.fill" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No assets found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add assets to start tracking your equipment'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={handleOpenCreateModal}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>Add First Asset</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Modal */}
      {renderAssetFormModal(false)}

      {/* Edit Modal */}
      {renderAssetFormModal(true)}
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
  assetCard: {
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
  assetCardContent: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetTitleSection: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 2,
  },
  assetIdText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assetDetails: {
    marginBottom: 16,
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
  assetMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  assetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serialNumber: {
    fontSize: 10,
    color: '#999999',
    fontFamily: 'monospace',
  },
  purchaseDate: {
    fontSize: 10,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  generateButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
