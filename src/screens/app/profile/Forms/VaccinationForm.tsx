import ButtonComponent from "@/src/components/ButtonComponent";
import DatePickerComponent from "@/src/components/DatePickerComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


interface VaccinationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const VaccinationForm = ({ visible, onClose, onSubmit }: VaccinationFormProps) => {
  const insets = useSafeAreaInsets();
  const [vaccinated, setVaccinated] = useState<string>("no");
  const [vaccineName, setVaccineName] = useState<string>("");
  const [dose, setDose] = useState<string>("");
  const [vaccinationDate, setVaccinationDate] = useState<Date | undefined>();
  const [certificate, setCertificate] = useState<any>(null);

const handleUpload = async () => {
  const res = await DocumentPicker.getDocumentAsync({});
  // if (res === "success") {
  //   setCertificate(res);
  // } else {
  //   console.log("User cancelled");
  // }
};

  const handleSubmit = () => {
    onSubmit({
      vaccinated,
      vaccineName,
      dose,
      vaccinationDate,
      certificate,
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
              <View className="flex-grow justify-between flex-row">
                <Text className="text-h3 font-semibold mb-4">Add Vaccination Details</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle-outline" size={20} />
                </TouchableOpacity>
              </View>           
            <View className="mb-4">
              <FormLabel>Are you vaccinated?</FormLabel>
              <SelectComponent
                value={vaccinated}
                onChange={setVaccinated}
                placeholder="Select"
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
              />
            </View>

            {vaccinated === "yes" && (
              <>
                <View className="mb-4">
                  <FormLabel>Vaccine Name</FormLabel>
                  <InputComponent
                    value={vaccineName}
                    onChangeText={setVaccineName}
                    placeholder="Enter vaccine name"
                  />
                </View>

                <View className="mb-4">
                  <FormLabel>Dose Count</FormLabel>
                  <SelectComponent
                    value={dose}
                    onChange={setDose}
                    placeholder="Select dose"
                    options={[
                      { label: "Dose 1", value: "1" },
                      { label: "Dose 2", value: "2" },
                      { label: "Dose 3", value: "3" },
                      { label: "Booster", value: "booster" },
                    ]}
                  />
                </View>

                <View className="mb-4">
                  <FormLabel>Vaccination Date</FormLabel>
                  <DatePickerComponent
                    value={vaccinationDate}
                    onChange={setVaccinationDate}
                    placeholder="Select date"
                  />
                </View>

                <View className="mb-4">
                  <Text className="mb-1 text-small font-medium">Vaccination Certificate</Text>
                  <InputComponent
                    onPress={handleUpload}
                    rightIconName="cloud-upload"
                  >
                    
                    <Text className="ml-2">
                      {certificate ? certificate.name : "Upload certificate"}
                    </Text>
                  </InputComponent>
                </View>
              </>
            )}

            <View className="flex-row justify-end gap-3 mt-4">
              <ButtonComponent title="Cancel" onPress={onClose} variant="outlined" />
              <ButtonComponent title="Submit" onPress={handleSubmit} />
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
  );
};

export default VaccinationForm;
