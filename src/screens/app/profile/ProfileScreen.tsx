import { sessionCache } from '@/src/services/sessionCache';
import { appService } from "@/src/services/appApi/appService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cleanProfileImageUrl } from "@/src/utils/imageUtils";

const ProfileScreen = () => {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [userProfile, setUserProfile] = useState<any>(() => sessionCache.get('prof_userProfile') || authUser || null);
  const [preferencesData, setPreferencesData] = useState<any>(() => sessionCache.get('prof_preferencesData') || null);
  const [skillsData, setSkillsData] = useState<any>(() => sessionCache.get('prof_skillsData') || null);
  const [availabilityData, setAvailabilityData] = useState<any>(() => sessionCache.get('prof_availabilityData') || null);
  const [compensationData, setCompensationData] = useState<any>(() => sessionCache.get('prof_compensationData') || null);
  const [travelData, setTravelData] = useState<any>(() => sessionCache.get('prof_travelData') || null);
  const [imageError, setImageError] = useState(false);
  const [completionScore, setCompletionScore] = useState<any>(() => sessionCache.get('prof_completionScore') || null);
  const [licenseCount, setLicenseCount] = useState<number>(() => sessionCache.get('prof_licenseCount') ?? 0);
  const [resumeCount, setResumeCount] = useState<number>(() => sessionCache.get('prof_resumeCount') ?? 0);
  const [docCount, setDocCount] = useState<number>(() => sessionCache.get('prof_docCount') ?? 0);
  const [expCount, setExpCount] = useState<number>(() => sessionCache.get('prof_expCount') ?? 0);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    try {
      const [
        profileRes,
        scoreRes,
        licenseRes,
        resumeRes,
        docRes,
        expRes,
        prefRes,
        skillsRes,
        availRes,
        compRes,
        travelRes
      ] = await Promise.allSettled([
        appService.getUserProfile(),
        appService.getCompletionScore(),
        appService.getLicenses(),
        appService.getResumes(),
        appService.getDocuments(),
        appService.getExperiences(),
        appService.getPreferences(),
        appService.getSkills(),
        appService.getAvailability(),
        appService.getCompensation(),
        appService.getTravelPreferences(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.success) {
        setUserProfile(profileRes.value.data.data);
        setImageError(false);
      }

      if (scoreRes.status === "fulfilled" && scoreRes.value.data?.success) {
        setCompletionScore(scoreRes.value.data.data);
      }

      if (licenseRes.status === "fulfilled") {
        const d = licenseRes.value.data?.data || licenseRes.value.data || [];
        setLicenseCount(Array.isArray(d) ? d.length : 0);
      }

      if (resumeRes.status === "fulfilled") {
        const d = resumeRes.value.data?.data || resumeRes.value.data || [];
        setResumeCount(Array.isArray(d) ? d.length : 0);
      }

      if (docRes.status === "fulfilled") {
        const d = docRes.value.data?.data || docRes.value.data || [];
        setDocCount(Array.isArray(d) ? d.length : 0);
      }

      if (expRes.status === "fulfilled") {
        const d = expRes.value.data?.data || expRes.value.data || [];
        setExpCount(Array.isArray(d) ? d.length : 0);
      }

      if (prefRes.status === "fulfilled" && prefRes.value.data?.data) {
        setPreferencesData(prefRes.value.data.data);
      }

      if (skillsRes.status === "fulfilled" && skillsRes.value.data?.data) {
        setSkillsData(skillsRes.value.data.data);
      }

      if (availRes.status === "fulfilled" && availRes.value.data?.data) {
        setAvailabilityData(availRes.value.data.data);
      }

      if (compRes.status === "fulfilled" && compRes.value.data?.data) {
        setCompensationData(compRes.value.data.data);
      }

      if (travelRes.status === "fulfilled" && travelRes.value.data?.data) {
        setTravelData(travelRes.value.data.data);
      }
    } catch (error) {
      console.log("Error fetching profile details:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 1);
  };

  const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const isGeneralInfoComplete = Boolean(
    userProfile?.fullName && (userProfile?.city || userProfile?.phone)
  );
  const isPreferencesComplete = Boolean(
    (completionScore?.jobPreferences && completionScore.jobPreferences > 0) ||
    (preferencesData && (
      (preferencesData.primaryCategories && preferencesData.primaryCategories.length > 0) ||
      (preferencesData.relocationPreferences && preferencesData.relocationPreferences.length > 0) ||
      (preferencesData.travelPreferences && preferencesData.travelPreferences.length > 0) ||
      (preferencesData.internationalRelocationPreferences && preferencesData.internationalRelocationPreferences.length > 0)
    ))
  );
  const isSkillsComplete = Boolean(
    (completionScore?.skillsPercentage && completionScore.skillsPercentage > 0) ||
    (skillsData && (
      (skillsData.clinicalSkills && skillsData.clinicalSkills.length > 0) ||
      (skillsData.technicalSkills && skillsData.technicalSkills.length > 0) ||
      (skillsData.softSkills && skillsData.softSkills.length > 0) ||
      (Array.isArray(skillsData) && skillsData.length > 0)
    ))
  );
  const isAvailabilityComplete = Boolean(
    (completionScore?.availability && completionScore.availability > 0) ||
    (availabilityData && (
      (availabilityData.availableDays && availabilityData.availableDays.length > 0) ||
      availabilityData.hoursPerWeek ||
      availabilityData.availableFrom
    ))
  );
  const isCompensationComplete = Boolean(
    (completionScore?.compensation && completionScore.compensation > 0) ||
    (compensationData && (
      compensationData.salaryType ||
      compensationData.expectedSalaryMin ||
      compensationData.expectedHourlyRate ||
      compensationData.minimum ||
      compensationData.maximum
    ))
  );
  const isTravelComplete = Boolean(
    (completionScore?.travelPreferences && completionScore.travelPreferences > 0) ||
    (travelData && (
      travelData.willingToTravel !== undefined ||
      (travelData.preferredWorkStyle && travelData.preferredWorkStyle.length > 0) ||
      (travelData.preferredStatesOrRegions && travelData.preferredStatesOrRegions.length > 0)
    ))
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-white" edges={["top"]}>
      <View className="flex-1 w-full">
        <View className="relative top-0 left-0 right-0 z-10 w-full">
          <LinearGradient
            colors={["#0141C5", "#3ACBE8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            <View className="px-4 py-6 ">
              <View className="w-full flex-row justify-between items-center">
                <Text className="text-gray-white font-bold text-h1">
                  My Profile
                </Text>
                <TouchableOpacity
                  className="bg-white/20 p-3 rounded-xl"
                  onPress={() => router.push("/app/Settings")}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-4 mb-4">
                {(() => {
                  const avatarUrl = cleanProfileImageUrl(userProfile?.profileImage);
                  if (avatarUrl && !imageError) {
                    return (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-16 h-16 rounded-full border-2 border-gray-white"
                        onError={() => setImageError(true)}
                      />
                    );
                  }
                  return (
                    <View className="w-16 h-16 rounded-full bg-primary-light1 items-center justify-center border-2 border-gray-white">
                      <Text className="text-h3 font-bold text-primary-main">
                        {getInitials(userProfile?.fullName || "")}
                      </Text>
                    </View>
                  );
                })()}

                <View className="ml-4">
                  <Text className="text-gray-white font-semibold text-h3">
                    {capitalizeName(userProfile?.fullName) || "Guest User"}
                  </Text>
                  <Text className="text-primary-light2 text-body2 font-semibold">
                    {userProfile?.role || "User"}
                  </Text>
                  <Text className="text-primary-light3 text-caption font-medium">
                    {userProfile?.city
                      ? `${userProfile.city}, ${userProfile?.state || ""}`
                      : ""}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 mt-4 px-4 mb-5 w-full"
          contentContainerStyle={{
            paddingBottom: 100,
            flexGrow: 1,
          }}
        >
          <View className="flex-row flex-wrap justify-between w-full">
            <ProfileCard
              icon="person"
              title="General Info"
              status={isGeneralInfoComplete ? "✓ Completed" : "Incomplete"}
              statusColor={
                isGeneralInfoComplete
                  ? "text-action-green"
                  : "text-text-secondary"
              }
              bgColor="bg-primary-light1"
              iconColor="#0141C5"
              route={"/app/Profile/generalInfo"}
            />

            <ProfileCard
              icon="heart"
              title="Preferences"
              status={isPreferencesComplete ? "✓ Completed" : "Incomplete"}
              statusColor={
                isPreferencesComplete
                  ? "text-action-green"
                  : "text-text-secondary"
              }
              bgColor="bg-actionLight-purple1"
              iconColor="#E11D48"
              route={"/app/Profile/preference"}
            />

            <ProfileCard
              icon="briefcase"
              title="Experience"
              status={expCount > 0 ? `${expCount} Added` : "Incomplete"}
              statusColor={
                expCount > 0 ? "text-action-green" : "text-text-secondary"
              }
              bgColor="bg-actionLight-purple2"
              iconColor="#7C3AED"
              route={"/app/Profile/experience"}
            />

            <ProfileCard
              icon="star"
              title="Skills"
              status={isSkillsComplete ? "✓ Completed" : "Incomplete"}
              statusColor={
                isSkillsComplete ? "text-action-green" : "text-text-secondary"
              }
              bgColor="bg-primary-light1"
              iconColor="#2563EB"
              route={"/app/Profile/skills"}
            />

            <ProfileCard
              icon="shield-checkmark"
              title="Licenses"
              status={licenseCount > 0 ? `${licenseCount} Added` : "Incomplete"}
              statusColor={
                licenseCount > 0 ? "text-action-green" : "text-text-secondary"
              }
              bgColor="bg-actionLight-green"
              iconColor="#16A34A"
              route={"/app/Profile/licence"}
            />

            <ProfileCard
              icon="calendar"
              title="Availability"
              status={isAvailabilityComplete ? "✓ Completed" : "Incomplete"}
              statusColor={
                isAvailabilityComplete
                  ? "text-action-green"
                  : "text-text-secondary"
              }
              bgColor="bg-actionLight-red"
              iconColor="#EA580C"
              route={"/app/Profile/availability"}
            />

            <ProfileCard
              icon="cash"
              title="Compensation"
              status={isCompensationComplete ? "✓ Completed" : "Incomplete"}
              statusColor={
                isCompensationComplete
                  ? "text-action-green"
                  : "text-text-secondary"
              }
              bgColor="bg-actionLight-green"
              iconColor="#16A34A"
              route={"/app/Profile/compensation"}
            />

            <ProfileCard
              icon="document-text"
              title="Documents"
              status={docCount > 0 ? `${docCount} Added` : "Incomplete"}
              statusColor={
                docCount > 0 ? "text-action-green" : "text-text-secondary"
              }
              bgColor="bg-actionLight-red"
              iconColor="#DC2626"
              route={"/app/Profile/documents"}
            />

            <ProfileCard
              icon="document"
              title="Resume"
              status={resumeCount > 0 ? `${resumeCount} Uploaded` : "Incomplete"}
              statusColor={
                resumeCount > 0 ? "text-action-green" : "text-text-secondary"
              }
              bgColor="bg-secondary-light1"
              iconColor="#0284C7"
              route={"/app/Profile/resume"}
            />

            <ProfileCard
              icon="airplane"
              title="Travel"
              status={isTravelComplete ? "✓ Completed" : "Incomplete"}
              statusColor={
                isTravelComplete ? "text-action-green" : "text-text-secondary"
              }
              bgColor="bg-primary-light1"
              iconColor="#0284C7"
              route={"/app/Profile/travelPrefference"}
            />
          </View>

          {/* Quick Legal & Settings Links */}
          <View className="mt-4 pt-4 border-t border-gray-200/60 items-center">
            <View className="flex-row items-center gap-4 mb-2">
              <TouchableOpacity onPress={() => router.push("/app/Settings" as any)}>
                <Text className="text-xs font-semibold text-primary-main">Settings</Text>
              </TouchableOpacity>
              <Text className="text-gray-300">•</Text>
              <TouchableOpacity onPress={() => router.push("/app/Settings/privacyPolicy" as any)}>
                <Text className="text-xs font-semibold text-primary-main">Privacy Policy</Text>
              </TouchableOpacity>
              <Text className="text-gray-300">•</Text>
              <TouchableOpacity onPress={() => router.push("/app/Settings/termsOfService" as any)}>
                <Text className="text-xs font-semibold text-primary-main">Terms</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-[11px] text-gray-400 font-medium">
              Viscera Healthcare v1.0.0 (Build 1)
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

type ProfileCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
  statusColor: string;
  bgColor: string;
  iconColor: string;
  route: any;
};

const ProfileCard = ({
  icon,
  title,
  status,
  statusColor,
  bgColor,
  iconColor,
  route,
}: ProfileCardProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(route)}
      className="basis-[30%] bg-white rounded-xl py-4 items-center border border-gray-light/50 mb-4 shadow-sm"
    >
      <View
        className={`w-12 h-12 rounded-xl items-center justify-center mb-3 ${bgColor}`}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <Text className="text-text-primary font-semibold text-body1">
        {title}
      </Text>

      <Text className={`text-caption font-medium ${statusColor}`}>
        {status}
      </Text>
    </TouchableOpacity>
  );
};
