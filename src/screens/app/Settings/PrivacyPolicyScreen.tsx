import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PrivacyPolicyScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEmailSupport = () => {
    Linking.openURL("mailto:privacy@visceraconnect.com").catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Top Header */}
      <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 mr-2"
        >
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">Privacy Policy</Text>
          <Text className="text-xs text-gray-400">Viscera Connect Platform</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Badge / Last Updated */}
        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <View className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
            <Ionicons name="shield-checkmark" size={14} color="#0141C5" />
            <Text className="text-xs font-semibold text-[#0141C5]">Verified Policy</Text>
          </View>
          <Text className="text-xs text-gray-500 font-medium">Last Updated: August 2026</Text>
        </View>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">1. Introduction</Text>
          <Text className="text-sm leading-6 text-gray-700">
            Welcome to Viscera Connect. We are committed to protecting your personal information and
            your right to privacy. This Privacy Policy governs the privacy policies and practices of
            our website, app.visceraconnect.com, and the Viscera Connect mobile platform.
          </Text>
        </View>

        {/* Section 2 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">2. Information We Collect</Text>
          <Text className="text-sm leading-6 text-gray-700 mb-3">
            We collect personal information that you voluntarily provide to us when registering on
            the platform. For Healthcare Professionals (Nurses), this includes:
          </Text>

          <View className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 gap-2.5 mb-3">
            <View className="flex-row items-start gap-2.5">
              <Ionicons name="person-circle-outline" size={18} color="#0141C5" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">Identity Data</Text>
                <Text className="text-xs leading-5 text-gray-600">
                  Full name, email address, mobile number, and One-Time Passwords (OTP) used for authentication.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-2.5">
              <Ionicons name="ribbon-outline" size={18} color="#0141C5" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">Credential Data</Text>
                <Text className="text-xs leading-5 text-gray-600">
                  Nursing licenses, board certifications, resumes, clinical skills, and educational documents.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-2.5">
              <Ionicons name="briefcase-outline" size={18} color="#0141C5" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">Employment Preferences</Text>
                <Text className="text-xs leading-5 text-gray-600">
                  Work status, hourly/annual compensation requirements, shift availability, and travel location preferences.
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-sm leading-6 text-gray-700">
            For Recruiters, we collect organizational details, contact information, and billing details
            (processed securely via third-party providers like Stripe).
          </Text>
        </View>

        {/* Section 3 */}
        <View className="mb-6 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="medical" size={18} color="#0141C5" />
            <Text className="text-base font-bold text-gray-900 flex-1">
              3. HIPAA Applicability & PHI
            </Text>
          </View>
          <Text className="text-sm leading-6 text-gray-700">
            Viscera Connect operates as a professional networking and credential management platform.
            The information you provide (such as nursing licenses or resumes) is considered employment
            and credential data, not Protected Health Information (PHI) under the Health Insurance
            Portability and Accountability Act (HIPAA), as you are acting in the capacity of a professional,
            not a patient. However, we employ industry-standard security measures to protect this sensitive data.
          </Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">4. How We Use Your Information</Text>
          <Text className="text-sm leading-6 text-gray-700 mb-2.5">
            We use the information we collect or receive to:
          </Text>
          <View className="gap-2 pl-1">
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                Facilitate account creation and secure authentication.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                Connect healthcare professionals with relevant job opportunities and recruiters.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                Verify licenses, certifications, and healthcare credentials.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                Send administrative notifications, application updates, and job alerts.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">5. Data Storage and Security</Text>
          <Text className="text-sm leading-6 text-gray-700">
            We implement appropriate technical and organizational security measures to protect your
            personal information, including encryption at rest (AES-256) and in transit (TLS 1.3).
            Your documents (resumes, licenses) are stored securely in protected cloud environments with
            strictly restricted access controls.
          </Text>
        </View>

        {/* Section 6 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">6. Data Retention and Your Rights</Text>
          <Text className="text-sm leading-6 text-gray-700">
            We will only keep your personal information for as long as it is necessary for the purposes
            set out in this privacy policy, unless a longer retention period is required or permitted by
            law. You have the right to request access to, correction of, or deletion of your personal data
            at any time through your account settings or by contacting our support team.
          </Text>
        </View>

        {/* Section 7 */}
        <View className="mb-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <Text className="text-base font-bold text-gray-900 mb-2">7. Contact Us</Text>
          <Text className="text-sm leading-6 text-gray-700 mb-3">
            If you have questions, comments, or requests regarding this Privacy Policy, please contact
            our dedicated privacy office:
          </Text>
          <TouchableOpacity
            onPress={handleEmailSupport}
            className="flex-row items-center gap-2 bg-white px-3.5 py-2.5 rounded-lg border border-gray-200 self-start"
          >
            <Ionicons name="mail-outline" size={16} color="#0141C5" />
            <Text className="text-sm font-semibold text-[#0141C5]">privacy@visceraconnect.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
