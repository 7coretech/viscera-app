import ApplyJobModal from "@/src/components/ApplyJobModal";
import { appService } from "@/src/services/appApi/appService";
import { formatSalary } from "@/src/utils/salary";
import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const TABS = ["Recommended", "Applied", "Saved"] as const;

const JobsScreen = () => {
  const { tab } = useLocalSearchParams<{ tab: string }>();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Recommended");
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const route = useRouter();

  useEffect(() => {
    if (tab === 'applied') {
      setActiveTab('Applied');
    } else if (tab === 'saved') {
      setActiveTab('Saved');
    }
  }, [tab]);

  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchJobs();
    if (accessToken) {
      fetchUserInteractions();
    } else {
      setAppliedJobs([]);
      setSavedJobs([]);
    }
  }, [activeTab, accessToken]);

  const appliedJobIdsSet = React.useMemo(
    () => new Set(appliedJobs.map(String)),
    [appliedJobs]
  );
  const savedJobIdsSet = React.useMemo(
    () => new Set(savedJobs.map(String)),
    [savedJobs]
  );

  const filteredJobs = jobs.filter((job) => {
    const jobId = String(job.id || job._id || job.jobId || "");
    // Industry standard: In Recommended feed, hide jobs already applied to
    if (activeTab === "Recommended" && appliedJobIdsSet.has(jobId)) {
      return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = job.title?.toLowerCase() || "";
    const specialty = job.specialty?.toLowerCase() || "";
    const description = job.description?.toLowerCase() || "";
    const city = job.location?.city?.toLowerCase() || "";
    const state = job.location?.state?.toLowerCase() || "";
    const status = job.status?.toLowerCase() || "";

    return (
      title.includes(query) ||
      specialty.includes(query) ||
      description.includes(query) ||
      city.includes(query) ||
      state.includes(query) ||
      status.includes(query)
    );
  });

  const fetchUserInteractions = async () => {
    if (!accessToken) return;
    try {
      const [appliedRes, savedRes] = await Promise.allSettled([
        appService.getApplicantJobs('apply'),
        appService.getApplicantJobs('save')
      ]);

      if (appliedRes.status === 'fulfilled' && appliedRes.value?.data) {
        const arr = appliedRes.value.data?.data || appliedRes.value.data;
        if (Array.isArray(arr)) {
          const ids = arr.map((item: any) => {
            const id = item?.jobId?.id || item?.jobId?._id || item?.jobId || item?.id || item?._id;
            return id ? String(id) : null;
          }).filter(Boolean) as string[];
          setAppliedJobs(ids);
        }
      }

      if (savedRes.status === 'fulfilled' && savedRes.value?.data) {
        const arr = savedRes.value.data?.data || savedRes.value.data;
        if (Array.isArray(arr)) {
          const ids = arr.map((item: any) => {
            const id = item?.jobId?.id || item?.jobId?._id || item?.jobId || item?.id || item?._id;
            return id ? String(id) : null;
          }).filter(Boolean) as string[];
          setSavedJobs(ids);
        }
      }
    } catch (error) {
      console.log("Error fetching user interactions:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      if (activeTab === "Recommended") {
        const res = await appService.getJobs();
        if (res.data && Array.isArray(res.data.data)) {
          setJobs(res.data.data);
        }
      } else {
        if (!accessToken) {
          setJobs([]);
          setLoading(false);
          return;
        }
        const type = activeTab === "Applied" ? "apply" : "save";
        const res = await appService.getApplicantJobs(type);
        if (res.data && Array.isArray(res.data.data)) {
          setJobs(res.data.data);
        }
      }
    } catch (error) {
      console.log("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: any) => {
    if (!accessToken) {
      Alert.alert("Login Required", "Please login to apply for this job.");
      return;
    }
    const jobId = String(job.id || job._id || job.jobId || "");
    if (appliedJobIdsSet.has(jobId)) {
      Alert.alert("Already Applied", "You have already applied for this job.");
      return;
    }
    setSelectedJobForApply(job);
    setApplyModalVisible(true);
  };

  const handleApplySuccess = () => {
    const jobId = selectedJobForApply?.id || selectedJobForApply?._id || selectedJobForApply?.jobId;
    if (jobId) {
      setAppliedJobs((prev) => [...prev, jobId]);
    }
    if (activeTab === "Applied") {
      fetchJobs();
    }
  };

  const toggleSave = async (jobId: string) => {
    if (!accessToken) {
      Alert.alert("Login Required", "Please login to save jobs.");
      return;
    }
    const wasSaved = savedJobs.includes(jobId);
    // Optimistic UI update
    setSavedJobs((prev) =>
      wasSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );

    try {
      if (wasSaved) {
        await appService.unsaveJob({ jobId });
      } else {
        await appService.saveJob({ jobId });
      }
      // If we are in Saved tab, refetch to keep list in sync
      if (activeTab === 'Saved') {
        fetchJobs();
      }
    } catch (error: any) {
      console.log("Error toggling save job:", error);
      // Revert optimistic update on error
      setSavedJobs((prev) =>
        wasSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)
      );
      const msg = typeof error === 'string' ? error : (error?.message || "Could not update saved job. Please try again.");
      Alert.alert("Error", msg);
    }
  };

  const handleViewDetails = (jobId: string) => {
    route.push({ pathname: '/app/JobDetail', params: { jobId } });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-light">
        <Text className="text-h2 font-semibold text-text-primary">
          Find Jobs
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 pt-3">
        <View className="flex-row items-center bg-gray-extraLight border border-gray-light rounded-xl px-3 py-2">
          <Ionicons name="search" size={18} color="#4D4D4D" />
          <TextInput
            placeholder="Search job title, keyword..."
            placeholderTextColor="#6B7280"
            selectionColor="#0141C5"
            style={{ color: "#111827", fontSize: 14 }}
            className="flex-1 ml-2 text-body1 text-text-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mt-4 gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              className={`flex-1 py-2.5 px-1 rounded-xl items-center justify-center ${isActive ? "bg-primary-main shadow-sm" : "bg-gray-light"
                }`}
            >
              <Text
                numberOfLines={1}
                className={`text-center font-semibold text-[13px] ${isActive ? "text-gray-white font-bold" : "text-text-secondary"
                  }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Job List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0141C5" />
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-center text-text-secondary mt-10">
              No jobs found
            </Text>
          }
          renderItem={({ item }) => {
            const jobId = String(item.id || item._id || item.jobId || "");

            // In Applied tab or if already applied, mark applied
            const isApplied = activeTab === "Applied" || appliedJobIdsSet.has(jobId);
            const isSaved = savedJobIdsSet.has(jobId);

            return (
              <View className="bg-gray-white rounded-xl p-4 mb-3 border border-gray-light">
                {/* Card Top */}
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => handleViewDetails(jobId)}
                    activeOpacity={0.8}
                    className="flex-row flex-1"
                  >
                    <View>
                      <Text className="text-body1 font-semibold text-text-primary">
                        {item.title}
                      </Text>
                      {item.location && (
                        <Text className="text-caption text-text-secondary">
                          {item.location.city}, {item.location.state}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-2 flex-wrap gap-2">
                        {item.specialty && (
                          <Text className="text-caption text-text-secondary bg-gray-extraLight px-2 py-0.5 rounded overflow-hidden">
                            {item.specialty}
                          </Text>
                        )}
                        {item.salary && formatSalary(item.salary) ? (
                          <Text className="text-caption font-bold text-action-green bg-actionLight-green px-2 py-0.5 rounded overflow-hidden">
                            {formatSalary(item.salary)}
                          </Text>
                        ) : null}
                        {item.status && (
                          <Text className="text-caption font-bold text-action-green bg-actionLight-green px-2 py-0.5 rounded overflow-hidden">
                            {item.status}
                          </Text>
                        )}
                      </View>

                      <View className="mt-2 items-start">
                        <View className="bg-primary-light1 px-2 py-0.5 rounded overflow-hidden">
                          <Text className="text-caption font-medium text-primary-main">
                            {item.postedAt || "Recently"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Save */}
                  <TouchableOpacity onPress={() => toggleSave(jobId)}>
                    <Ionicons
                      name={isSaved ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color="#0141C5"
                    />
                  </TouchableOpacity>
                </View>

                {/* Location/Details Row - Optional if we want extra info */}
                <View className="flex-row items-center mt-2">
                  {/* Can add more info here if needed */}
                </View>

                {/* Actions */}
                <View className="flex-row justify-between items-center mt-4">
                  {/* View Details */}
                  <TouchableOpacity onPress={() => handleViewDetails(jobId)}>
                    <Text className="text-body2 font-semibold text-primary-main">
                      View Details
                    </Text>
                  </TouchableOpacity>

                  {/* Apply / Applied Status Button */}
                  {isApplied ? (
                    <View className="flex-row items-center bg-actionLight-green/30 border border-action-green/30 px-4 py-2 rounded-lg">
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
                      <Text className="text-body2 font-bold text-action-green">
                        {item.applicationStatus ? String(item.applicationStatus).toUpperCase() : "Applied"}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleApplyClick(item)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#0141C5", "#3ACBE8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 8 }}
                      >
                        <Text className="text-body2 font-semibold text-center text-gray-white px-5 py-2">
                          Apply
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <ApplyJobModal
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        job={selectedJobForApply}
        onSuccess={handleApplySuccess}
      />
    </SafeAreaView>
  );
};

export default JobsScreen;
