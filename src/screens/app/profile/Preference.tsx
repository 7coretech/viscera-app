import ButtonComponent from "@/src/components/ButtonComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const travelOptions = ["Travel Nurse", "Stationary Nurse", "Hybrid"];
const relocationCountryOptions = ["USA", "UK", "Canada", "Australia", "Ireland"];
const countryOptions = ["USA", "UK", "Canada", "Australia", "Ireland", "New Zealand", "Europe"];

const stateOptionsByCountry: Record<string, string[]> = {
  USA: [
    "California", "Texas", "Florida", "New York", "Illinois",
    "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan",
    "Washington", "Massachusetts", "Arizona", "Colorado"
  ],
  UK: [
    "England - Greater London", "England - South East", "England - North West",
    "England - Midlands", "Scotland", "Wales", "Northern Ireland"
  ],
  Canada: [
    "Ontario", "British Columbia", "Alberta", "Quebec", "Manitoba", "Nova Scotia"
  ],
  Australia: [
    "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia"
  ],
  Ireland: [
    "Dublin", "Cork", "Galway", "Limerick"
  ]
};

const stateOptions = stateOptionsByCountry["USA"] || [];

const primaryCategoriesOptions = [
  { label: "Travel Nurse", value: "Travel Nurse" },
  { label: "Stationary Nurse", value: "Stationary Nurse" },
  { label: "Specialized Nurse", value: "Specialized Nurse" },
  { label: "Crisis / Humanitarian Nurse", value: "Crisis / Humanitarian Nurse" },
];

const humanitarianRolesOptions = [
  "Humanitarian Nurse",
  "Relief Nurse",
  "Emergency Response Nurse",
  "Global Health Nurse",
  "Medical Missionary Nurse",
  "Field Nurse",
  "Disaster Relief Nurse",
];

const Preference: React.FC = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [willingnessToRelocate, setWillingnessToRelocate] = useState(false);
  const [relocationCountry, setRelocationCountry] = useState<string>("USA");
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [travelPreference, setTravelPreference] = useState<string[]>([]);
  const [relocationStates, setRelocationStates] = useState<string[]>([]);
  const [internationalRelocation, setInternationalRelocation] = useState(false);
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<string[]>([]);
  const [humanitarianRole, setHumanitarianRole] = useState<string[]>([]);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await appService.getPreferences();
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;

        // Map API data to state
        const savedStates = data.relocationPreferences || [];
        setRelocationStates(savedStates);
        setWillingnessToRelocate(savedStates.length > 0);

        // Auto-detect country based on saved state
        if (savedStates.length > 0) {
          const firstState = savedStates[0];
          for (const [country, states] of Object.entries(stateOptionsByCountry)) {
            if (states.includes(firstState)) {
              setRelocationCountry(country);
              break;
            }
          }
        }

        const savedTravel = data.travelPreferences || [];
        setTravelPreference(savedTravel);
        setWillingToTravel(savedTravel.length > 0);

        const savedIntl = data.internationalRelocationPreferences || [];
        setPreferredCountries(savedIntl);
        setInternationalRelocation(savedIntl.length > 0);

        // Normalize legacy values
        const legacyMapping: Record<string, string> = {
          travel: "Travel Nurse",
          stationary: "Stationary Nurse",
          specialized: "Specialized Nurse",
          humanitarian: "Crisis / Humanitarian Nurse",
        };

        const rawCategories = data.primaryCategories || [];
        const normalizedCategories = (rawCategories || []).map((c: string) => legacyMapping[c] || c);
        const uniqueCategories = Array.from(new Set(normalizedCategories)) as string[];
        setPrimaryCategory(uniqueCategories);

        setHumanitarianRole(data.crisisHumanitarianPreferences || []);
        setHasPreferences(true);
      }
    } catch (error) {
      console.log('Error fetching preferences:', error);
    }
  };

  const toggleArrayValue = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSave = async () => {
    const validCategoryValues = primaryCategoriesOptions.map(o => o.value);
    const cleanedPrimaryCategories = primaryCategory.filter(c => validCategoryValues.includes(c));

    const payload = {
      relocationPreferences: willingnessToRelocate ? relocationStates : [],
      travelPreferences: willingToTravel ? travelPreference : [],
      internationalRelocationPreferences: internationalRelocation ? preferredCountries : [],
      primaryCategories: cleanedPrimaryCategories,
      crisisHumanitarianPreferences: primaryCategory.includes("Crisis / Humanitarian Nurse") ? humanitarianRole : [],
    };

    try {
      let response;
      if (hasPreferences) {
        response = await appService.updatePreferences(payload);
      } else {
        response = await appService.savePreferences(payload);
      }

      if (response?.data?.success) {
        toast.success(response.data.message || "Preferences saved successfully.");
        setHasPreferences(true);
      }
    } catch (error: any) {
      console.log('Error saving preferences:', error);
      toast.error(
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            error.message ||
            "Failed to save preferences."
      );
    }
  };

  const availableStates = stateOptionsByCountry[relocationCountry] || stateOptionsByCountry["USA"] || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center px-4 py-3 border-b border-gray-light">
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace("/app/(tabs)/profile"))}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.palette.gery.darkGray}
            />
          </TouchableOpacity>
          <Text className="text-h2 font-semibold ml-4 text-text-primary">
            My Preferences
          </Text>
        </View>

        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Willingness to Relocate */}
          <View className="flex-row justify-between items-center mt-4 mb-2">
            <Text className="text-h4 font-medium text-text-primary">
              Willingness to Relocate
            </Text>
            <Switch
              value={willingnessToRelocate}
              onValueChange={setWillingnessToRelocate}
              trackColor={{ false: "#ccc", true: theme.palette.primary.main }}
              thumbColor="#fff"
            />
          </View>

          {willingnessToRelocate && (
            <View className="mt-2 gap-3">
              <SelectComponent
                value={relocationCountry}
                onChange={(val: any) => {
                  setRelocationCountry(val);
                  setRelocationStates([]);
                }}
                options={relocationCountryOptions.map((c) => ({ label: c, value: c }))}
                placeholder="Select Country"
              />
              <SelectComponent
                value={relocationStates[0] || ""}
                onChange={(val: any) => setRelocationStates([val])}
                options={availableStates.map((s) => ({ label: s, value: s }))}
                placeholder="Select Relocation State"
              />
            </View>
          )}

          {/* Willing to Travel */}
          <View className="flex-row justify-between items-center mt-4 mb-2">
            <Text className="text-h4 font-medium text-text-primary">
              Willing to Travel
            </Text>
            <Switch
              value={willingToTravel}
              onValueChange={setWillingToTravel}
              trackColor={{ false: "#ccc", true: theme.palette.primary.main }}
              thumbColor="#fff"
            />
          </View>

          {willingToTravel && (
            <View className="mt-2">
              {travelOptions.map((item) => {
                const selected = travelPreference.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() =>
                      toggleArrayValue(item, travelPreference, setTravelPreference)
                    }
                    className={`flex-row items-center px-4 py-3 mb-2 rounded-lg border ${
                      selected
                        ? "bg-primary-light1 border-primary-light1"
                        : "bg-white border-gray-light"
                    }`}
                  >
                    <View
                      className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                        selected
                          ? "bg-primary-main border-white"
                          : "bg-white border-gray-medium"
                      }`}
                    >
                      {selected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text
                      className={`text-small ${
                        selected ? "text-primary-main font-medium" : "text-text-primary"
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* International Relocation */}
          <View className="flex-row justify-between items-center mt-4 mb-2">
            <Text className="text-h4 font-medium text-text-primary">
              International Relocation
            </Text>
            <Switch
              value={internationalRelocation}
              onValueChange={setInternationalRelocation}
              trackColor={{ false: "#ccc", true: theme.palette.primary.main }}
              thumbColor="#fff"
            />
          </View>

          {internationalRelocation && (
            <SelectComponent
              value={preferredCountries[0] || ""}
              onChange={(val: any) => setPreferredCountries([val])}
              options={countryOptions.map((c) => ({ label: c, value: c }))}
              placeholder="Select Country"
            />
          )}

          {/* Primary Categories */}
          <Text className="text-h4 font-medium mt-4 mb-2 text-text-primary">
            Primary Categories
          </Text>

          {primaryCategoriesOptions.length > 0 && (
            <View className="mt-2">
              {primaryCategoriesOptions.map((item) => {
                const selected = primaryCategory.includes(item.value);
                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() =>
                      toggleArrayValue(
                        item.value,
                        primaryCategory,
                        setPrimaryCategory
                      )
                    }
                    className={`flex-row items-center px-4 py-3 mb-2 rounded-lg border ${
                      selected
                        ? "bg-primary-light1 border-primary-light1"
                        : "bg-white border-gray-light"
                    }`}
                  >
                    <View
                      className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                        selected
                          ? "bg-primary-main border-white"
                          : "bg-white border-gray-medium"
                      }`}
                    >
                      {selected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text
                      className={`text-small ${
                        selected ? "text-primary-main font-medium" : "text-text-primary"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Humanitarian Roles */}
          {primaryCategory.includes("Crisis / Humanitarian Nurse") && (
            <>
              <Text className="text-h4 font-medium mt-4 mb-2 text-text-primary">
                Humanitarian Roles
              </Text>
              <View className="mt-2">
                {humanitarianRolesOptions.map((item) => {
                  const selected = humanitarianRole.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() =>
                        toggleArrayValue(
                          item,
                          humanitarianRole,
                          setHumanitarianRole
                        )
                      }
                      className={`flex-row items-center px-4 py-3 mb-2 rounded-lg border ${
                        selected
                          ? "bg-primary-light1 border-primary-light1"
                          : "bg-white border-gray-light"
                      }`}
                    >
                      <View
                        className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                          selected
                            ? "bg-primary-main border-white"
                            : "bg-white border-gray-medium"
                        }`}
                      >
                        {selected && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                      <Text
                        className={`text-small ${
                          selected
                            ? "text-primary-main font-medium"
                            : "text-text-primary"
                        }`}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <View
          className="px-4 pt-2 mt-auto bg-gray-white border-t border-gray-light"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <ButtonComponent title="Save Preferences" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Preference;
