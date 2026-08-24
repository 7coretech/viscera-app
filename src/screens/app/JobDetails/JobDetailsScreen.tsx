import ButtonComponent from "@/src/components/ButtonComponent";
import ApplyJobModal from "@/src/components/ApplyJobModal";
import { appService } from "@/src/services/appApi/appService";
import chatService from "@/src/services/chatService";
import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const JobDetailsScreen = () => {
  const route = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      checkIfSaved();
      checkIfApplied();
    }
  }, [jobId, accessToken]);

  const checkIfApplied = async () => {
    if (!accessToken) return;
    try {
      const appliedRes = await appService.getApplicantJobs('apply');
      if (appliedRes.data && Array.isArray(appliedRes.data.data)) {
        const appliedItems = appliedRes.data.data;
        const match = appliedItems.find((item: any) => item.id === jobId || item.jobId === jobId) as any;
        if (match) {
          setIsApplied(true);
          setApplicationId(match.applicationId || match.id || null);
        }
      }
    } catch (error) {
      console.log("Error checking applied status:", error);
    }
  };

  const checkIfSaved = async () => {
    if (!accessToken) return;
    try {
      const savedRes = await appService.getApplicantJobs('save');
      if (savedRes.data && Array.isArray(savedRes.data.data)) {
        const savedItems = savedRes.data.data;
        const match = savedItems.find((item: any) => item.id === jobId || item.jobId === jobId);
        if (match) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.log("Error checking saved status:", error);
    }
  };

  const handleSaveJob = async () => {
    if (!accessToken) {
      Alert.alert("Login Required", "Please login to save this job.");
      return;
    }
    try {
      if (isSaved) {
        // Toggle saved locally or call unsave
        setIsSaved(false);
      } else {
        await appService.saveJob({ jobId });
        setIsSaved(true);
        Alert.alert("Success", "Job saved successfully.");
      }
    } catch (error) {
      console.log("Error saving job:", error);
      Alert.alert("Error", "Could not save the job. Please try again.");
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await appService.getJobDetails(jobId);
      if (res.data && res.data.data) {
        setJob(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!accessToken) {
      Alert.alert("Login Required", "Please login to apply for this job.");
      return;
    }
    setApplyModalVisible(true);
  };

  const handleApplySuccess = (applicationData?: any) => {
    setIsApplied(true);
    if (applicationData?.applicationId || applicationData?.id) {
      setApplicationId(applicationData.applicationId || applicationData.id);
    }
  };

  const handleStartChat = async () => {
    if (!accessToken) {
      Alert.alert("Login Required", "Please login to message the recruiter.");
      return;
    }

    try {
      setChatLoading(true);
      // Try starting chat with applicationId if we have it, else fallback to jobId
      const idToUse = applicationId || jobId;
      const response = await chatService.startChat(idToUse);
      // Assuming response format: { success: true, data: { conversationId: "..." } }
      if (response.success && response.data.conversationId) {
        route.push({
          pathname: "/app/ChatRoom",
          params: {
            conversationId: response.data.conversationId,
            name: job.companyName || "Recruiter",
            avatar: job.companyLogo || "",
          }
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Could not start conversation. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-white justify-center items-center">
        <ActivityIndicator size="large" color="#0141C5" />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-gray-white justify-center items-center">
        <Text className="text-text-secondary">Job not found</Text>
        <TouchableOpacity onPress={() => route.back()} className="mt-4">
          <Text className="text-primary-main">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-light">
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity onPress={() => route.back()}>
            <Ionicons name="arrow-back" size={22} color="#000000" />
          </TouchableOpacity>
          <Text className="text-h2 font-semibold text-text-primary">
            Job Details
          </Text>
        </View>

        <TouchableOpacity onPress={handleSaveJob}>
          <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color="#0141C5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 150 }}
        className="px-4 pt-4"
      >
        <Text className="text-h1 font-bold text-text-primary mb-1">{job.title}</Text>
        {job.location && (
          <Text className="text-body2 text-text-secondary mb-4">
            {job.location.city}, {job.location.state}
          </Text>
        )}

        <View className="flex-row flex-wrap mb-4">
          {job.employmentType && (
            <View className="bg-primary-light1 px-3 py-1 rounded-xl mr-2 mb-2">
              <Text className="text-caption font-bold text-primary-main">
                {job.employmentType.replace('_', ' ')}
              </Text>
            </View>
          )}

          {job.salary && (
            <View className="bg-actionLight-green px-3 py-1 rounded-xl mr-2 mb-2">
              <Text className="text-caption font-bold text-action-green">
                ${job.salary.min} - ${job.salary.max}/{job.salary.type === 'HOURLY' ? 'hr' : 'yr'}
              </Text>
            </View>
          )}

          {job.shiftType && (
            <View className="bg-secondary-light1 px-3 py-1 rounded-xl mb-2">
              <Text className="text-caption font-bold text-secondary-main">
                {job.shiftType}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-h4 font-semibold text-text-primary mb-2">
          Job Description
        </Text>
        <Text className="text-body1 text-text-secondary mb-4">
          {job.description}
        </Text>

        <Text className="text-h4 font-semibold text-text-primary mb-2">
          Requirements
        </Text>

        {[
          job.minimumEducation ? `Education: ${job.minimumEducation}` : null,
          job.minExperience !== undefined ? `Experience: ${job.minExperience} - ${job.maxExperience} years` : null,
          ...(job.licensesRequired || [])
        ].filter(Boolean).map((item, index) => (
          <View key={index} className="flex-row items-start mb-2">
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#006900"
              style={{ marginTop: 2 }}
            />
            <Text className="ml-2 text-body2 text-text-secondary flex-1">
              {item}
            </Text>
          </View>
        ))}

        {job.benefits && job.benefits.length > 0 && (
          <>
            <Text className="text-h4 font-semibold text-text-primary mt-4 mb-2">
              Benefits
            </Text>
            {job.benefits.map((item: string, index: number) => (
              <View key={index} className="flex-row items-start mb-2">
                <Ionicons
                  name="star"
                  size={16}
                  color="#0141C5"
                  style={{ marginTop: 3 }}
                />
                <Text className="ml-2 text-body2 text-text-secondary flex-1">
                  {item}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View className="px-4 pb-6 mt-auto bg-white pt-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            disabled={chatLoading}
            onPress={handleStartChat}
            className={`flex-1 h-12 rounded-xl border items-center justify-center border-primary-main`}
          >
            {chatLoading ? (
              <ActivityIndicator color="#0141C5" />
            ) : (
              <Text className="text-primary-main font-semibold">
                Message Recruiter
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-[1.5]">
            <ButtonComponent
              title={isApplied ? "Applied" : "Apply Now"}
              onPress={handleApplyClick}
              disabled={isApplied}
            />
          </View>
        </View>
      </View>

      <ApplyJobModal
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        job={job}
        onSuccess={handleApplySuccess}
      />
    </SafeAreaView>
  );
};

export default JobDetailsScreen;
