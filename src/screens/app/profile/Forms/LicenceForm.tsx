import ButtonComponent from "@/src/components/ButtonComponent";
import DatePickerComponent from "@/src/components/DatePickerComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LicenceFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}


const nursingLicenseTypeOptions = [
  { label: "Registered Nurse (RN)", value: "RN" },
  { label: "Licensed Practical Nurse (LPN)", value: "LPN" },
  { label: "Licensed Vocational Nurse (LVN)", value: "LVN" },
  { label: "Nurse Practitioner (NP)", value: "NP" },
  { label: "Advanced Practice Registered Nurse (APRN)", value: "APRN" },
];

const stateOptions = [
  { label: "California", value: "CA" },
  { label: "Texas", value: "TX" },
  { label: "New York", value: "NY" },
  { label: "Florida", value: "FL" },
];

const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const specialtyOptions = [
  { label: "ICU", value: "ICU" },
  { label: "ER", value: "ER" },
  { label: "Pediatric", value: "Pediatric" },
  { label: "Surgical", value: "Surgical" },
  { label: "Oncology", value: "Oncology" },
  { label: "Telehealth", value: "Telehealth" },
  { label: "Trauma", value: "Trauma" },
  { label: "OR", value: "OR" },
];

const LicenceForm = ({ visible, onClose, onSubmit, initialData }: LicenceFormProps) => {
  const insets = useSafeAreaInsets();
  const [licenseType, setLicenseType] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [isMultiState, setIsMultiState] = useState("");
  const [specialtyCertifications, setSpecialtyCertifications] = useState<string[]>([]);
  const [credentialFile, setCredentialFile] = useState<any>(null);

  // Populate form when editing
  React.useEffect(() => {
    if (initialData) {
      setLicenseType(initialData.licenseType || "");
      setStates(initialData.states || []);
      setLicenseNumber(initialData.licenseNumber || "");
      setExpiryDate(initialData.expiryDate ? new Date(initialData.expiryDate) : undefined);
      setIsMultiState(initialData.isMultiState ? "yes" : "no");
      setSpecialtyCertifications(initialData.specialties || []);
    } else {
      // Reset form when adding new
      setLicenseType("");
      setStates([]);
      setLicenseNumber("");
      setExpiryDate(undefined);
      setIsMultiState("");
      setSpecialtyCertifications([]);
      setCredentialFile(null);
    }
  }, [initialData, visible]);

  const handleUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (res.assets?.length) {
      setCredentialFile(res.assets[0]);
    }
  };

  const handleSubmit = () => {
    // Format date as YYYY-MM-DD
    const formattedDate = expiryDate
      ? `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}`
      : "";

    onSubmit({
      licenseType,
      states,
      licenseNumber,
      expiryDate: formattedDate,
      isMultiState: isMultiState === "yes" ? "true" : "false",
      specialties: specialtyCertifications,
      credentialFile,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-white rounded-t-2xl p-4 max-h-[90%]"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-h3 font-semibold">Add License Details</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle-outline" size={22} />
                </TouchableOpacity>
              </View>

            <View className="mb-4">
              <FormLabel>Nursing License Type</FormLabel>
              <SelectComponent
                value={licenseType}
                onChange={setLicenseType}
                placeholder="Select license type"
                options={nursingLicenseTypeOptions}
              />
            </View>

            <View className="mb-4">
              <FormLabel>License State(s)</FormLabel>
              <SelectComponent
                value={states}
                onChange={setStates}
                placeholder="Select state(s)"
                options={stateOptions}
                multiple
              />
            </View>

            <View className="mb-4">
              <FormLabel>License Number</FormLabel>
              <InputComponent
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="Enter license number"
              />
            </View>

            <View className="mb-4">
              <FormLabel>Expiry Date</FormLabel>
              <DatePickerComponent
                value={expiryDate}
                onChange={setExpiryDate}
                placeholder="Select expiry date"
              />
            </View>

            <View className="mb-4">
              <FormLabel>Multi-State License</FormLabel>
              <SelectComponent
                value={isMultiState}
                onChange={setIsMultiState}
                placeholder="Select"
                options={yesNoOptions}
              />
            </View>

            <View className="mb-4">
              <FormLabel>Specialty Certifications</FormLabel>
              <SelectComponent
                value={specialtyCertifications}
                onChange={setSpecialtyCertifications}
                placeholder="Select specialties"
                options={specialtyOptions}
                multiple
              />
            </View>

            <View className="mb-4">
              <FormLabel>Credential Upload (PDF/JPG)</FormLabel>
              <InputComponent onPress={handleUpload} rightIconName="cloud-upload">
                <Text className="ml-2">
                  {credentialFile ? credentialFile.name : "Upload document"}
                </Text>
              </InputComponent>
            </View>

            <View className="flex-row justify-end gap-3 mt-4">
              <ButtonComponent title="Cancel" variant="outlined" onPress={onClose} />
              <ButtonComponent title="Submit" onPress={handleSubmit} />
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
  );
};

export default LicenceForm;
