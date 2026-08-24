import { appService } from "@/src/services/appApi/appService";
import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { MyApplications } from "./MyApplications";

const StatCard = ({
  icon,
  title,
  value,
  bgColor,
  iconColor,
  onPress

}: {
  icon: any;
  title: string;
  value: string;
  bgColor: string;
  iconColor: string;
  onPress?: () => void;

}) => {
  return (
    <TouchableOpacity onPress={onPress} className="basis-[30%] bg-white rounded-xl py-4 items-center border border-gray-light/50 mb-4 shadow-sm">
      <View
        className={`w-12 h-12 rounded-xl items-center justify-center mb-3 ${bgColor}`}
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <Text className="text-text-primary font-semibold text-body1">
        {title}
      </Text>
      <Text className="text-gray-500 text-caption ">{value}</Text>
    </TouchableOpacity>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View className="flex-row items-center mb-2">
    <View className="w-3 h-3 rounded-[3px] mr-2" style={{ backgroundColor: color }} />
    <Text className="text-text-primary font-medium text-caption">{label}</Text>
  </View>
);

const DashboardScreen = () => {
  const router = useRouter();
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("Good Morning");
  const [completionScore, setCompletionScore] = useState<any>(null);
  const [totalCompletion, setTotalCompletion] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        fetchUserProfile();
        fetchCompletionScore();
        fetchJobCounts();
        fetchNotificationCounts();
      }
      updateGreeting();
    }, [accessToken])
  );

  const fetchNotificationCounts = async () => {
    try {
      const res = await appService.getUnreadNotificationCount();
      const base = res?.data || res;
      const d = base?.data || base || {};
      const count = Number(d?.unreadCount ?? d?.count ?? 0);
      setUnreadNotifications(count);
    } catch {
      try {
        const notifRes = await appService.getNotifications();
        const raw = notifRes?.data?.data || notifRes?.data || [];
        const arr = Array.isArray(raw?.notifications)
          ? raw.notifications
          : Array.isArray(raw)
          ? raw
          : [];
        setUnreadNotifications(
          arr.filter((n: any) => !n.isRead && !n.read && n.status !== "READ").length
        );
      } catch {}
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await appService.getUserProfile();
      if (response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching profile on dashboard:", error);
    }
  };

  const fetchCompletionScore = async () => {
    try {
      const response = await appService.getCompletionScore();
      if (response.data.success) {
        const data = response.data.data;
        setCompletionScore(data);
        const total = Object.values(data).reduce((acc: number, val: any) => acc + (typeof val === 'number' ? val : 0), 0);
        setTotalCompletion(total);
      }
    } catch (error) {
      console.log("Error fetching completion score:", error);
    }
  };

  const fetchJobCounts = async () => {
    try {
      const [savedRes, appliedRes] = await Promise.all([
        appService.getApplicantJobs('save'),
        appService.getApplicantJobs('apply')
      ]);

      if (savedRes.data && Array.isArray(savedRes.data.data)) {
        setSavedCount(savedRes.data.data.length);
      }
      if (appliedRes.data && Array.isArray(appliedRes.data.data)) {
        setAppliedCount(appliedRes.data.data.length);
      }
    } catch (error) {
      console.log("Error fetching job counts:", error);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white" edges={["top"]}>
      <View className="flex-1">
        <View className="relative top-0 left-0 right-0 z-10 ">
          <LinearGradient
            colors={["#0141C5", "#3ACBE8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
          >
            <View className="px-4 py-6 ">
              <View className="flex-row justify-between items-start mb-5   w-full ">
                <View className="gap-0.5">
                  <Text className="text-white/90 text-h5 font-normal">
                    {greeting},
                  </Text>
                  <Text className="text-white text-[24px] font-bold ">
                    {capitalizeName(userProfile?.fullName) || "Guest User"}
                  </Text>
                </View>
                <TouchableOpacity className="bg-white/20 p-3 rounded-xl relative" onPress={() => {
                  router.push('/app/Notifications')
                }}>
                  <Ionicons name="notifications" size={20} color="white" />
                  {unreadNotifications > 0 && (
                    <View className="absolute top-0 right-0 bg-[#E74C3C] min-w-[20px] h-5 px-1 rounded-full items-center justify-center border-2 border-white">
                      <Text className="text-[10px] text-gray-white font-bold">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
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
          {/* Profile Completeness Card */}
          <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-light/30">
            <Text className="text-text-primary text-h4 font-bold mb-4">
              Profile Completeness
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="items-center">
                <PieChart
                  donut
                  radius={60}
                  innerRadius={30}
                  showText
                  textColor="white"
                  textSize={10}
                  fontWeight="bold"
                  data={[
                    { value: completionScore?.genralInfoPercentage || 0, color: '#3A86FF', text: `${completionScore?.genralInfoPercentage || 0}%` },
                    { value: completionScore?.experiencePercentage || 0, color: '#4CAF50', text: `${completionScore?.experiencePercentage || 0}%` },
                    { value: completionScore?.skillsPercentage || 0, color: '#FF9800', text: `${completionScore?.skillsPercentage || 0}%` },
                    { value: completionScore?.licensePercentage || 0, color: '#9C27B0', text: `${completionScore?.licensePercentage || 0}%` },
                    { value: completionScore?.documentPercentage || 0, color: '#3F51B5', text: `${completionScore?.documentPercentage || 0}%` },
                    { value: completionScore?.resumePercentage || 0, color: '#F44336', text: `${completionScore?.resumePercentage || 0}%` },
                    { value: Math.max(0, 100 - totalCompletion), color: '#F2F2F2' }
                  ]}
                />
              </View>

              <View className="flex-1 ml-6">
                <LegendItem color="#3A86FF" label="General Info" />
                <LegendItem color="#4CAF50" label="Experience" />
                <LegendItem color="#FF9800" label="Skills" />
                <LegendItem color="#9C27B0" label="Licenses" />
                <LegendItem color="#3F51B5" label="Documents" />
                <LegendItem color="#F44336" label="Resume" />
              </View>
            </View>

            <View className="mt-4 items-center">
              <Text className="text-text-primary font-bold text-h4">
                {totalCompletion}% Complete
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/app/(tabs)/profile')}
              className="mt-4 border border-primary-main py-3 rounded-xl items-center"
            >
              <Text className="text-primary-main font-bold text-body1">
                Update Profile
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between  w-full">
            <StatCard
              icon="bookmark"
              title="Saved"
              value={`${savedCount} jobs`}
              bgColor="#EAF2FF"
              iconColor="#2563EB"
              onPress={() => router.push({
                pathname: "/app/(tabs)/jobs",
                params: { tab: 'saved' }
              })}
            />

            <StatCard
              icon="document-text"
              title="Applied"
              value={`${appliedCount} jobs`}
              bgColor="#F3ECFF"
              iconColor="#7C3AED"
              onPress={() => router.push({
                pathname: "/app/(tabs)/jobs",
                params: { tab: 'applied' }
              })}
            />

            <StatCard
              icon="chatbox"
              title="Messages"
              value="3 new"
              bgColor="#FFF7ED"
              iconColor="#F97316"
              onPress={() => router.push("/app/(tabs)/chat")}
            />
          </View>
          <View >



            <MyApplications />
          </View>
          {/* <View>
            <RecommendedJobs />
          </View> */}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;
