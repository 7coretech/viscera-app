import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const salaryTypeOptions = [
  { label: "Annual Salary", value: "Annual Salary" },
];

const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const preferredBenefits = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "401(k) Matching",
  "Paid Time Off",
  "Signing Bonus",
  "Relocation Assistance",
  "Housing Stipend",
  "Travel Reimbursement",
  "Continuing Education",
  "Tuition Reimbursement",
  "Life Insurance",
];

const Compensation = () => {
  const theme = useTheme();
  const router = useRouter();

  const [salaryType, setSalaryType] = useState("Annual Salary");
  const [minimumSalary, setMinimumSalary] = useState("");
  const [maximumSalary, setMaximumSalary] = useState("");
  const [salaryNegotiable, setSalaryNegotiable] = useState(true);
  const [expectedHourlyRate, setExpectedHourlyRate] = useState("");
  const [expectedWeeklyPay, setExpectedWeeklyPay] = useState("");
  const [expectedTravelPackage, setExpectedTravelPackage] = useState("");
  const [housingNeeded, setHousingNeeded] = useState("");
  const [stipendRequired, setStipendRequired] = useState("");
  const [visaAssistanceRequired, setVisaAssistanceRequired] = useState("");
  const [sponsorshipRequired, setSponsorshipRequired] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [hasCompensation, setHasCompensation] = useState(false);

  useEffect(() => {
    fetchCompensation();
  }, []);

  const fetchCompensation = async () => {
    try {
      const response = await appService.getCompensation();
      if (response.data.success && response.data.data) {
        const data = response.data.data;

        setSalaryType(data.salaryType || "Annual Salary");
        setMinimumSalary(data.salaryRange?.minimum?.toString() || "");
        setMaximumSalary(data.salaryRange?.maximum?.toString() || "");
        setSalaryNegotiable(data.salaryRange?.isNegotiable ?? true);

        setExpectedHourlyRate(data.additionalCompensation?.expectedHourlyRate?.toString() || "");
        setExpectedWeeklyPay(data.additionalCompensation?.expectedWeeklyPay?.toString() || "");
        setExpectedTravelPackage(data.additionalCompensation?.expectedTravelPackage || "");

        setHousingNeeded(data.requirements?.accommodationNeeded ? "Yes" : "No");
        setStipendRequired(data.requirements?.stipendRequired ? "Yes" : "No");
        setVisaAssistanceRequired(data.requirements?.visaAssistanceRequired ? "Yes" : "No");
        setSponsorshipRequired(data.requirements?.sponsorshipRequired ? "Yes" : "No");

        setSelectedBenefits(data.preferredBenefits || []);

        setHasCompensation(true);
      }
    } catch (error) {
      console.log('Error fetching compensation:', error);
    }
  };

  const handleBenefitToggle = (benefit: string) => {
    if (selectedBenefits.includes(benefit)) {
      setSelectedBenefits(selectedBenefits.filter((b) => b !== benefit));
    } else {
      setSelectedBenefits([...selectedBenefits, benefit]);
    }
  };

  const handleSave = async () => {
    const payload = {
      salaryType,
      salaryRange: {
        minimum: minimumSalary ? parseInt(minimumSalary) : 0,
        maximum: maximumSalary ? parseInt(maximumSalary) : 0,
        isNegotiable: salaryNegotiable,
      },
      additionalCompensation: {
        expectedHourlyRate: expectedHourlyRate ? parseFloat(expectedHourlyRate) : null,
        expectedWeeklyPay: expectedWeeklyPay ? parseFloat(expectedWeeklyPay) : null,
        expectedTravelPackage: expectedTravelPackage || null,
      },
      requirements: {
        accommodationNeeded: housingNeeded === "Yes",
        stipendRequired: stipendRequired === "Yes",
        visaAssistanceRequired: visaAssistanceRequired === "Yes",
        sponsorshipRequired: sponsorshipRequired === "Yes",
      },
      preferredBenefits: selectedBenefits,
    };

    try {
      let response;
      if (hasCompensation) {
        response = await appService.updateCompensation(payload);
      } else {
        response = await appService.saveCompensation(payload);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Compensation details saved successfully.");
        setHasCompensation(true);
      }
    } catch (error: any) {
      console.log("Error saving compensation:", error);
      toast.error(
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            error.message ||
            "Failed to save compensation."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-light">
        <TouchableOpacity
          onPress={() => {
            router.push("/app/(tabs)/profile");
          }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.palette.gery.darkGray}
          />
        </TouchableOpacity>

        <Text className="text-h2 font-semibold text-text-primary ml-4">
          Compensation
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
      >

        <View className="mb-4">
          <FormLabel>Salary Type</FormLabel>
          <SelectComponent
            value={salaryType}
            onChange={setSalaryType}
            options={salaryTypeOptions}
            placeholder="Select Type"

          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <FormLabel>Minimum</FormLabel>
            <InputComponent
              value={minimumSalary}
              onChangeText={setMinimumSalary}
              placeholder="0"
              keyboardType="numeric"
              rightIconName="cash-outline"
              rightIconColor={theme.palette.text.secondary}
            />
          </View>

          <View className="flex-1">
            <FormLabel>Maximum</FormLabel>
            <InputComponent
              value={maximumSalary}
              onChangeText={setMaximumSalary}
              placeholder="0"
              keyboardType="numeric"
              rightIconName="cash-outline"
              rightIconColor={theme.palette.text.secondary}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setSalaryNegotiable(!salaryNegotiable)}
          className="flex-row items-center mb-6"
        >
          <View
            className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${salaryNegotiable
                ? "bg-primary-main border-primary-main"
                : "bg-white border-gray-medium"
              }`}
          >
            {salaryNegotiable && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
          <Text className="text-h5 text-text-primary flex-1">
            Salary is negotiable for the right opportunity
          </Text>
        </TouchableOpacity>

        <Text className="text-h4 font-semibold text-text-secondary mb-4">
          Additional Compensation Requirements
        </Text>

        <View className="mb-4">
          <FormLabel>Expected Hourly Rate (Optional)</FormLabel>
          <InputComponent
            value={expectedHourlyRate}
            onChangeText={setExpectedHourlyRate}
            placeholder="0.00"
            keyboardType="numeric"
            rightIconName="cash-outline"
            rightIconColor={theme.palette.text.secondary}
          />
        </View>

        <View className="mb-4">
          <FormLabel>Expected Weekly Pay (Optional)</FormLabel>
          <InputComponent
            value={expectedWeeklyPay}
            onChangeText={setExpectedWeeklyPay}
            placeholder="0.00"
            keyboardType="numeric"
            rightIconName="cash-outline"
            rightIconColor={theme.palette.text.secondary}
          />
        </View>

        <View className="mb-4">
          <FormLabel>Expected Travel Package</FormLabel>
          <InputComponent
            value={expectedTravelPackage}
            onChangeText={setExpectedTravelPackage}
            placeholder="e.g., $500 monthly"
          />
        </View>

        <View className="mb-4">
          <FormLabel>Accommodation Needed?</FormLabel>
          <SelectComponent
            value={housingNeeded}
            onChange={setHousingNeeded}
            options={yesNoOptions}
            placeholder="Select Yes/No"
          />
        </View>

        <View className="mb-4">
          <FormLabel>Stipend Required?</FormLabel>
          <SelectComponent
            value={stipendRequired}
            onChange={setStipendRequired}
            options={yesNoOptions}
            placeholder="Select Yes/No"
          />
        </View>

        <View className="mb-4">
          <FormLabel>Visa Assistance Required?</FormLabel>
          <SelectComponent
            value={visaAssistanceRequired}
            onChange={setVisaAssistanceRequired}
            options={yesNoOptions}
            placeholder="Select Yes/No"
          />
        </View>

        <View className="mb-4">
          <FormLabel>Sponsorship Required?</FormLabel>
          <SelectComponent
            value={sponsorshipRequired}
            onChange={setSponsorshipRequired}
            options={yesNoOptions}
            placeholder="Select Yes/No"
          />
        </View>

        <View className="mb-6">
          <Text className="text-h4 font-semibold text-text-secondary mb-3">
            Preferred Benefits
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {preferredBenefits.map((benefit) => {
              const isSelected = selectedBenefits.includes(benefit);
              return (
                <TouchableOpacity
                  key={benefit}
                  onPress={() => handleBenefitToggle(benefit)}
                  className={`px-4 py-2 rounded-full border ${isSelected
                      ? "bg-primary-main border-primary-main"
                      : "bg-white border-gray-medium"
                    }`}
                >
                  <Text
                    className={`text-small font-medium ${isSelected ? "text-white" : "text-text-secondary"
                      }`}
                  >
                    {benefit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-2 mt-auto">
        <ButtonComponent
          title="Save Compensation"
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
};

export default Compensation;