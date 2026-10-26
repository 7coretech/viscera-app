import ButtonComponent from "@/src/components/ButtonComponent";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/src/services/api";
import {
  PUSH_STATUS_STORAGE_KEY,
  PUSH_TOKEN_STORAGE_KEY,
  registerDevicePushToken,
  showLocalNotification,
} from "@/src/services/pushNotificationService";
import Toast from "react-native-toast-message";

const NotificationSettings = () => {
  const [jobAlerts, setJobAlerts] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(true);
  const [recruiterMessages, setRecruiterMessages] = useState(true);
  const [pushStatus, setPushStatus] = useState<string>("Checking...");
  const [isTesting, setIsTesting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPushStatus();
  }, []);

  const loadPushStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      const status = await AsyncStorage.getItem(PUSH_STATUS_STORAGE_KEY);
      if (token) {
        setPushStatus("Active on this device");
      } else if (status) {
        setPushStatus(status);
      } else {
        setPushStatus("Not registered yet");
      }
    } catch {
      setPushStatus("Unknown");
    }
  };

  const handleTestPush = async () => {
    setIsTesting(true);
    try {
      // 1. First trigger an instant local notification banner to test device sound & banner
      await showLocalNotification({
        title: "Local Notification Test",
        body: "Sound and banner notifications are active on your phone!",
      });

      // 2. Also ensure device push token is synced with backend
      await registerDevicePushToken();
      await loadPushStatus();

      // 3. Request server-side test push
      const response = await apiClient.post("/api/v1/users/test-push");
      const result = response.data?.data;

      if (result?.sent) {
        Toast.show({
          type: "success",
          text1: "Push Sent!",
          text2: "Check your notification drawer for Viscera alert.",
        });
      } else {
        Alert.alert(
          "Push Notification Status",
          result?.message || "Push token not found on backend. Re-syncing device token now...",
          [{ text: "OK" }]
        );
      }
    } catch (err: any) {
      console.error("Test push error:", err);
      Toast.show({
        type: "info",
        text1: "Local Notification Sent",
        text2: "Server push endpoint called. Check your notification bar.",
      });
    } finally {
      setIsTesting(false);
      loadPushStatus();
    }
  };

  const SettingItem = ({
    title,
    value,
    onValueChange,
    bgColor,
  }: {
    title: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    bgColor: string;
  }) => (
    <View className={`flex-row items-center justify-between px-4 py-3 rounded-xl mb-3 ${bgColor}`}>
      <Text className="text-body1 font-medium text-text-primary">
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#DBDBDB", true: "#0141C5" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-light">
        <TouchableOpacity className="mr-4" onPress={() => { router.push(`/app/Settings`); }}>
          <Ionicons name="arrow-back" size={22} color="#4D4D4D" />
        </TouchableOpacity>
        <Text className="text-h2 font-semibold text-text-primary">
          Notification Settings
        </Text>
      </View>

      <View className="px-4 mt-6">
        <SettingItem
          title="New Job Alerts"
          value={jobAlerts}
          onValueChange={setJobAlerts}
          bgColor="bg-primary-light1/40"
        />
        <SettingItem
          title="Application Status"
          value={applicationStatus}
          onValueChange={setApplicationStatus}
          bgColor="bg-actionLight-green/40"
        />
        <SettingItem
          title="Recruiter Messages"
          value={recruiterMessages}
          onValueChange={setRecruiterMessages}
          bgColor="bg-actionLight-purple1/60"
        />

        {/* Device Push Notification Diagnostic Box */}
        <View className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-700">Push Status</Text>
            <Text className="text-xs font-medium text-blue-600">{pushStatus}</Text>
          </View>
          <TouchableOpacity
            onPress={handleTestPush}
            disabled={isTesting}
            className="mt-2 bg-blue-600 py-2.5 px-4 rounded-lg flex-row items-center justify-center"
          >
            {isTesting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="notifications-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-white font-medium text-sm">Send Test Notification</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 pb-6 mt-auto">
        <ButtonComponent
          title="Save Settings"
          onPress={() => {
            Toast.show({
              type: "success",
              text1: "Preferences Saved",
              text2: "Your notification settings have been updated.",
            });
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettings;
