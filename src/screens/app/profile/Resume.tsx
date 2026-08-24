import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Resume = () => {
  const theme = useTheme();
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await appService.getResumes();
      if (response.data.success && response.data.data) {
        setResumes(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching resumes:', error);
    }
  };

  const handleUploadResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('resume', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);

        const response = await appService.uploadResume(formData);

        if (response.data.success) {
          toast.success(response.data.message || "Resume uploaded successfully.");
          await fetchResumes();
        }
      } catch (error: any) {
        console.log("Error uploading resume:", error);
        const errMsg =
          typeof error === "string"
            ? error
            : error.response?.data?.message ||
              error.message ||
              "Failed to upload resume.";
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewResume = async (resumeId: string) => {
    try {
      const response = await appService.getResumeUrl(resumeId);
      if (response.data.success && response.data.data.url) {
        await Linking.openURL(response.data.data.url);
      }
    } catch (error: any) {
      console.log("Error viewing resume:", error);
      toast.error("Failed to open resume.");
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const response = await appService.deleteResume(resumeId);
      if (response.data.success) {
        toast.success("Resume deleted successfully.");
        await fetchResumes();
      }
    } catch (error: any) {
      console.log("Error deleting resume:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete resume."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-light">
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity onPress={() => router.push("/app/(tabs)/profile")}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.palette.gery.darkGray}
            />
          </TouchableOpacity>

          <Text className="text-h2 font-semibold text-text-primary">
            Resume Upload
          </Text>
        </View>

        <TouchableOpacity onPress={handleUploadResume}>
          <Ionicons
            name="add-circle"
            size={30}
            color={theme.palette.primary.main}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: resumes.length === 0 ? "center" : "flex-start",
          paddingBottom: 140,
          paddingTop: resumes.length > 0 ? 16 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View className="items-center py-4">
            <ActivityIndicator size="large" color={theme.palette.primary.main} />
            <Text className="text-small text-text-secondary mt-2">Uploading...</Text>
          </View>
        )}

        {!loading && resumes.length === 0 ? (
          <View className="items-center">
            <Ionicons
              name="document-attach-outline"
              size={56}
              color={theme.palette.primary.main}
            />

            <Text className="text-h3 font-semibold mt-4 text-text-primary">
              No resume uploaded
            </Text>

            <Text className="text-center text-small text-text-secondary mt-1 px-8">
              Upload your resume to apply for jobs quickly
            </Text>

            <TouchableOpacity
              onPress={handleUploadResume}
              className="mt-5 bg-primary-main px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Upload Resume</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            {resumes.map((resume) => (
              <View
                key={resume.id}
                className="p-4 rounded-xl border border-gray-light bg-white"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name="document-text-outline"
                    size={28}
                    color={theme.palette.primary.main}
                  />

                  <View className="flex-1">
                    <Text className="font-semibold text-text-primary">
                      {resume.originalFileName}
                    </Text>

                    {resume.size && (
                      <Text className="text-small text-text-secondary">
                        {(resume.size / 1024).toFixed(1)} KB
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleViewResume(resume.id)}
                    className="p-2"
                  >
                    <Ionicons
                      name="eye-outline"
                      size={22}
                      color={theme.palette.primary.main}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteResume(resume.id)}
                    className="p-2"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Resume;
