import ButtonComponent from "@/src/components/ButtonComponent";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export interface TimeZoneItem {
  code: string;
  label: string;
  offset: string;
  region: "United States" | "International";
  iana: string;
}

export const TIME_ZONE_OPTIONS: TimeZoneItem[] = [
  // United States & Canada
  {
    code: "EST",
    label: "Eastern Time (ET)",
    offset: "UTC-05:00",
    region: "United States",
    iana: "America/New_York",
  },
  {
    code: "CST",
    label: "Central Time (CT)",
    offset: "UTC-06:00",
    region: "United States",
    iana: "America/Chicago",
  },
  {
    code: "MST",
    label: "Mountain Time (MT)",
    offset: "UTC-07:00",
    region: "United States",
    iana: "America/Denver",
  },
  {
    code: "PST",
    label: "Pacific Time (PT)",
    offset: "UTC-08:00",
    region: "United States",
    iana: "America/Los_Angeles",
  },
  {
    code: "AKST",
    label: "Alaska Time (AKT)",
    offset: "UTC-09:00",
    region: "United States",
    iana: "America/Anchorage",
  },
  {
    code: "HST",
    label: "Hawaii Standard Time (HST)",
    offset: "UTC-10:00",
    region: "United States",
    iana: "Pacific/Honolulu",
  },
  // International
  {
    code: "IST",
    label: "India Standard Time (IST)",
    offset: "UTC+05:30",
    region: "International",
    iana: "Asia/Kolkata",
  },
  {
    code: "GMT",
    label: "Greenwich Mean Time (GMT / UTC)",
    offset: "UTC+00:00",
    region: "International",
    iana: "Europe/London",
  },
  {
    code: "CET",
    label: "Central European Time (CET)",
    offset: "UTC+01:00",
    region: "International",
    iana: "Europe/Berlin",
  },
  {
    code: "AEST",
    label: "Australian Eastern Time (AEST)",
    offset: "UTC+10:00",
    region: "International",
    iana: "Australia/Sydney",
  },
  {
    code: "SGT",
    label: "Singapore / Asia Time (SGT)",
    offset: "UTC+08:00",
    region: "International",
    iana: "Asia/Singapore",
  },
  {
    code: "JST",
    label: "Japan Standard Time (JST)",
    offset: "UTC+09:00",
    region: "International",
    iana: "Asia/Tokyo",
  },
];

const TimeZone = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCode, setSelectedCode] = useState<string>("PST");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSavedTimezone();
  }, []);

  const loadSavedTimezone = async () => {
    try {
      const stored = await AsyncStorage.getItem("user_timezone");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.code) {
            setSelectedCode(parsed.code);
            setLoading(false);
            return;
          }
        } catch {
          setSelectedCode(stored);
          setLoading(false);
          return;
        }
      }

      // Auto-detect system timezone
      const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const matched = TIME_ZONE_OPTIONS.find(
        (t) =>
          t.iana.toLowerCase() === deviceTz.toLowerCase() ||
          deviceTz.toLowerCase().includes(t.code.toLowerCase())
      );
      if (matched) {
        setSelectedCode(matched.code);
      } else {
        setSelectedCode("PST");
      }
    } catch (e) {
      console.log("Error loading timezone:", e);
      setSelectedCode("PST");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = () => {
    try {
      const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const matched = TIME_ZONE_OPTIONS.find(
        (t) =>
          t.iana.toLowerCase() === deviceTz.toLowerCase() ||
          (deviceTz.includes("Calcutta") || deviceTz.includes("Kolkata")
            ? t.code === "IST"
            : false) ||
          (deviceTz.includes("New_York") ? t.code === "EST" : false) ||
          (deviceTz.includes("Chicago") ? t.code === "CST" : false) ||
          (deviceTz.includes("Denver") ? t.code === "MST" : false) ||
          (deviceTz.includes("Los_Angeles") ? t.code === "PST" : false)
      );

      if (matched) {
        setSelectedCode(matched.code);
        toast.success(`Detected: ${matched.label}`);
      } else {
        toast.info(`Device timezone is ${deviceTz || "unknown"}`);
      }
    } catch {
      toast.error("Could not detect device timezone");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const chosen = TIME_ZONE_OPTIONS.find((t) => t.code === selectedCode);
      if (chosen) {
        await AsyncStorage.setItem("user_timezone", JSON.stringify(chosen));
        toast.success(`Time zone set to ${chosen.code} (${chosen.label})`);
      }
      router.back();
    } catch (err) {
      console.log("Error saving timezone:", err);
      toast.error("Failed to save time zone");
    } finally {
      setSaving(false);
    }
  };

  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return TIME_ZONE_OPTIONS;
    const q = searchQuery.toLowerCase().trim();
    return TIME_ZONE_OPTIONS.filter(
      (t) =>
        t.code.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.offset.toLowerCase().includes(q) ||
        t.iana.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-gray-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-light bg-white">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="p-1 rounded-full active:bg-gray-100"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-h2 font-semibold text-text-primary">
            Time Zone
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAutoDetect}
          className="flex-row items-center px-2.5 py-1.5 rounded-full bg-primary-light1 active:bg-primary-light2"
        >
          <Ionicons name="locate" size={14} color="#0141C5" />
          <Text className="text-xs font-semibold text-primary-main ml-1">
            Auto-Detect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description & Search */}
      <View className="px-4 pt-4 pb-2 bg-white">
        <Text className="text-body2 font-semibold text-text-primary">
          Your Preferred Time Zone
        </Text>
        <Text className="text-caption text-text-secondary mt-0.5 mb-3 leading-4">
          Used to coordinate job alerts, shift schedules, application updates, and interview invitations.
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-extraLight border border-gray-light rounded-xl px-3 py-2 mb-2">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search timezone, code, or city..."
            placeholderTextColor="#6B7280"
            selectionColor="#0141C5"
            style={{ color: "#111827", fontSize: 14 }}
            className="flex-1 ml-2 text-body1 text-text-primary"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Timezone List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0141C5" />
        </View>
      ) : (
        <FlatList
          data={filteredTimezones}
          keyExtractor={(item) => item.code}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="py-12 items-center justify-center">
              <Ionicons name="globe-outline" size={36} color="#9CA3AF" />
              <Text className="text-sm font-semibold text-gray-700 mt-2">
                No matching time zones
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Try searching by code (e.g., PST, EST, IST)
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCode;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCode(item.code)}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between p-3.5 mb-2.5 rounded-xl border ${
                  isSelected
                    ? "border-primary-main bg-primary-light1/30"
                    : "border-gray-light bg-white"
                }`}
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-gray-900">
                      {item.code}
                    </Text>
                    <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                      <Text className="text-[11px] font-semibold text-gray-600">
                        {item.offset}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 font-medium">
                      • {item.region}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600 font-medium mt-1">
                    {item.label}
                  </Text>
                </View>

                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                    isSelected
                      ? "border-primary-main bg-primary-main"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Bottom Save Button */}
      <View
        className="px-4 pt-3 bg-white border-t border-gray-light"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <ButtonComponent
          title={saving ? "Saving..." : "Save Time Zone"}
          onPress={handleSave}
          loading={saving}
        />
      </View>
    </SafeAreaView>
  );
};

export default TimeZone;
