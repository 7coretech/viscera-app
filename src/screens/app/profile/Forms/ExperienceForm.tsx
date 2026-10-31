import ButtonComponent from "@/src/components/ButtonComponent";
import DatePickerComponent from "@/src/components/DatePickerComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

interface ExperienceFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // Add initialData for editing
}


const jobTypeOptions = [
  { label: "Full-Time", value: "Full-Time" },
  { label: "Part-Time", value: "Part-Time" },
  { label: "Contract", value: "Contract" },
  { label: "PRN", value: "PRN" },
  { label: "Per-Diem", value: "Per-Diem" },
  { label: "Others", value: "Others" },
];

const shiftTypeOptions = [
  { label: "Day", value: "Day" },
  { label: "Night", value: "Night" },
  { label: "Rotational", value: "Rotational" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Other", value: "Other" },
  { label: "Not Applicable", value: "Not Applicable" },
];

// Contract duration is now a number (weeks), so we don't need options for it, but we use Input.

const yesNoOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const ExperienceForm = ({ visible, onClose, onSubmit, initialData }: ExperienceFormProps) => {
  const insets = useSafeAreaInsets();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [specialty, setSpecialty] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [jobType, setJobType] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [contractDurationWeeks, setContractDurationWeeks] = useState("");
  const [location, setLocation] = useState("");
  const [highAcuitySetting, setHighAcuitySetting] = useState(""); // "true" or "false" string for select

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setStartDate(initialData.startDate ? new Date(initialData.startDate) : undefined);
        setEndDate(initialData.endDate ? new Date(initialData.endDate) : undefined);
        setSpecialty(initialData.specialty || "");
        setPositionTitle(initialData.positionTitle || "");
        setEmployer(initialData.employer || "");
        setJobType(initialData.jobType || "");
        setShiftType(initialData.shiftType || "");
        setContractDurationWeeks(initialData.contractDurationWeeks ? String(initialData.contractDurationWeeks) : "");
        setLocation(initialData.location || "");
        setHighAcuitySetting(initialData.highAcuitySetting !== undefined ? String(initialData.highAcuitySetting) : "false");
      } else {
        // Reset form
        setStartDate(undefined);
        setEndDate(undefined);
        setSpecialty("");
        setPositionTitle("");
        setEmployer("");
        setJobType("");
        setShiftType("");
        setContractDurationWeeks("");
        setLocation("");
        setHighAcuitySetting("false");
      }
    }
  }, [visible, initialData]);


  const handleSubmit = () => {
    onSubmit({
      startDate,
      endDate,
      specialty,
      positionTitle,
      employer,
      jobType,
      shiftType,
      contractDurationWeeks: contractDurationWeeks ? parseInt(contractDurationWeeks, 10) : null,
      location,
      highAcuitySetting: highAcuitySetting === "true",
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
                <Text className="text-h3 font-semibold text-text-primary">
                  {initialData ? "Edit Experience" : "Add Experience"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle-outline" size={22} />
                </TouchableOpacity>
              </View>

            <View className="mb-4">
              <FormLabel>Start Date</FormLabel>
              <DatePickerComponent
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </View>

            <View className="mb-4">
              <FormLabel>End Date</FormLabel>
              <DatePickerComponent
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date (optional)"
              />
            </View>

            <View className="mb-4">
              <FormLabel>Specialty</FormLabel>
              <InputComponent
                placeholder="e.g. Emergency Nursing"
                value={specialty}
                onChangeText={setSpecialty}
              />
            </View>

            <View className="mb-4">
              <FormLabel>Position Title</FormLabel>
              <InputComponent
                placeholder="e.g. Registered Nurse"
                value={positionTitle}
                onChangeText={setPositionTitle}
              />
            </View>

            <View className="mb-4">
              <FormLabel>Employer</FormLabel>
              <InputComponent
                placeholder="e.g. Gotham General Hospital"
                value={employer}
                onChangeText={setEmployer}
              />
            </View>

            <View className="mb-4">
              <FormLabel>Job Type</FormLabel>
              <SelectComponent
                value={jobType}
                onChange={setJobType}
                placeholder="Select job type"
                options={jobTypeOptions}
              />
            </View>

            <View className="mb-4">
              <FormLabel>Shift Type</FormLabel>
              <SelectComponent
                value={shiftType}
                onChange={setShiftType}
                placeholder="Select shift type"
                options={shiftTypeOptions}
              />
            </View>

            <View className="mb-4">
              <FormLabel>Contract Duration (Weeks)</FormLabel>
              <InputComponent
                placeholder="e.g. 13"
                value={contractDurationWeeks}
                onChangeText={setContractDurationWeeks}
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <FormLabel>Location</FormLabel>
              <InputComponent
                placeholder="e.g. Houston, TX"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View className="mb-4">
              <FormLabel>High-Acuity Setting</FormLabel>
              <SelectComponent
                value={highAcuitySetting}
                onChange={setHighAcuitySetting}
                placeholder="Select"
                options={yesNoOptions}
              />
            </View>

            <View className="flex-row justify-end gap-3 mt-4 mb-6">
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

export default ExperienceForm;
