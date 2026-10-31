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

const TermsOfServiceScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEmailSupport = () => {
    Linking.openURL("mailto:legal@visceraconnect.com").catch(() => {});
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
          <Text className="text-lg font-bold text-gray-900">Terms of Service</Text>
          <Text className="text-xs text-gray-400">User Agreement & Compliance</Text>
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
            <Ionicons name="document-text" size={14} color="#0141C5" />
            <Text className="text-xs font-semibold text-[#0141C5]">Legally Binding</Text>
          </View>
          <Text className="text-xs text-gray-500 font-medium">Last Updated: August 2026</Text>
        </View>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">1. Agreement to Terms</Text>
          <Text className="text-sm leading-6 text-gray-700">
            These Terms of Service constitute a legally binding agreement made between you, whether
            personally or on behalf of an entity (&quot;you&quot;) and Viscera Connect (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;),
            concerning your access to and use of the app.visceraconnect.com website and our related
            mobile applications (collectively, the &quot;Site&quot;). By registering for an account, you agree
            that you have read, understood, and agree to be bound by all of these Terms of Service.
          </Text>
        </View>

        {/* Section 2 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">2. User Representations</Text>
          <Text className="text-sm leading-6 text-gray-700 mb-2.5">
            By using the Site, you represent and warrant that:
          </Text>
          <View className="gap-2 pl-1">
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#0141C5" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                All registration information you submit will be true, accurate, current, and complete.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#0141C5" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                You will maintain the accuracy of such information and promptly update such registration information as necessary.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#0141C5" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                You have the legal capacity and you agree to comply with these Terms of Service.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={16} color="#0141C5" style={{ marginTop: 3 }} />
              <Text className="text-sm leading-5 text-gray-700 flex-1">
                You are a licensed healthcare professional (if registering as a Nurse) or an authorized representative of a hiring organization (if registering as a Recruiter).
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6 bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="alert-circle" size={18} color="#D97706" />
            <Text className="text-base font-bold text-gray-900 flex-1">
              3. Platform Purpose & Disclaimer
            </Text>
          </View>
          <Text className="text-sm leading-6 text-gray-800">
            Viscera Connect serves as a digital venue connecting healthcare professionals with healthcare recruiters.
            We do not guarantee employment, nor do we guarantee the validity, accuracy, or legitimacy of the job
            postings on the Site. While we strive to maintain a high-quality platform, recruiters are solely
            responsible for conducting their own background checks, license verifications, and due diligence
            prior to hiring any candidate.
          </Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">4. Prohibited Activities</Text>
          <Text className="text-sm leading-6 text-gray-700 mb-2.5">
            You may not access or use the Site for any purpose other than that for which we make the
            Site available. Prohibited activities include, but are not limited to:
          </Text>
          <View className="bg-red-50/50 rounded-xl p-3.5 border border-red-100 gap-2.5">
            <View className="flex-row items-start gap-2">
              <Ionicons name="close-circle" size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <Text className="text-xs leading-5 text-gray-700 flex-1">
                Uploading falsified or fraudulently obtained licenses, certifications, or resumes.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="close-circle" size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <Text className="text-xs leading-5 text-gray-700 flex-1">
                Attempting to bypass any security measures of the Site designed to prevent or restrict access.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="close-circle" size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <Text className="text-xs leading-5 text-gray-700 flex-1">
                Using the Site to harvest contact information for spam or unsolicited commercial outreach.
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="close-circle" size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <Text className="text-xs leading-5 text-gray-700 flex-1">
                Harassing, intimidating, or threatening any of our employees, users, or platform partners.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">
            5. Subscription & Payments (For Recruiters)
          </Text>
          <Text className="text-sm leading-6 text-gray-700">
            Recruiters may be subject to subscription fees to access certain premium features (e.g., job postings,
            candidate direct messaging). All billing is handled securely via Stripe. By providing payment information,
            you authorize us to charge the applicable fees to your designated payment method. Subscriptions auto-renew
            unless cancelled prior to the renewal date. We reserve the right to change our prices at any time upon notice.
          </Text>
        </View>

        {/* Section 6 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">6. Modifications and Interruptions</Text>
          <Text className="text-sm leading-6 text-gray-700">
            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason
            at our sole discretion without notice. We will not be liable to you or any third party for any modification,
            price change, suspension, or discontinuance of the Site.
          </Text>
        </View>

        {/* Section 7 */}
        <View className="mb-6">
          <Text className="text-base font-bold text-gray-900 mb-2">7. Termination</Text>
          <Text className="text-sm leading-6 text-gray-700">
            We may terminate or suspend your account and bar access to the Site immediately, without prior notice
            or liability, under our sole discretion, for any reason whatsoever, including without limitation if you
            breach the Terms of Service. Upon termination, your right to use the Site will immediately cease.
          </Text>
        </View>

        {/* Contact */}
        <View className="mb-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <Text className="text-base font-bold text-gray-900 mb-2">Legal Questions?</Text>
          <Text className="text-sm leading-6 text-gray-700 mb-3">
            If you have questions regarding these terms, contact our legal department:
          </Text>
          <TouchableOpacity
            onPress={handleEmailSupport}
            className="flex-row items-center gap-2 bg-white px-3.5 py-2.5 rounded-lg border border-gray-200 self-start"
          >
            <Ionicons name="mail-outline" size={16} color="#0141C5" />
            <Text className="text-sm font-semibold text-[#0141C5]">legal@visceraconnect.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServiceScreen;
