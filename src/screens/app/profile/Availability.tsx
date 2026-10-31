import ButtonComponent from "@/src/components/ButtonComponent";
import DatePickerComponent from "@/src/components/DatePickerComponent";
import FormLabel from "@/src/components/FormLabel";
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
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const daysAbbr = ["M", "T", "W", "T", "F", "S", "S"];

const Availability = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [overtime, setOvertime] = useState(false);
  const [weekends, setWeekends] = useState(false);
  const [nightShifts, setNightShifts] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hour, setHour] = useState("");
  const [hasAvailability, setHasAvailability] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await appService.getAvailability();
      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // Map availableFrom string to Date
        if (data.availableFrom) {
          setDate(new Date(data.availableFrom));
        }

        setHour(data.hoursPerWeek || "");

        // Map availableDays strings to indices
        if (data.availableDays) {
          const indices = data.availableDays
            .map((day: string) => days.indexOf(day))
            .filter((index: number) => index !== -1);
          setSelectedDays(indices);
        }

        setOvertime(data.willingOvertime || false);
        setWeekends(data.willingWeekends || false);
        setNightShifts(data.willingNightShifts || false);
        setOnCall(data.willingOnCall || false);

        setHasAvailability(true);
      }
    } catch (error) {
      console.log('Error fetching availability:', error);
    }
  };

  const handleSave = async () => {
    const payload = {
      availableFrom: date ? date.toISOString().split('T')[0] : "",
      hoursPerWeek: hour,
      availableDays: selectedDays.map(index => days[index]),
      additionalAvailability: true, // Always true as per requirements/UI structure generally implies this
      willingOvertime: overtime,
      willingWeekends: weekends,
      willingNightShifts: nightShifts,
      willingOnCall: onCall,
    };

    try {
      let response;
      if (hasAvailability) {
        response = await appService.updateAvailability(payload);
      } else {
        response = await appService.saveAvailability(payload);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Availability saved successfully.");
        setHasAvailability(true);
      }
    } catch (error: any) {
      console.log("Error saving availability:", error);
      toast.error(
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            error.message ||
            "Failed to save availability."
      );
    }
  };

  const toggleDay = (index: number) => {
    setSelectedDays(prev =>
      prev.includes(index)
        ? prev.filter(d => d !== index)
        : [...prev, index]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-light">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.palette.gery.darkGray}
            />
          </TouchableOpacity>

          <Text className="text-h2 font-semibold text-text-primary ml-4">
            Availability
          </Text>
        </View>
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className="mt-6">
          <FormLabel>
            Available From
          </FormLabel>

          <DatePickerComponent
            value={date}
            onChange={setDate}
            placeholder="Select your DOB"
          />
        </View>

        <View className="mt-5">
          <FormLabel>
            Hours Per Week
          </FormLabel>

          <SelectComponent
            value={hour}
            onChange={setHour}
            placeholder="Select Hour"
            options={[
              { label: "Part-Time(40+hrs)", value: "parttime(40+)" },
              { label: "Part-Time(30-39hrs)", value: "parttime(30-39hrs" },
              { label: "Part-Time(20-30hrs)", value: "parttime(20-30hrs" },
              { label: "Less than 20 hrs", value: "lessthan 20 hrs" },
            ]}
          />
        </View>

        <View className="mt-6">
          <FormLabel>
            Available Days
          </FormLabel>
          <View className="flex-row gap-2">
            {daysAbbr.map((day, index) => {
              const active = selectedDays.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleDay(index)}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${active
                      ? "bg-primary-main"
                      : "border border-gray-light"
                    }`}
                >
                  <Text
                    className={`font-semibold ${active ? "text-white" : "text-text-secondary"
                      }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-6 bg-secondary-light1 rounded-2xl p-4 border border-secondary-light2">
          <FormLabel>
            Additional Availability
          </FormLabel>

          {[
            { label: "Willing to work overtime", value: overtime, set: setOvertime },
            { label: "Willing to work weekends", value: weekends, set: setWeekends },
            { label: "Willing to work night shifts", value: nightShifts, set: setNightShifts },
            { label: "Willing to be on call", value: onCall, set: setOnCall },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => item.set(!item.value)}
              className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-3 border border-gray-light"
            >
              <View
                className={`w-5 h-5 rounded border mr-3 items-center justify-center ${item.value
                    ? "bg-primary-main border-primary-main"
                    : "border-gray-medium"
                  }`}
              >
                {item.value && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>

              <Text className="text-body1 text-text-primary">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View
        className="px-4 pt-2 bg-gray-white border-t border-gray-light"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <ButtonComponent
          title="Save Availability"
          onPress={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default Availability;
