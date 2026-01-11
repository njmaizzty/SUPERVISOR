import { IconSymbol } from '@/components/ui/icon-symbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
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

export default function CreateBlockScreen() {
  const router = useRouter();
  const { phaseData } = useLocalSearchParams();
  const parsedPhase = phaseData ? JSON.parse(phaseData as string) : {};

  const [blockData, setBlockData] = useState<any>({
    blockName: '',
    blockNumber: '',
    phaseName: parsedPhase.phaseName || '',
    phaseNumber: parsedPhase.phaseNumber || '',
    areaHectare: '',
    areaAcre: '',
    treesPerHectare: '',
    totalTrees: '',
    palmVariety: '',
    plantingDate: '', // string YYYY-MM-DD
    palmAge: '',
    status: '',
    estimatedYield: '',
    soilType: '',
    drainage: '',
    slope: '',
    accessibility: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPlantingDatePicker, setShowPlantingDatePicker] = useState(false);

  // Tap-to-select toggle states
  const [showPalmVarietyOptions, setShowPalmVarietyOptions] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [showSoilTypeOptions, setShowSoilTypeOptions] = useState(false);
  const [showDrainageOptions, setShowDrainageOptions] = useState(false);
  const [showAccessibilityOptions, setShowAccessibilityOptions] = useState(false);

  // Dropdown options
  const BLOCK_NAMES = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const BLOCK_NUMBERS = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
  const PALM_VARIETIES = ['Dura', 'Tenera', 'Pisifera'];
  const STATUS_OPTIONS = ['Active', 'Inactive'];
  const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Peaty'];
  const DRAINAGE_OPTIONS = ['Good', 'Moderate', 'Poor'];
  const ACCESSIBILITY_OPTIONS = ['Easy', 'Moderate', 'Difficult'];
  const PALM_AGE_OPTIONS = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
  const SLOPE_OPTIONS = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

  const handleInputChange = (field: string, value: string) => {
    setBlockData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCreateBlock = () => {
    const emptyFields = Object.entries(blockData)
      .filter(([_, value]) => !value || String(value).trim() === '')
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      Alert.alert(
        'Error',
        `Please fill in all fields. Missing: ${emptyFields.join(', ')}`
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/add-tree',
        params: {
          phaseData: JSON.stringify(parsedPhase),
          blockData: JSON.stringify(blockData),
        },
      });
    }, 1000);
  };

  // Render function for tap-to-select options
  const renderOptions = (options: string[], field: string, toggleFn: any) => (
    <View style={{ marginTop: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.optionButton}
          onPress={() => {
            handleInputChange(field, option);
            toggleFn(false);
          }}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Block</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Block Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Block Name</Text>
              <View style={styles.selectedBox}>
                <Text style={styles.selectedBoxText}>
                  {blockData.blockName
                    ? `Selected Block: ${blockData.blockName}`
                    : 'Please select a block name'}
                </Text>
              </View>
              <View style={styles.pickerContainerLarge}>
                <Picker
                  selectedValue={blockData.blockName}
                  onValueChange={(value) => handleInputChange('blockName', value)}
                  style={{ color: '#000', fontSize: 16, height: 180 }}
                  itemStyle={{ color: '#000', fontSize: 16 }}
                >
                  <Picker.Item label="" value="" />
                  {BLOCK_NAMES.map((name) => (
                    <Picker.Item key={name} label={name} value={name} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Block Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Block Number</Text>
              <View style={styles.selectedBox}>
                <Text style={styles.selectedBoxText}>
                  {blockData.blockNumber
                    ? `Selected Number: ${blockData.blockNumber}`
                    : 'Please select a block number'}
                </Text>
              </View>
              <View style={styles.pickerContainerLarge}>
                <Picker
                  selectedValue={blockData.blockNumber}
                  onValueChange={(value) => handleInputChange('blockNumber', value)}
                  style={{ color: '#000', fontSize: 16, height: 180 }}
                  itemStyle={{ color: '#000', fontSize: 16 }}
                >
                  <Picker.Item label="" value="" />
                  {BLOCK_NUMBERS.map((num) => (
                    <Picker.Item key={num} label={num} value={num} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Phase Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phase Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F0F0F0' }]}
                value={blockData.phaseName}
                editable={false}
              />
            </View>

            {/* Phase Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phase Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F0F0F0' }]}
                value={blockData.phaseNumber}
                editable={false}
              />
            </View>

            {/* Area Hectare */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Area (hectare)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.areaHectare}
                onChangeText={(text) => handleInputChange('areaHectare', text)}
              />
            </View>

            {/* Area Acre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Area (acre)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.areaAcre}
                onChangeText={(text) => handleInputChange('areaAcre', text)}
              />
            </View>

            {/* Trees per Hectare */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trees per Hectare</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.treesPerHectare}
                onChangeText={(text) => handleInputChange('treesPerHectare', text)}
              />
            </View>

            {/* Total Trees */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Trees</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.totalTrees}
                onChangeText={(text) => handleInputChange('totalTrees', text)}
              />
            </View>

            {/* Palm Variety */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Palm Variety</Text>
              <TouchableOpacity
                style={styles.selectedBox}
                onPress={() => setShowPalmVarietyOptions(!showPalmVarietyOptions)}
              >
                <Text style={styles.selectedBoxText}>
                  {blockData.palmVariety
                    ? `Selected: ${blockData.palmVariety}`
                    : 'Tap to select variety'}
                </Text>
              </TouchableOpacity>
              {showPalmVarietyOptions && renderOptions(PALM_VARIETIES, 'palmVariety', setShowPalmVarietyOptions)}
            </View>

            {/* Planting Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Planting Date</Text>
              <TouchableOpacity
                style={[styles.input, styles.centerContent]}
                onPress={() => setShowPlantingDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.centerText,
                    { color: blockData.plantingDate ? '#333' : '#999' },
                  ]}
                >
                  {blockData.plantingDate || 'Tap to select date'}
                </Text>
              </TouchableOpacity>
              {showPlantingDatePicker && (
                <DateTimePicker
                  value={
                    blockData.plantingDate
                      ? new Date(blockData.plantingDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowPlantingDatePicker(false);
                    if (date) {
                      handleInputChange(
                        'plantingDate',
                        date.toISOString().split('T')[0]
                      );
                    }
                  }}
                />
              )}
            </View>

            {/* Palm Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Palm Age (Years)</Text>
              <View style={styles.selectedBox}>
                <Text style={styles.selectedBoxText}>
                  {blockData.palmAge ? `Selected Age: ${blockData.palmAge}` : 'Please select palm age'}
                </Text>
              </View>
              <View style={styles.pickerContainerLarge}>
                <Picker
                  selectedValue={blockData.palmAge}
                  onValueChange={(value) => handleInputChange('palmAge', value)}
                  style={{ color: '#000', fontSize: 16, height: 180 }}
                  itemStyle={{ color: '#000', fontSize: 16 }}
                >
                  <Picker.Item label="" value="" />
                  {PALM_AGE_OPTIONS.map((age) => (
                    <Picker.Item key={age} label={age} value={age} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={styles.selectedBox}
                onPress={() => setShowStatusOptions(!showStatusOptions)}
              >
                <Text style={styles.selectedBoxText}>
                  {blockData.status ? `Selected: ${blockData.status}` : 'Tap to select status'}
                </Text>
              </TouchableOpacity>
              {showStatusOptions && renderOptions(STATUS_OPTIONS, 'status', setShowStatusOptions)}
            </View>

            {/* Estimated Yield */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Yield (kg/ha)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.estimatedYield}
                onChangeText={(text) => handleInputChange('estimatedYield', text)}
              />
            </View>

            {/* Soil Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Type</Text>
              <TouchableOpacity
                style={styles.selectedBox}
                onPress={() => setShowSoilTypeOptions(!showSoilTypeOptions)}
              >
                <Text style={styles.selectedBoxText}>
                  {blockData.soilType ? `Selected: ${blockData.soilType}` : 'Tap to select soil type'}
                </Text>
              </TouchableOpacity>
              {showSoilTypeOptions && renderOptions(SOIL_TYPES, 'soilType', setShowSoilTypeOptions)}
            </View>

            {/* Drainage */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drainage</Text>
              <TouchableOpacity
                style={styles.selectedBox}
                onPress={() => setShowDrainageOptions(!showDrainageOptions)}
              >
                <Text style={styles.selectedBoxText}>
                  {blockData.drainage ? `Selected: ${blockData.drainage}` : 'Tap to select drainage'}
                </Text>
              </TouchableOpacity>
              {showDrainageOptions && renderOptions(DRAINAGE_OPTIONS, 'drainage', setShowDrainageOptions)}
            </View>

            {/* Slope */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Slope (%)</Text>
              <View style={styles.selectedBox}>
                <Text style={styles.selectedBoxText}>
                  {blockData.slope ? `Selected Slope: ${blockData.slope}%` : 'Please select slope'}
                </Text>
              </View>
              <View style={styles.pickerContainerLarge}>
                <Picker
                  selectedValue={blockData.slope}
                  onValueChange={(value) => handleInputChange('slope', value)}
                  style={{ color: '#000', fontSize: 16, height: 180 }}
                  itemStyle={{ color: '#000', fontSize: 16 }}
                >
                  <Picker.Item label="" value="" />
                  {SLOPE_OPTIONS.map((s) => (
                    <Picker.Item key={s} label={s} value={s} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Accessibility */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Accessibility</Text>
              <TouchableOpacity
                style={styles.selectedBox}
                onPress={() => setShowAccessibilityOptions(!showAccessibilityOptions)}
              >
                <Text style={styles.selectedBoxText}>
                  {blockData.accessibility ? `Selected: ${blockData.accessibility}` : 'Tap to select accessibility'}
                </Text>
              </TouchableOpacity>
              {showAccessibilityOptions && renderOptions(ACCESSIBILITY_OPTIONS, 'accessibility', setShowAccessibilityOptions)}
            </View>

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleCreateBlock}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Creating Block...' : 'Create Block'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  placeholder: { width: 40 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  form: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 8 },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  centerText: { fontSize: 16, textTransform: 'uppercase', textAlign: 'center' },
  selectedBox: {
    height: 52,
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  selectedBoxText: { fontSize: 16, textTransform: 'uppercase', textAlign: 'center' },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    marginBottom: 6,
  },
  optionText: { fontSize: 16, textAlign: 'center' },
  pickerContainerLarge: {
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    height: 180,
    backgroundColor: '#fff',
  },
  footer: { padding: 24, backgroundColor: '#fff' },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#A5D6A7' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
