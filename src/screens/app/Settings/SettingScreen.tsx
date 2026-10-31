import { useAppDispatch } from "@/src/hooks/store";
import { appService } from "@/src/services/appApi/appService";
import { logoutUser } from "@/src/store/authSlice";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTimezone, setCurrentTimezone] = useState("PST");

  // Load timezone whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadTimezone = async () => {
        try {
          const stored = await AsyncStorage.getItem("user_timezone");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed?.code && isMounted) {
                setCurrentTimezone(parsed.code);
                return;
              }
            } catch {
              if (isMounted) {
                setCurrentTimezone(stored);
                return;
              }
            }
          }
          // Detect device timezone fallback
          const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
          if (deviceTz.includes("Calcutta") || deviceTz.includes("Kolkata")) {
            if (isMounted) setCurrentTimezone("IST");
          } else if (deviceTz.includes("New_York")) {
            if (isMounted) setCurrentTimezone("EST");
          } else if (deviceTz.includes("Chicago")) {
            if (isMounted) setCurrentTimezone("CST");
          } else if (deviceTz.includes("Denver")) {
            if (isMounted) setCurrentTimezone("MST");
          } else if (deviceTz.includes("Los_Angeles")) {
            if (isMounted) setCurrentTimezone("PST");
          } else {
            if (isMounted) setCurrentTimezone("PST");
          }
        } catch (e) {
          console.log("Error loading timezone in Settings:", e);
        }
      };
      loadTimezone();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const settingsData = useMemo(
    () => [
      {
        id: "1",
        title: "Notification Settings",
        icon: "notifications",
        bg: "bg-primary-light1",
        iconColor: "#0141C5",
        showArrow: true,
        route: "/app/Settings/notificationSettings",
      },
      {
        id: "2",
        title: "Privacy Settings",
        icon: "lock-closed",
        bg: "bg-actionLight-purple1",
        iconColor: "#780078",
        showArrow: true,
        route: "/app/Settings/privacy",
      },
      {
        id: "3",
        title: "Change Password",
        icon: "key",
        bg: "bg-secondary-light1",
        iconColor: "#3ACBE8",
        showArrow: true,
        route: "/app/Settings/changePassword",
      },
      {
        id: "4",
        title: "Time Zone",
        icon: "globe",
        bg: "bg-actionLight-green",
        iconColor: "#006900",
        value: currentTimezone,
        showArrow: true,
        route: "/app/Settings/timeZone",
      },
      {
        id: "5",
        title: "Privacy Policy",
        icon: "shield-checkmark-outline",
        bg: "bg-blue-50",
        iconColor: "#0141C5",
        showArrow: true,
        route: "/app/Settings/privacyPolicy",
      },
      {
        id: "6",
        title: "Terms of Service",
        icon: "document-text-outline",
        bg: "bg-blue-50",
        iconColor: "#0141C5",
        showArrow: true,
        route: "/app/Settings/termsOfService",
      },
      {
        id: "7",
        title: "Logout",
        icon: "log-out-outline",
        bg: "bg-actionLight-red",
        iconColor: "#963939",
        textColor: "text-action-red",
        arrowColor: "#963939",
        showArrow: true,
        action: "logout",
      },
      {
        id: "8",
        title: "Delete Account",
        icon: "trash-outline",
        bg: "bg-red-50",
        iconColor: "#DC2626",
        textColor: "text-red-600",
        arrowColor: "#DC2626",
        showArrow: true,
        action: "delete_account",
      },
    ],
    [currentTimezone]
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const message = await dispatch(logoutUser()).unwrap();
      setShowLogoutModal(false);
      toast.success(message || "Logged out successfully");
      router.replace("/auth/login/login");
    } catch (err: any) {
      toast.error(err || "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await appService.deleteAccount();
      await dispatch(logoutUser()).unwrap().catch(() => {});
      await AsyncStorage.clear();
      setShowDeleteModal(false);
      toast.success("Your account has been deleted.");
      router.replace("/auth/login/login");
    } catch (err: any) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.response?.data?.message || err?.message || "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-light bg-white">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => {
              router.push("/app/profile");
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#4D4D4D" />
          </TouchableOpacity>
          <Text className="text-h2 font-semibold text-text-primary">
            Settings
          </Text>
        </View>
      </View>

      <FlatList
        data={settingsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
        ListFooterComponent={
          <View className="items-center justify-center mt-8 pb-4">
            <Text className="text-xs text-gray-400 font-medium">
              Viscera Healthcare v1.0.0 (Build 1)
            </Text>
            <Text className="text-[11px] text-gray-400 mt-1">
              © {new Date().getFullYear()} Viscera Inc. All rights reserved.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.action === "logout") {
                setShowLogoutModal(true);
              } else if (item.action === "delete_account") {
                setShowDeleteModal(true);
              } else if (item.route) {
                router.push(item.route as any);
              }
            }}
            className="flex-row items-center justify-between py-4 border-b border-gray-light"
          >
            <View className="flex-row items-center gap-4">
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${item.bg}`}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.iconColor}
                />
              </View>
              <Text
                className={`text-body1 font-medium ${
                  item.textColor || "text-text-primary"
                }`}
              >
                {item.title}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              {item.value && (
                <Text className="text-body2 text-text-secondary font-medium">
                  {item.value}
                </Text>
              )}
              {item.showArrow && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={item.arrowColor || "#DBDBDB"}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Logout Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 items-center shadow-lg">
            <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-4">
              <Ionicons name="log-out-outline" size={26} color="#E53935" />
            </View>

            <Text className="text-h2 font-semibold text-text-primary mb-2">
              Logout
            </Text>

            <Text className="text-body2 text-text-secondary text-center mb-6">
              Are you sure you want to logout from your account?
            </Text>

            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 rounded-xl bg-gray-light items-center active:opacity-80"
              >
                <Text className="text-body1 font-medium text-text-primary">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                disabled={isLoggingOut}
                className={`flex-1 py-3 rounded-xl items-center active:opacity-80 ${
                  isLoggingOut ? "bg-primary-light" : "bg-primary-main"
                }`}
              >
                <Text className="text-body1 font-semibold text-white">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showDeleteModal}
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 items-center shadow-xl">
            <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-4">
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-2">
              Delete Account
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-6 leading-5">
              Are you sure you want to delete your account? All your applications, licenses, uploaded documents, chat history, and personal data will be permanently deleted. This action cannot be undone.
            </Text>

            <View className="flex-col gap-2.5 w-full">
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                className={`w-full py-3.5 rounded-xl items-center active:opacity-90 ${
                  isDeleting ? "bg-red-400" : "bg-red-600"
                }`}
              >
                <Text className="text-base font-bold text-white">
                  {isDeleting ? "Deleting Account..." : "Yes, Permanently Delete"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full py-3.5 rounded-xl bg-gray-100 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-gray-700">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingScreen;
