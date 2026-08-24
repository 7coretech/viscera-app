import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const Documents = () => {
  const theme = useTheme();
  const router = useRouter();
  const [documentData, setDocumentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await appService.getDocuments();
      if (response.data.success && response.data.data) {
        setDocumentData(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching documents:', error);
    }
  };

  const handleUploadDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('document', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);

        const response = await appService.uploadDocument(formData);

        if (response.data.success) {
          toast.success(response.data.message || "Document uploaded successfully.");
          await fetchDocuments();
        }
      } catch (error: any) {
        console.log("Error uploading document:", error);
        const errMsg =
          typeof error === "string"
            ? error
            : error.response?.data?.message ||
              error.message ||
              "Failed to upload document.";
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      const response = await appService.getDocumentUrl(documentId);
      if (response.data.success && response.data.data.url) {
        await Linking.openURL(response.data.data.url);
      }
    } catch (error: any) {
      console.log("Error viewing document:", error);
      toast.error("Failed to open document.");
    }
  };

  const handleEditDocument = async (documentId: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      setEditingDocId(documentId);
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('document', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);

        const response = await appService.updateDocument(documentId, formData);

        if (response.data.success) {
          toast.success(response.data.message || "Document updated successfully.");
          await fetchDocuments();
        }
      } catch (error: any) {
        console.log("Error updating document:", error);
        const errMsg =
          typeof error === "string"
            ? error
            : error.response?.data?.message ||
              error.message ||
              "Failed to update document.";
        toast.error(errMsg);
      } finally {
        setLoading(false);
        setEditingDocId(null);
      }
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await appService.deleteDocument(documentId);
      if (response.data.success) {
        toast.success("Document deleted successfully.");
        await fetchDocuments();
      }
    } catch (error: any) {
      console.log("Error deleting document:", error);
      const errMsg =
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            error.message ||
            "Failed to delete document.";
      toast.error(errMsg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-light">
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => {
            router.push('/app/(tabs)/profile')
          }}>
            <Ionicons name="arrow-back" size={22} color={theme.palette.gery.darkGray} />
          </TouchableOpacity>

          <Text className="text-h2 font-semibold text-text-primary">
            Documents
          </Text>
        </View>
        <TouchableOpacity onPress={handleUploadDocument}>
          <Ionicons name={'add-circle'} size={30} color={theme.palette.primary.main} />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="px-4"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: documentData.length === 0 ? "center" : "flex-start",
          paddingBottom: 140,
          paddingTop: documentData.length > 0 ? 16 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View className="items-center py-4">
            <ActivityIndicator size="large" color={theme.palette.primary.main} />
            <Text className="text-small text-text-secondary mt-2">
              {editingDocId ? 'Updating...' : 'Uploading...'}
            </Text>
          </View>
        )}

        {!loading && documentData.length === 0 ? (
          <View className="items-center">
            <Ionicons
              name="document-outline"
              size={56}
              color={theme.palette.primary.main}
            />

            <Text className="text-h3 font-semibold mt-4">
              No documents uploaded
            </Text>

            <Text className="text-center text-small text-text-secondary mt-1 px-8">
              Upload your certifications, ID, and other important documents
            </Text>

            <TouchableOpacity
              onPress={handleUploadDocument}
              className="mt-5 bg-primary-main px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">
                Upload Document
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            {documentData.map((doc) => (
              <View
                key={doc.id}
                className="p-4 rounded-xl border border-gray-light bg-white"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name={
                      doc.mimeType?.includes("pdf")
                        ? "document-text-outline"
                        : "image-outline"
                    }
                    size={28}
                    color={theme.palette.primary.main}
                  />

                  <View className="flex-1">
                    <Text className="font-semibold text-text-primary">
                      {doc.originalFileName}
                    </Text>
                    {doc.size && (
                      <Text className="text-small text-text-secondary">
                        {(doc.size / 1024).toFixed(1)} KB
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleViewDocument(doc.id)}
                    className="p-2"
                  >
                    <Ionicons
                      name="eye-outline"
                      size={22}
                      color={theme.palette.primary.main}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleEditDocument(doc.id)}
                    className="p-2"
                  >
                    <Ionicons
                      name="create-outline"
                      size={22}
                      color={theme.palette.primary.main}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteDocument(doc.id)}
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
  )
}

export default Documents