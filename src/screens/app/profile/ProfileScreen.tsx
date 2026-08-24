import { appService } from "@/src/services/appApi/appService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [completionScore, setCompletionScore] = useState<any>(null);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [resumeCount, setResumeCount] = useState<number>(0);
  const [docCount, setDocCount] = useState<number>(0);
  const [expCount, setExpCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    try {
      const [profileRes, scoreRes, licenseRes, resumeRes, docRes, expRes] =
        await Promise.allSettled([
          appService.getUserProfile(),
          appService.getCompletionScore(),
          appService.getLicenses(),
          appService.getResumes(),
          appService.getDocuments(),
          appService.getExperiences(),
        ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.success) {
        setUserProfile(profileRes.value.data.data);
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
    completionScore?.jobPreferences && completionScore.jobPreferences > 0
  );
  const isSkillsComplete = Boolean(
    completionScore?.skills && completionScore.skills > 0
  );
  const isAvailabilityComplete = Boolean(
    completionScore?.availability && completionScore.availability > 0
  );
  const isCompensationComplete = Boolean(
    completionScore?.compensation && completionScore.compensation > 0
  );
  const isTravelComplete = Boolean(
    completionScore?.travelPreferences && completionScore.travelPreferences > 0
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
                {userProfile?.profileImage?.url ? (
                  <Image
                    source={{ uri: userProfile.profileImage.url }}
                    className="w-16 h-16 rounded-full border-2 border-gray-white"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-primary-light1 items-center justify-center border-2 border-gray-white">
                    <Text className="text-h3 font-bold text-primary-main">
                      {getInitials(userProfile?.fullName || "")}
                    </Text>
                  </View>
                )}

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
