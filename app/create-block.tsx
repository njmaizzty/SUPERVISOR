import { IconSymbol } from '@/components/ui/icon-symbol';
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

// Arrays for dropdown selection
const BLOCK_NAMES = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);
const BLOCK_NUMBERS = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

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
  });

  const [isLoading, setIsLoading] = useState(false);

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

{/* BLOCK NAME (Scrollable Picker) */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Block Name</Text>

  {/* Selected value box */}
  <View style={styles.selectedBox}>
    <Text style={styles.selectedBoxText}>
      {blockData.blockName
        ? `Selected Block: ${blockData.blockName}`
        : 'Please select a block name'}
    </Text>
  </View>

  {/* Scrollable Picker */}
  <View style={styles.pickerContainerLarge}>
    <Picker
      selectedValue={blockData.blockName}
      onValueChange={(value) => handleInputChange('blockName', value)}
      style={{ color: '#000', fontSize: 16, height: 180 }} // <- ensures selected value is black
  itemStyle={{ color: '#000', fontSize: 16 }}          // <- ensures all items are black
>
      <Picker.Item label="" value="" />
      {BLOCK_NAMES.map((name) => (
        <Picker.Item key={name} label={name} value={name} />
      ))}
    </Picker>
  </View>
</View>

{/* BLOCK NUMBER (Scrollable Picker) */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Block Number</Text>

  {/* Selected value box */}
  <View style={styles.selectedBox}>
    <Text style={styles.selectedBoxText}>
      {blockData.blockNumber
        ? `Selected Number: ${blockData.blockNumber}`
        : 'Please select a block number'}
    </Text>
  </View>

  {/* Scrollable Picker */}
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

            {/* PHASE NAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phase Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F0F0F0' }]}
                value={blockData.phaseName}
                editable={false}
              />
            </View>

            {/* PHASE NUMBER */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phase Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F0F0F0' }]}
                value={blockData.phaseNumber}
                editable={false}
              />
            </View>

            {/* AREA HECTARE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Area (hectare)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.areaHectare}
                onChangeText={(text) => handleInputChange('areaHectare', text)}
              />
            </View>

            {/* AREA ACRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Area (acre)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={blockData.areaAcre}
                onChangeText={(text) => handleInputChange('areaAcre', text)}
              />
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
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  submitButton: { height: 52, backgroundColor: '#2E7D32', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#CCCCCC' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  pickerContainer: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
},
pickerContainerLarge: {
  borderWidth: 2,
  borderColor: '#2E7D32',
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  height: 180,   // important for scrollable
  overflow: 'hidden',
  // remove justifyContent: 'center'
},

picker: {
  color: '#000',
  fontSize: 16,
  height: '100%', // ensures selected text is visible
},

selectedBox: {
  padding: 12,
  borderRadius: 10,
  backgroundColor: '#E8F5E9',
  borderWidth: 1,
  borderColor: '#2E7D32',
  marginBottom: 8,
},

selectedBoxText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#2E7D32',
},

});
