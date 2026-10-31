import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import { appService } from "@/src/services/appApi/appService";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const ChangePassword = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Error states
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Dynamic requirement checks
  const requirements = useMemo(() => {
    return {
      hasLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
  }, [newPassword]);

  const allRequirementsMet =
    requirements.hasLength &&
    requirements.hasUpper &&
    requirements.hasNumber &&
    requirements.hasSpecial;

  const RequirementItem = ({
    text,
    met,
  }: {
    text: string;
    met: boolean;
  }) => (
    <View className="flex-row items-center mb-2">
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={17}
        color={met ? "#10B981" : "#9CA3AF"}
      />
      <Text
        className={`ml-2 text-caption ${
          met ? "text-emerald-700 font-semibold" : "text-gray-500"
        }`}
      >
        {text}
      </Text>
    </View>
  );

  const handleUpdatePassword = async () => {
    // Reset errors
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (!currentPassword.trim()) {
      setCurrentPasswordError("Current password is required");
      hasError = true;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      hasError = true;
    } else if (!allRequirementsMet) {
      setNewPasswordError("Please meet all password requirements listed below");
      hasError = true;
    } else if (newPassword === currentPassword) {
      setNewPasswordError("New password must be different from current password");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);
      const res = await appService.updatePassword({
        oldPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      const message =
        res?.data?.message || "Password updated successfully!";
      toast.success(message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.back();
    } catch (err: any) {
      console.log("Error updating password:", err);
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.response?.data?.message ||
            err?.message ||
            "Failed to update password. Please verify your current password.";

      if (
        errorMessage.toLowerCase().includes("old password") ||
        errorMessage.toLowerCase().includes("current password")
      ) {
        setCurrentPasswordError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-light bg-white">
          <TouchableOpacity
            className="mr-3 p-1 rounded-full active:bg-gray-100"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>

          <Text className="text-h2 font-semibold text-text-primary">
            Change Password
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="gap-4">
            <View>
              <FormLabel>Current Password</FormLabel>
              <InputComponent
                value={currentPassword}
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  if (currentPasswordError) setCurrentPasswordError("");
                }}
                placeholder="Enter current password"
                type="password"
                showPasswordToggle
                error={Boolean(currentPasswordError)}
                helperText={currentPasswordError}
                editable={!loading}
              />
            </View>

            <View>
              <FormLabel>New Password</FormLabel>
              <InputComponent
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  if (newPasswordError) setNewPasswordError("");
                }}
                placeholder="Enter new password"
                type="password"
                showPasswordToggle
                error={Boolean(newPasswordError)}
                helperText={newPasswordError}
                editable={!loading}
              />
            </View>

            <View>
              <FormLabel>Confirm New Password</FormLabel>
              <InputComponent
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                placeholder="Confirm new password"
                type="password"
                showPasswordToggle
                error={Boolean(confirmPasswordError)}
                helperText={confirmPasswordError}
                editable={!loading}
              />
            </View>

            {/* Dynamic Password Requirements Card */}
            <View className="bg-primary-light1/40 border border-primary-light2 p-4 rounded-2xl mt-3 shadow-xs">
              <Text className="text-body2 font-bold text-text-primary mb-3">
                Password Requirements:
              </Text>
              <RequirementItem
                text="At least 8 characters"
                met={requirements.hasLength}
              />
              <RequirementItem
                text="One uppercase letter (A-Z)"
                met={requirements.hasUpper}
              />
              <RequirementItem
                text="One number (0-9)"
                met={requirements.hasNumber}
              />
              <RequirementItem
                text="One special character (@$!%*?&...)"
                met={requirements.hasSpecial}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View
          className="px-4 pt-3 bg-white border-t border-gray-light"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <ButtonComponent
            title={loading ? "Updating..." : "Update Password"}
            onPress={handleUpdatePassword}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePassword;
