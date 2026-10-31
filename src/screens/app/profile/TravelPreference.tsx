import ButtonComponent from "@/src/components/ButtonComponent";
import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const TravelPreference = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  // State management
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [travelTime, setTravelTime] = useState(25);
  const [maxDistance, setMaxDistance] = useState(50);
  const [preferredStates, setPreferredStates] = useState("");
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>([]);
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  const workStyles = ["Relocation", "Travelling", "Stationary", "Hybrid"];
  const additionalInfo = [
    "I have a valid driver's license",
    "I have my own vehicle",
    "I have a valid passport",
    "I am open to international travel assignments",
  ];

  // Map additional info text to API keys
  const additionalInfoMap: Record<string, keyof AdditionalInformation> = {
    "I have a valid driver's license": "hasDriversLicense",
    "I have my own vehicle": "hasOwnVehicle",
    "I have a valid passport": "hasPassport",
    "I am open to international travel assignments": "openToInternationalAssignments",
  };

  interface AdditionalInformation {
    hasDriversLicense: boolean;
    hasOwnVehicle: boolean;
    hasPassport: boolean;
    openToInternationalAssignments: boolean;
  }

  interface TravelPreferencesData {
    willingToTravel: boolean;
    travelTime: number;
    travelDistance: number;
    preferredStatesOrRegions: string[];
    preferredWorkStyle: string[];
    additionalInformation: AdditionalInformation;
  }

  // Fetch existing preferences on mount
  useEffect(() => {
    fetchTravelPreferences();
  }, []);

  const fetchTravelPreferences = async () => {
    try {
      setLoading(true);
      const response = await appService.getTravelPreferences();

      if (response.data.success && response.data.data) {
        const data: TravelPreferencesData = response.data.data;

        // Populate form with existing data
        setWillingToTravel(data.willingToTravel || false);
        setTravelTime(data.travelTime || 25);
        setMaxDistance(data.travelDistance || 50);
        setPreferredStates(data.preferredStatesOrRegions?.join(", ") || "");
        setSelectedWorkStyles(data.preferredWorkStyle || []);

        // Map additional information back to selected items
        const additionalInfoItems: string[] = [];
        if (data.additionalInformation) {
          Object.entries(additionalInfoMap).forEach(([text, key]) => {
            if (data.additionalInformation[key]) {
              additionalInfoItems.push(text);
            }
          });
        }
        setSelectedAdditionalInfo(additionalInfoItems);

        setHasExistingData(true);
      }
    } catch (error) {
      console.log("Error fetching travel preferences:", error);
      // If no data exists (404), that's fine - user hasn't saved yet
      setHasExistingData(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkStyle = (style: string) => {
    setSelectedWorkStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const toggleAdditionalInfo = (info: string) => {
    setSelectedAdditionalInfo((prev) =>
      prev.includes(info)
        ? prev.filter((i) => i !== info)
        : [...prev, info]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Build additional information object
      const additionalInformation: AdditionalInformation = {
        hasDriversLicense: selectedAdditionalInfo.includes("I have a valid driver's license"),
        hasOwnVehicle: selectedAdditionalInfo.includes("I have my own vehicle"),
        hasPassport: selectedAdditionalInfo.includes("I have a valid passport"),
        openToInternationalAssignments: selectedAdditionalInfo.includes("I am open to international travel assignments"),
      };

      // Build payload
      const payload: TravelPreferencesData = {
        willingToTravel,
        travelTime,
        travelDistance: maxDistance,
        preferredStatesOrRegions: preferredStates
          ? preferredStates.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        preferredWorkStyle: selectedWorkStyles,
        additionalInformation,
      };

      // Use POST for new data, PATCH for updates
      const response = hasExistingData
        ? await appService.updateTravelPreferences(payload)
        : await appService.saveTravelPreferences(payload);

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message || "Travel preferences saved successfully",
        });
        setHasExistingData(true);
      }
    } catch (error: any) {
      console.log("Error saving travel preferences:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          typeof error === "string"
            ? error
            : error?.response?.data?.message ||
              error?.message ||
              "Failed to save travel preferences",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-extraLight items-center justify-center">
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text className="text-body1 text-text-secondary mt-4">
          Loading preferences...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-light">
          <TouchableOpacity onPress={() => router.push("/app/(tabs)/profile")}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.palette.gery.darkGray}
            />
          </TouchableOpacity>

          <Text className="text-h2 font-semibold text-text-primary ml-4">
            Travel Preference
          </Text>
        </View>

        <ScrollView
          className="px-4 py-5"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Willing to travel */}
        <TouchableOpacity
          onPress={() => setWillingToTravel(!willingToTravel)}
          className="flex-row items-center gap-3 mb-6"
        >
          <View
            className="h-5 w-5 border border-gray-medium rounded items-center justify-center"
            style={{
              backgroundColor: willingToTravel
                ? theme.palette.primary.main
                : "transparent",
              borderColor: willingToTravel
                ? theme.palette.primary.main
                : theme.palette.gery.mediumGray,
            }}
          >
            {willingToTravel && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
          <Text className="text-h4 text-text-primary">
            I am willing to travel for work
          </Text>
        </TouchableOpacity>

        {/* Travel Time - Only show if willing to travel */}
        {willingToTravel && (
          <View className="mb-6">
            <Text className="text-h5 font-medium text-text-primary mb-2">
              Travel Time: {travelTime}%
            </Text>
            <Slider
              value={travelTime}
              onValueChange={setTravelTime}
              minimumValue={0}
              maximumValue={100}
              step={5}
              minimumTrackTintColor={theme.palette.primary.main}
              maximumTrackTintColor={theme.palette.gery.lightGray}
              thumbTintColor={theme.palette.primary.main}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-caption text-text-secondary">0%</Text>
              <Text className="text-caption text-text-secondary">100%</Text>
            </View>
          </View>
        )}

        {/* Max Distance - Only show if willing to travel */}
        {willingToTravel && (
          <View className="mb-6">
            <Text className="text-h5 font-medium text-text-primary mb-2">
              Max Travel Distance: {maxDistance} miles
            </Text>
            <Slider
              value={maxDistance}
              onValueChange={setMaxDistance}
              minimumValue={10}
              maximumValue={100}
              step={5}
              minimumTrackTintColor={theme.palette.primary.main}
              maximumTrackTintColor={theme.palette.gery.lightGray}
              thumbTintColor={theme.palette.primary.main}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-caption text-text-secondary">10 mi</Text>
              <Text className="text-caption text-text-secondary">100 mi</Text>
            </View>
          </View>
        )}

        {/* Preferred States */}
        <View className="mb-6">
          <Text className="text-h5 font-medium text-text-primary mb-2">
            Preferred States / Regions
          </Text>
          <TextInput
            value={preferredStates}
            onChangeText={setPreferredStates}
            placeholder="Enter states separated by commas"
            placeholderTextColor="#6B7280"
            style={{ color: "#111827", fontSize: 14 }}
            selectionColor="#0141C5"
            className="border border-gray-medium rounded-lg px-3 py-3 text-body1 bg-gray-white"
          />
          <Text className="text-caption text-text-secondary mt-1">
            Enter states you prefer to work in, separated by commas
          </Text>
        </View>

        {/* Preferred Work Style */}
        <View className="mb-6">
          <Text className="text-h5 font-medium text-text-primary mb-3">
            Preferred Work Style
          </Text>

          <View className="flex-row flex-wrap gap-4">
            {workStyles.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => toggleWorkStyle(item)}
                className="flex-row items-center gap-2"
              >
                <View
                  className="h-5 w-5 border border-gray-medium rounded items-center justify-center"
                  style={{
                    backgroundColor: selectedWorkStyles.includes(item)
                      ? theme.palette.primary.main
                      : "transparent",
                    borderColor: selectedWorkStyles.includes(item)
                      ? theme.palette.primary.main
                      : theme.palette.gery.mediumGray,
                  }}
                >
                  {selectedWorkStyles.includes(item) && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text className="text-body1 text-text-primary">{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View className="mb-8">
          <Text className="text-h6 font-medium text-text-secondary mb-3">
            Additional Information
          </Text>

          {additionalInfo.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => toggleAdditionalInfo(item)}
              className="flex-row items-center gap-3 mb-3"
            >
              <View
                className="h-5 w-5 border border-gray-medium rounded items-center justify-center"
                style={{
                  backgroundColor: selectedAdditionalInfo.includes(item)
                    ? theme.palette.primary.main
                    : "transparent",
                  borderColor: selectedAdditionalInfo.includes(item)
                    ? theme.palette.primary.main
                    : theme.palette.gery.mediumGray,
                }}
              >
                {selectedAdditionalInfo.includes(item) && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-body1 text-text-primary">{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View
        className="px-4 pt-2 mt-auto bg-gray-white border-t border-gray-light"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <ButtonComponent
          title={saving ? "Saving..." : "Save Travel Preferences"}
          onPress={handleSave}
          className="mt-2"
          disabled={saving}
        />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default TravelPreference;
