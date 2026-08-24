import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";

interface ApplyJobModalProps {
  visible: boolean;
  onClose: () => void;
  job: any;
  onSuccess: (applicationData?: any) => void;
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  visible,
  onClose,
  job,
  onSuccess,
}) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchNurseProfileDocuments();
    }
  }, [visible]);

  const fetchNurseProfileDocuments = async () => {
    setLoading(true);
    try {
      const [resumesRes, licensesRes, docsRes] = await Promise.allSettled([
        appService.getResumes(),
        appService.getLicenses(),
        appService.getDocuments(),
      ]);

      if (resumesRes.status === "fulfilled" && resumesRes.value?.data?.data) {
        const list = Array.isArray(resumesRes.value.data.data)
          ? resumesRes.value.data.data
          : [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0].id || list[0]._id);
        }
      }

      if (licensesRes.status === "fulfilled" && licensesRes.value?.data?.data) {
        const list = Array.isArray(licensesRes.value.data.data)
          ? licensesRes.value.data.data
          : [];
        setLicenses(list);
        // Auto-select all existing licenses by default
        setSelectedLicenseIds(list.map((l: any) => l.id || l._id));
      }

      if (docsRes.status === "fulfilled" && docsRes.value?.data?.data) {
        const list = Array.isArray(docsRes.value.data.data)
          ? docsRes.value.data.data
          : [];
        setDocuments(list);
        // Auto-select all existing documents by default
        setSelectedDocIds(list.map((d: any) => d.id || d._id));
      }
    } catch (err) {
      console.log("Error loading documents for job application:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewResume = async () => {
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
      setUploadingResume(true);

      try {
        const formData = new FormData();
        formData.append("resume", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/pdf",
        } as any);

        const response = await appService.uploadResume(formData);

        if (response.data?.success) {
          toast.success("Resume uploaded successfully.");
          const newResume = response.data.data;
          const newId = newResume?.id || newResume?._id;
          if (newResume) {
            setResumes((prev) => [newResume, ...prev]);
            if (newId) setSelectedResumeId(newId);
          }
        }
      } catch (error: any) {
        console.log("Error uploading resume in modal:", error);
        const errMsg =
          typeof error === "string"
            ? error
            : error.response?.data?.message ||
              error.message ||
              "Failed to upload resume.";
        toast.error(errMsg);
      } finally {
        setUploadingResume(false);
      }
    }
  };

  const toggleLicense = (id: string) => {
    setSelectedLicenseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDocument = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitApplication = async () => {
    const jobId = job?.id || job?._id || job?.jobId;
    if (!jobId) {
      Alert.alert("Error", "Job ID is missing.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        jobId,
        status: "APPLYED",
        coverLetter: coverLetter.trim() || undefined,
        resumeId: selectedResumeId || undefined,
        licenseIds: selectedLicenseIds.length > 0 ? selectedLicenseIds : undefined,
        documentIds: selectedDocIds.length > 0 ? selectedDocIds : undefined,
      };

      const res = await appService.applyJob(payload);
      toast.success("Application submitted successfully!");
      onSuccess(res?.data?.data || res?.data);
      onClose();
    } catch (error: any) {
      console.log("Error applying for job:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        (typeof error === "string" ? error : "Failed to apply for job.");
      Alert.alert("Application Notice", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const jobTitle = job?.title || job?.jobTitle || "Nursing Position";
  const hospital = job?.hospital || job?.organization?.name || job?.companyName || "Partner Hospital";
  const location = job?.location || "";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[85%] w-full">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-light">
              <View className="flex-1 pr-2">
                <Text className="text-h3 font-bold text-text-primary" numberOfLines={1}>
                  Apply for Job
                </Text>
                <Text className="text-small text-text-secondary mt-0.5" numberOfLines={1}>
                  {jobTitle} • {hospital}{location ? ` • ${location}` : ""}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="p-1 rounded-full bg-gray-light/60"
              >
                <Ionicons name="close" size={22} color={theme.palette.gery.darkGray} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="py-16 items-center justify-center">
                <ActivityIndicator size="large" color={theme.palette.primary.main} />
                <Text className="text-small text-text-secondary mt-3">
                  Loading your profile documents...
                </Text>
              </View>
            ) : (
              <ScrollView
                className="p-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {/* 1. Resume Selection */}
                <View className="mb-5">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-body1 font-bold text-text-primary">
                      1. Select Resume <Text className="text-action-red">*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={handleUploadNewResume}
                      disabled={uploadingResume}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={theme.palette.primary.main}
                      />
                      <Text className="text-small font-semibold text-primary-main">
                        {uploadingResume ? "Uploading..." : "+ Upload New"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {resumes.length === 0 ? (
                    <TouchableOpacity
                      onPress={handleUploadNewResume}
                      className="border-2 border-dashed border-primary-main/40 bg-primary-main/5 p-4 rounded-xl items-center justify-center"
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={32}
                        color={theme.palette.primary.main}
                      />
                      <Text className="text-body2 font-semibold text-primary-main mt-1">
                        Upload Your Resume
                      </Text>
                      <Text className="text-caption text-text-secondary">
                        PDF, DOCX, DOC up to 10MB
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="gap-2">
                      {resumes.map((resume) => {
                        const id = resume.id || resume._id;
                        const isSelected = selectedResumeId === id;
                        return (
                          <TouchableOpacity
                            key={id}
                            onPress={() => setSelectedResumeId(id)}
                            className={`flex-row items-center p-3 rounded-xl border ${
                              isSelected
                                ? "border-primary-main bg-primary-main/5"
                                : "border-gray-light bg-white"
                            }`}
                          >
                            <Ionicons
                              name={
                                isSelected
                                  ? "radio-button-on"
                                  : "radio-button-off"
                              }
                              size={20}
                              color={
                                isSelected
                                  ? theme.palette.primary.main
                                  : theme.palette.gery.darkGray
                              }
                            />
                            <Ionicons
                              name="document-text-outline"
                              size={22}
                              color={theme.palette.primary.main}
                              style={{ marginLeft: 8, marginRight: 8 }}
                            />
                            <View className="flex-1">
                              <Text
                                className="text-body2 font-medium text-text-primary"
                                numberOfLines={1}
                              >
                                {resume.originalFileName || resume.name || "Resume Document"}
                              </Text>
                              {resume.size && (
                                <Text className="text-caption text-text-secondary">
                                  {(resume.size / 1024).toFixed(1)} KB
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* 2. Attached Licenses */}
                {licenses.length > 0 && (
                  <View className="mb-5">
                    <Text className="text-body1 font-bold text-text-primary mb-2">
                      2. Nursing Licenses ({selectedLicenseIds.length}/{licenses.length})
                    </Text>
                    <View className="gap-2">
                      {licenses.map((lic) => {
                        const id = lic.id || lic._id;
                        const isSelected = selectedLicenseIds.includes(id);
                        return (
                          <TouchableOpacity
                            key={id}
                            onPress={() => toggleLicense(id)}
                            className={`flex-row items-center p-3 rounded-xl border ${
                              isSelected
                                ? "border-primary-main bg-primary-main/5"
                                : "border-gray-light bg-white"
                            }`}
                          >
                            <Ionicons
                              name={isSelected ? "checkbox" : "square-outline"}
                              size={20}
                              color={
                                isSelected
                                  ? theme.palette.primary.main
                                  : theme.palette.gery.darkGray
                              }
                            />
                            <Ionicons
                              name="ribbon-outline"
                              size={20}
                              color={theme.palette.primary.main}
                              style={{ marginLeft: 8, marginRight: 8 }}
                            />
                            <View className="flex-1">
                              <Text
                                className="text-body2 font-medium text-text-primary"
                                numberOfLines={1}
                              >
                                {lic.licenseType || lic.title || "Nursing License"}
                              </Text>
                              {lic.licenseNumber && (
                                <Text className="text-caption text-text-secondary">
                                  Lic #: {lic.licenseNumber} • State: {lic.issuingState || "Active"}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 3. Supporting Documents */}
                {documents.length > 0 && (
                  <View className="mb-5">
                    <Text className="text-body1 font-bold text-text-primary mb-2">
                      3. Certifications & Documents ({selectedDocIds.length}/{documents.length})
                    </Text>
                    <View className="gap-2">
                      {documents.map((doc) => {
                        const id = doc.id || doc._id;
                        const isSelected = selectedDocIds.includes(id);
                        return (
                          <TouchableOpacity
                            key={id}
                            onPress={() => toggleDocument(id)}
                            className={`flex-row items-center p-3 rounded-xl border ${
                              isSelected
                                ? "border-primary-main bg-primary-main/5"
                                : "border-gray-light bg-white"
                            }`}
                          >
                            <Ionicons
                              name={isSelected ? "checkbox" : "square-outline"}
                              size={20}
                              color={
                                isSelected
                                  ? theme.palette.primary.main
                                  : theme.palette.gery.darkGray
                              }
                            />
                            <Ionicons
                              name="folder-outline"
                              size={20}
                              color={theme.palette.primary.main}
                              style={{ marginLeft: 8, marginRight: 8 }}
                            />
                            <View className="flex-1">
                              <Text
                                className="text-body2 font-medium text-text-primary"
                                numberOfLines={1}
                              >
                                {doc.documentType || doc.title || doc.name || "Supporting Document"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 4. Cover Letter Note */}
                <View className="mb-5">
                  <Text className="text-body1 font-bold text-text-primary mb-2">
                    4. Note / Cover Letter (Optional)
                  </Text>
                  <TextInput
                    value={coverLetter}
                    onChangeText={setCoverLetter}
                    placeholder="Introduce yourself, mention your clinical availability and why you're a great fit..."
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="p-3 bg-white border border-gray-light rounded-xl text-body2 text-text-primary min-h-[90px]"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmitApplication}
                  disabled={submitting || (resumes.length > 0 && !selectedResumeId)}
                  className={`py-3.5 px-4 rounded-xl flex-row items-center justify-center shadow-sm ${
                    submitting || (resumes.length > 0 && !selectedResumeId)
                      ? "bg-primary-main/60"
                      : "bg-primary-main"
                  }`}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text className="text-body1 font-bold text-white">
                        Submit Application
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ApplyJobModal;
