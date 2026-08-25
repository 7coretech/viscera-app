import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LicenceForm from "./Forms/LicenceForm";


const Licence = () => {
  const theme = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [licenceData, setLicenceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await appService.getLicenses();
      if (response.data.success && response.data.data) {
        setLicenceData(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching licenses:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append text fields
      formData.append('licenseType', data.licenseType);
      formData.append('licenseNumber', data.licenseNumber);
      formData.append('expiryDate', data.expiryDate);
      formData.append('isMultiState', data.isMultiState);

      // Append states array
      if (data.states && data.states.length > 0) {
        data.states.forEach((state: string) => {
          formData.append('states[]', state);
        });
      }

      // Append specialties array
      if (data.specialties && data.specialties.length > 0) {
        data.specialties.forEach((specialty: string) => {
          formData.append('specialties[]', specialty);
        });
      }

      // Append file if exists
      if (data.credentialFile) {
        formData.append('license', {
          uri: data.credentialFile.uri,
          name: data.credentialFile.name,
          type: data.credentialFile.mimeType || 'application/pdf',
        } as any);
      }

      let response;
      if (editingLicense) {
        response = await appService.updateLicenses(editingLicense.id, formData);
      } else {
        response = await appService.saveLicenses(formData);
      }

      if (response.data.success) {
        toast.success(response.data.message || `License ${editingLicense ? 'updated' : 'added'} successfully.`);
        await fetchLicenses();
        setModalVisible(false);
        setEditingLicense(null);
      }
    } catch (error: any) {
      console.log("Error saving license:", error);
      const errMsg =
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            error.message ||
            "Failed to save license.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (license: any) => {
    setEditingLicense(license);
    setModalVisible(true);
  };

  const handleDelete = async (licenseId: string) => {
    try {
      const response = await appService.deleteLicense(licenseId);
      if (response.data.success) {
        toast.success("License deleted successfully.");
        await fetchLicenses();
      }
    } catch (error: any) {
      console.log("Error deleting license:", error);
      const errMsg =
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            error.message ||
            "Failed to delete license.";
      toast.error(errMsg);
    }
  };

  const handleViewLicense = async (licenseId: string) => {
    try {
      const response = await appService.getLicenseById(licenseId);
      const url =
        response.data?.data?.fileUrl ||
        response.data?.fileUrl ||
        response.data?.data?.url ||
        response.data?.url;

      if (url) {
        await Linking.openURL(url);
      } else {
        toast.error("License document file URL not found.");
      }
    } catch (error: any) {
      console.log("Error viewing license:", error);
      toast.error("Failed to open license document.");
    }
  };

  const handleAddNew = () => {
    setEditingLicense(null);
    setModalVisible(true);
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
            Licence & Certifications
          </Text>
        </View>
        <TouchableOpacity onPress={handleAddNew} >
          <Ionicons name={'add-circle'} size={30} color={theme.palette.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: licenceData.length === 0 ? "center" : "flex-start",
          paddingBottom: 140,
          paddingTop: licenceData.length > 0 ? 16 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View className="items-center py-4">
            <ActivityIndicator size="large" color={theme.palette.primary.main} />
            <Text className="text-small text-text-secondary mt-2">Processing...</Text>
          </View>
        )}

        {!loading && licenceData.length === 0 ? (
          <View className="items-center">
            <Ionicons
              name="document-outline"
              size={56}
              color={theme.palette.primary.main}
            />

            <Text className="text-h3 font-semibold mt-4 text-text-primary">
              No licenses added
            </Text>

            <Text className="text-center text-small text-text-secondary mt-1 px-8">
              Add your nursing licenses and certifications
            </Text>

            <TouchableOpacity
              onPress={handleAddNew}
              className="mt-5 bg-primary-main px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">
                Add Licence
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            {licenceData.map((license) => (
              <View key={license.id} className="border border-action-green/20 bg-actionLight-green/20 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-h3 font-semibold text-text-primary">
                    {license.licenseType}
                  </Text>

                  {license.isVerified && (
                    <View className="flex-row items-center bg-actionLight-green px-3 py-1 rounded-full">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={theme.palette.action.green}
                      />
                      <Text className="ml-1 text-caption font-medium text-action-green">
                        Verified
                      </Text>
                    </View>
                  )}
                </View>

                {license.states && license.states.length > 0 && (
                  <Text className="text-body2 text-text-secondary mt-1">
                    {license.states.join(', ')}
                  </Text>
                )}

                <Text className="text-body2 text-text-secondary mt-2">
                  License #:{" "}
                  <Text className="text-text-primary font-medium">
                    {license.licenseNumber}
                  </Text>
                  {"  "}•{"  "}
                  Expires:{" "}
                  <Text className="text-text-primary font-medium">
                    {license.expiryDate
                      ? new Date(license.expiryDate).toLocaleDateString()
                      : "-"}
                  </Text>
                </Text>

                {license.specialties && license.specialties.length > 0 && (
                  <Text className="text-body2 text-text-secondary mt-1">
                    Specialties: {license.specialties.join(', ')}
                  </Text>
                )}

                {license.isMultiState && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="shield-checkmark" size={14} color={theme.palette.primary.main} />
                    <Text className="ml-1 text-caption text-primary-main">Multi-State License</Text>
                  </View>
                )}

                {license.fileKey && license.fileKey.length > 0 && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="document-attach" size={14} color={theme.palette.text.secondary} />
                    <Text className="ml-1 text-caption text-text-secondary">
                      {license.fileKey.length} file{license.fileKey.length > 1 ? 's' : ''} attached
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center gap-4 mt-3">
                  {license.fileKey && license.fileKey.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleViewLicense(license.id)}
                      className="flex-row items-center"
                    >
                      <Ionicons
                        name="eye-outline"
                        size={16}
                        color={theme.palette.primary.main}
                      />
                      <Text className="ml-1 text-body2 font-medium text-primary-main">
                        View
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleEdit(license)}
                    className="flex-row items-center"
                  >
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={theme.palette.primary.main}
                    />
                    <Text className="ml-1 text-body2 font-medium text-primary-main">
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(license.id)}
                    className="flex-row items-center"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color="#EF4444"
                    />
                    <Text className="ml-1 text-body2 font-medium text-red-500">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <LicenceForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingLicense(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingLicense}
      />
    </SafeAreaView>
  )
}

export default Licence