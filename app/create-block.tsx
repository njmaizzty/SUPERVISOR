import { IconSymbol } from '@/components/ui/icon-symbol';
import { createBlock } from '@/services/blockService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Constants
const PALM_VARIETIES = ['Tenera', 'Dura', 'Pisifera', 'MPOB Clone', 'Deli Dura', 'Nigerian Tenera'];
const SOIL_TYPES = ['Loamy', 'Sandy Loam', 'Clay Loam', 'Sandy', 'Clay', 'Peat', 'Alluvial'];
const DRAINAGE_OPTIONS = ['Excellent', 'Good', 'Moderate', 'Poor'];
const SLOPE_OPTIONS = ['Flat (0-2%)', 'Gentle (2-5%)', 'Moderate (5-10%)', 'Steep (10-20%)', 'Very Steep (>20%)'];
const ACCESSIBILITY_OPTIONS = ['Easy Access', 'Moderate Access', 'Difficult Access', 'Remote'];
const STATUS_OPTIONS = ['Active', 'Development', 'Maintenance', 'Replanting'];

export default function CreateBlockScreen() {
  const router = useRouter();
  const { phaseName: initialPhaseName, phaseNumber: initialPhaseNumber } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    blockName: '',
    blockNumber: '',
    phaseName: (initialPhaseName as string) || '',
    phaseNumber: (initialPhaseNumber as string) || '',
    areaHectare: '',
    areaAcre: '',
    treesPerHectare: '',
    totalTrees: '',
    palmVariety: '',
    plantingDate: '',
    palmAge: '',
    status: 'Active',
    estimatedYield: '',
    soilType: '',
    drainage: '',
    slope: '',
    accessibility: '',
  });

  // Set initial phase data from params
  useEffect(() => {
    if (initialPhaseName) {
      setFormData(prev => ({
        ...prev,
        phaseName: initialPhaseName as string,
        phaseNumber: (initialPhaseNumber as string) || '',
      }));
    }
  }, [initialPhaseName, initialPhaseNumber]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate total trees when area and trees per hectare change
    if (field === 'areaHectare' || field === 'treesPerHectare') {
      const hectare = field === 'areaHectare' ? parseFloat(value) : parseFloat(formData.areaHectare);
      const treesPerHa = field === 'treesPerHectare' ? parseFloat(value) : parseFloat(formData.treesPerHectare);
      if (!isNaN(hectare) && !isNaN(treesPerHa)) {
        setFormData(prev => ({ ...prev, totalTrees: Math.round(hectare * treesPerHa).toString() }));
      }
    }

    // Auto-convert hectare to acre
    if (field === 'areaHectare') {
      const hectare = parseFloat(value);
      if (!isNaN(hectare)) {
        setFormData(prev => ({ ...prev, areaAcre: (hectare * 2.471).toFixed(2) }));
      }
    }

    // Auto-calculate palm age from planting date
    if (field === 'plantingDate' && value) {
      const plantDate = new Date(value);
      const today = new Date();
      const ageYears = ((today.getTime() - plantDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
      if (parseFloat(ageYears) >= 0) {
        setFormData(prev => ({ ...prev, palmAge: ageYears }));
      }
    }
  };

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
      if (buttons && buttons.length > 0) {
        // For web, just go back after success
        if (title === 'Success') {
          router.back();
        }
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.blockName || !formData.blockNumber || !formData.phaseName) {
      showAlert('Missing Info', 'Please fill in Block Name, Block Number, and Phase Name.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createBlock({
        blockName: formData.blockName,
        blockNumber: formData.blockNumber,
        phaseName: formData.phaseName,
        phaseNumber: formData.phaseNumber,
        areaHectare: formData.areaHectare,
        areaAcre: formData.areaAcre,
        treesPerHectare: formData.treesPerHectare,
        totalTrees: formData.totalTrees,
        palmVariety: formData.palmVariety,
        plantingDate: formData.plantingDate,
        palmAge: formData.palmAge,
        status: formData.status,
        estimatedYield: formData.estimatedYield,
        soilType: formData.soilType,
        drainage: formData.drainage,
        slope: formData.slope,
        accessibility: formData.accessibility,
      });

      if (response.success) {
        if (Platform.OS === 'web') {
          alert(`Success: Block "${formData.blockName}" created successfully!`);
          router.back();
        } else {
          Alert.alert(
            'Success',
            `Block "${formData.blockName}" created successfully!`,
            [
              {
                text: 'Add Trees',
                onPress: () => router.push(`/add-tree?blockName=${encodeURIComponent(formData.blockName)}`),
              },
              {
                text: 'Done',
                onPress: () => router.back(),
              },
            ]
          );
        }
      } else {
        showAlert('Error', response.error || 'Failed to create block. Please try again.');
      }
    } catch (error) {
      showAlert('Error', 'Failed to create block. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Block</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Block Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Block Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Block A-1"
                value={formData.blockName}
                onChangeText={(text) => handleInputChange('blockName', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Block Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Block Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1"
                value={formData.blockNumber}
                onChangeText={(text) => handleInputChange('blockNumber', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Phase Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phase Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Phase A"
                value={formData.phaseName}
                onChangeText={(text) => handleInputChange('phaseName', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Phase Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phase Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1"
                value={formData.phaseNumber}
                onChangeText={(text) => handleInputChange('phaseNumber', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Area Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📐 Area Information</Text>
            </View>

            {/* Area (Hectare) */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Area (Hectare)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.areaHectare}
                  onChangeText={(text) => handleInputChange('areaHectare', text)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Area (Acre)</Text>
                <TextInput
                  style={[styles.input, styles.readOnly]}
                  placeholder="Auto-calculated"
                  value={formData.areaAcre}
                  editable={false}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Trees Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌴 Palm Information</Text>
            </View>

            {/* Trees per Hectare & Total Trees */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Trees per Hectare</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 136"
                  value={formData.treesPerHectare}
                  onChangeText={(text) => handleInputChange('treesPerHectare', text)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Total Trees</Text>
                <TextInput
                  style={[styles.input, styles.readOnly]}
                  placeholder="Auto-calculated"
                  value={formData.totalTrees}
                  editable={false}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Palm Variety */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Palm Variety</Text>
              <View style={styles.optionList}>
                {PALM_VARIETIES.map((variety) => (
                  <TouchableOpacity
                    key={variety}
                    style={[
                      styles.optionButton,
                      formData.palmVariety === variety && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('palmVariety', variety)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.palmVariety === variety && styles.optionTextActive,
                      ]}
                    >
                      {variety}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Planting Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Planting Date</Text>
              {Platform.OS === 'web' ? (
                <View style={styles.dateInputContainer}>
                  <input
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => handleInputChange('plantingDate', e.target.value)}
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
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.plantingDate}
                  onChangeText={(text) => handleInputChange('plantingDate', text)}
                  placeholderTextColor="#999"
                />
              )}
            </View>

            {/* Palm Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Palm Age (Years)</Text>
              <TextInput
                style={[styles.input, styles.readOnly]}
                placeholder="Auto-calculated from planting date"
                value={formData.palmAge}
                editable={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.optionList}>
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.optionButton,
                      formData.status === status && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('status', status)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.status === status && styles.optionTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Estimated Yield */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Yield (MT/Ha/Year)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 25.5"
                value={formData.estimatedYield}
                onChangeText={(text) => handleInputChange('estimatedYield', text)}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>

            {/* Soil & Terrain Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌍 Soil & Terrain</Text>
            </View>

            {/* Soil Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Type</Text>
              <View style={styles.optionList}>
                {SOIL_TYPES.map((soil) => (
                  <TouchableOpacity
                    key={soil}
                    style={[
                      styles.optionButton,
                      formData.soilType === soil && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('soilType', soil)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.soilType === soil && styles.optionTextActive,
                      ]}
                    >
                      {soil}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Drainage */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drainage</Text>
              <View style={styles.optionList}>
                {DRAINAGE_OPTIONS.map((drainage) => (
                  <TouchableOpacity
                    key={drainage}
                    style={[
                      styles.optionButton,
                      formData.drainage === drainage && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('drainage', drainage)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.drainage === drainage && styles.optionTextActive,
                      ]}
                    >
                      {drainage}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Slope */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Slope</Text>
              <View style={styles.optionList}>
                {SLOPE_OPTIONS.map((slope) => (
                  <TouchableOpacity
                    key={slope}
                    style={[
                      styles.optionButton,
                      formData.slope === slope && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('slope', slope)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.slope === slope && styles.optionTextActive,
                      ]}
                    >
                      {slope}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Accessibility */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Accessibility</Text>
              <View style={styles.optionList}>
                {ACCESSIBILITY_OPTIONS.map((access) => (
                  <TouchableOpacity
                    key={access}
                    style={[
                      styles.optionButton,
                      formData.accessibility === access && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('accessibility', access)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.accessibility === access && styles.optionTextActive,
                      ]}
                    >
                      {access}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Create Block</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  form: {
    padding: 24,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  readOnly: {
    backgroundColor: '#F5F5F5',
    color: '#666666',
  },
  dateInputContainer: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
