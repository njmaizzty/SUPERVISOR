import { IconSymbol } from "@/components/ui/icon-symbol";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
} from "react-native";

export default function AddTreeScreen() {
  const router = useRouter();
  const { phaseData, blockData } = useLocalSearchParams();
  const parsedPhase = phaseData ? JSON.parse(phaseData as string) : {};
  const parsedBlock = blockData ? JSON.parse(blockData as string) : {};

  const [treeData, setTreeData] = useState<any>({
    treeNumber: '',
    block: parsedBlock.blockName || '',
    tagType: '',
    tagID: '',
    diseases: '',
    notes: '',
    variety: '',
    plantingDate: '',
    age: '',
    height: '',
    trunkCircumference: '',
    status: '',
    healthScore: '',
    estimatedYield: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setTreeData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddTree = () => {
    if (!treeData.treeNumber) {
      Alert.alert("Error", "Tree Number is required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: "/areas",
        params: {
          areaData: JSON.stringify({
            phase: parsedPhase,
            block: parsedBlock,
            trees: [treeData],
          }),
        },
      });
    }, 1000);
  };

  const numbers1to100 = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
  const lettersAtoZ = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const tagTypes = ["Metal", "Plastic"];
  const varieties = ["Dura", "Tenera", "Hybrid"];
  const statuses = ["Active", "Inactive", "Dead"];

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
        <Text style={styles.headerTitle}>Add New Tree</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Tree Number */}
            <Text style={styles.label}>Tree Number</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={treeData.treeNumber}
                onValueChange={(itemValue) => handleInputChange("treeNumber", itemValue)}
              >
                {numbers1to100.map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              </Picker>
            </View>

            {/* Block */}
            <Text style={styles.label}>Block</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={treeData.block}
                onValueChange={(itemValue) => handleInputChange("block", itemValue)}
              >
                {lettersAtoZ.map((letter) => (
                  <Picker.Item key={letter} label={letter} value={letter} />
                ))}
              </Picker>
            </View>

            {/* Tag Type */}
            <Text style={styles.label}>Tag Type</Text>
            <View style={styles.optionContainer}>
              {tagTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    treeData.tagType === type && styles.optionSelected,
                  ]}
                  onPress={() => handleInputChange("tagType", type)}
                >
                  <Text>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {treeData.tagType ? <Text>Selected: {treeData.tagType}</Text> : null}

            {/* Tag ID */}
            <Text style={styles.label}>Tag ID</Text>
            <TextInput
              style={styles.input}
              placeholder="T-001"
              value={treeData.tagID}
              onChangeText={(text) => handleInputChange("tagID", text)}
            />

            {/* Diseases */}
            <Text style={styles.label}>Diseases</Text>
            <TextInput
              style={styles.input}
              placeholder="None"
              value={treeData.diseases}
              onChangeText={(text) => handleInputChange("diseases", text)}
            />

            {/* Notes */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Additional notes..."
              value={treeData.notes}
              onChangeText={(text) => handleInputChange("notes", text)}
            />

            {/* Variety */}
            <Text style={styles.label}>Variety</Text>
            <View style={styles.optionContainer}>
              {varieties.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.optionButton,
                    treeData.variety === v && styles.optionSelected,
                  ]}
                  onPress={() => handleInputChange("variety", v)}
                >
                  <Text>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {treeData.variety ? <Text>Selected: {treeData.variety}</Text> : null}

            {/* Planting Date */}
            <Text style={styles.label}>Planting Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{treeData.plantingDate || "Select date"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={treeData.plantingDate ? new Date(treeData.plantingDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    handleInputChange(
                      "plantingDate",
                      selectedDate.toISOString().split("T")[0]
                    );
                  }
                }}
              />
            )}

            {/* Age */}
            <Text style={styles.label}>Age (years)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={treeData.age}
                onValueChange={(itemValue) => handleInputChange("age", itemValue)}
              >
                {numbers1to100.map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              </Picker>
            </View>

            {/* Height */}
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="250"
              keyboardType="numeric"
              value={treeData.height}
              onChangeText={(text) => handleInputChange("height", text)}
            />

            {/* Trunk Circumference */}
            <Text style={styles.label}>Trunk Circumference (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="35"
              keyboardType="numeric"
              value={treeData.trunkCircumference}
              onChangeText={(text) => handleInputChange("trunkCircumference", text)}
            />

            {/* Status */}
            <Text style={styles.label}>Status</Text>
            <View style={styles.optionContainer}>
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionButton,
                    treeData.status === s && styles.optionSelected,
                  ]}
                  onPress={() => handleInputChange("status", s)}
                >
                  <Text>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {treeData.status ? <Text>Selected: {treeData.status}</Text> : null}

            {/* Health Score */}
            <Text style={styles.label}>Health Score (%)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={treeData.healthScore}
                onValueChange={(itemValue) => handleInputChange("healthScore", itemValue)}
              >
                {numbers1to100.map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              </Picker>
            </View>

            {/* Estimated Yield */}
            <Text style={styles.label}>Estimated Yield (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="250"
              keyboardType="numeric"
              value={treeData.estimatedYield}
              onChangeText={(text) => handleInputChange("estimatedYield", text)}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleAddTree}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "Adding Tree..." : "Add Tree"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFE" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E8F5E8", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1A237E" },
  placeholder: { width: 40 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  form: { padding: 24 },
  label: { fontSize: 16, fontWeight: "600", color: "#333333", marginBottom: 8 },
  input: { height: 52, borderWidth: 2, borderColor: "#E0E0E0", borderRadius: 12, paddingHorizontal: 16, fontSize: 16, backgroundColor: "#FFFFFF", color: "#333333", marginBottom: 20 },
  pickerContainer: { borderWidth: 2, borderColor: "#E0E0E0", borderRadius: 12, marginBottom: 20 },
  optionContainer: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginBottom: 8 },
  optionButton: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: "#999999", borderRadius: 8 },
  optionSelected: { backgroundColor: "#2E7D32", borderColor: "#2E7D32", color: "#FFFFFF" },
  footer: { padding: 24, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  submitButton: { height: 52, backgroundColor: "#2E7D32", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  submitButtonDisabled: { backgroundColor: "#CCCCCC" },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
