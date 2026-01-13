import { IconSymbol } from '@/components/ui/icon-symbol';
import { createTree } from '@/services/treeService';
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
const TAG_TYPES = ['QR Code', 'RFID', 'Barcode', 'Metal Tag', 'Paint Mark', 'None'];
const PALM_VARIETIES = ['Tenera', 'Dura', 'Pisifera', 'MPOB Clone', 'Deli Dura', 'Nigerian Tenera'];
const DISEASES = [
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
const STATUS_OPTIONS = ['Healthy', 'Diseased', 'Recovering', 'Dead', 'Replanted', 'Under Observation'];

export default function AddTreeScreen() {
  const router = useRouter();
  const { blockName } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    treeNumber: '',
    block: (blockName as string) || '',
    tagType: '',
    tagId: '',
    diseases: ['None'] as string[],
    notes: '',
    variety: '',
    plantingDate: '',
    age: '',
    height: '',
    trunkCircumference: '',
    status: 'Healthy',
    healthScore: '100',
    estimatedYield: '',
  });

  // Set block from params
  useEffect(() => {
    if (blockName) {
      setFormData(prev => ({
        ...prev,
        block: blockName as string,
      }));
    }
  }, [blockName]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate age from planting date
    if (field === 'plantingDate' && value) {
      const plantDate = new Date(value);
      const today = new Date();
      const ageYears = ((today.getTime() - plantDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
      if (parseFloat(ageYears) >= 0) {
        setFormData(prev => ({ ...prev, age: ageYears }));
      }
    }
  };

  const toggleDisease = (disease: string) => {
    setFormData(prev => {
      const currentDiseases = prev.diseases;
      if (disease === 'None') {
        return { ...prev, diseases: ['None'] };
      }
      
      let newDiseases = currentDiseases.filter(d => d !== 'None');
      if (newDiseases.includes(disease)) {
        newDiseases = newDiseases.filter(d => d !== disease);
      } else {
        newDiseases.push(disease);
      }
      return { ...prev, diseases: newDiseases.length === 0 ? ['None'] : newDiseases };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return '#4CAF50';
      case 'Diseased': return '#F44336';
      case 'Recovering': return '#FF9800';
      case 'Dead': return '#9E9E9E';
      case 'Replanted': return '#2196F3';
      case 'Under Observation': return '#9C27B0';
      default: return '#2E7D32';
    }
  };

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
      if (buttons && buttons.length > 0 && title === 'Success') {
        router.back();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.treeNumber || !formData.block) {
      showAlert('Missing Info', 'Please fill in Tree Number and Block.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createTree({
        treeNumber: formData.treeNumber,
        block: formData.block,
        tagType: formData.tagType,
        tagId: formData.tagId,
        diseases: formData.diseases,
        notes: formData.notes,
        variety: formData.variety,
        plantingDate: formData.plantingDate,
        age: formData.age,
        height: formData.height,
        trunkCircumference: formData.trunkCircumference,
        status: formData.status,
        healthScore: formData.healthScore,
        estimatedYield: formData.estimatedYield,
      });

      if (response.success) {
        if (Platform.OS === 'web') {
          alert(`Success: Tree #${formData.treeNumber} added successfully!`);
          router.back();
        } else {
          Alert.alert(
            'Success',
            `Tree #${formData.treeNumber} added successfully!`,
            [
              {
                text: 'Add Another Tree',
                onPress: () => {
                  // Reset form but keep block info
                  setFormData(prev => ({
                    ...prev,
                    treeNumber: '',
                    tagId: '',
                    notes: '',
                    height: '',
                    trunkCircumference: '',
                    estimatedYield: '',
                    diseases: ['None'],
                  }));
                },
              },
              {
                text: 'Done',
                onPress: () => router.back(),
              },
            ]
          );
        }
      } else {
        showAlert('Error', response.error || 'Failed to add tree. Please try again.');
      }
    } catch (error) {
      showAlert('Error', 'Failed to add tree. Please try again.');
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
        <Text style={styles.headerTitle}>Add Tree</Text>
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
            {/* Basic Info Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌴 Tree Identification</Text>
            </View>

            {/* Tree Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tree Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. T001"
                value={formData.treeNumber}
                onChangeText={(text) => handleInputChange('treeNumber', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Block */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Block *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Block A-1"
                value={formData.block}
                onChangeText={(text) => handleInputChange('block', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Tag Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏷️ Tag Information</Text>
            </View>

            {/* Tag Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tag Type</Text>
              <View style={styles.optionList}>
                {TAG_TYPES.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.optionButton,
                      formData.tagType === tag && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('tagType', tag)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.tagType === tag && styles.optionTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tag ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tag ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TAG-001-A1"
                value={formData.tagId}
                onChangeText={(text) => handleInputChange('tagId', text)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Health Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💚 Health Information</Text>
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
                      formData.status === status && { backgroundColor: getStatusColor(status), borderColor: getStatusColor(status) },
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

            {/* Health Score */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Health Score (0-100)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 100"
                value={formData.healthScore}
                onChangeText={(text) => handleInputChange('healthScore', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Diseases */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diseases</Text>
              <View style={styles.optionList}>
                {DISEASES.map((disease) => (
                  <TouchableOpacity
                    key={disease}
                    style={[
                      styles.optionButton,
                      formData.diseases.includes(disease) && (disease === 'None' ? styles.noneActive : styles.diseaseActive),
                    ]}
                    onPress={() => toggleDisease(disease)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.diseases.includes(disease) && styles.optionTextActive,
                      ]}
                    >
                      {disease}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formData.diseases.length > 0 && !formData.diseases.includes('None') && (
                <Text style={styles.selectedText}>
                  Selected: {formData.diseases.join(', ')}
                </Text>
              )}
            </View>

            {/* Palm Details Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌴 Palm Details</Text>
            </View>

            {/* Variety */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Variety</Text>
              <View style={styles.optionList}>
                {PALM_VARIETIES.map((variety) => (
                  <TouchableOpacity
                    key={variety}
                    style={[
                      styles.optionButton,
                      formData.variety === variety && styles.optionButtonActive,
                    ]}
                    onPress={() => handleInputChange('variety', variety)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.variety === variety && styles.optionTextActive,
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

            {/* Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age (Years)</Text>
              <TextInput
                style={[styles.input, styles.readOnly]}
                placeholder="Auto-calculated from planting date"
                value={formData.age}
                editable={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Measurements Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📏 Measurements</Text>
            </View>

            {/* Height & Trunk Circumference */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Height (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 12.5"
                  value={formData.height}
                  onChangeText={(text) => handleInputChange('height', text)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Trunk Circumference (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 180"
                  value={formData.trunkCircumference}
                  onChangeText={(text) => handleInputChange('trunkCircumference', text)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Estimated Yield */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Yield (kg/year)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 200"
                value={formData.estimatedYield}
                onChangeText={(text) => handleInputChange('estimatedYield', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional observations about this tree..."
                value={formData.notes}
                onChangeText={(text) => handleInputChange('notes', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
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
                <Text style={styles.submitButtonText}>Add Tree</Text>
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
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
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
  noneActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  diseaseActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  selectedText: {
    marginTop: 8,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
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
