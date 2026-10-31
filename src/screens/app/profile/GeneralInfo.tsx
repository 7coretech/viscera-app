import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { cleanProfileImageUrl } from "@/src/utils/imageUtils";

const GeneralInfo = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await appService.getUserProfile();
      if (response.data.success) {
        const { fullName, email, mobile, workStatus, profileImage, address, city, state } = response.data.data;
        setFirstName(fullName || "");
        setEmail(email || "");
        setMobile(mobile || "");
        setStatus(workStatus || "");
        setAddress(address || "");
        setCity(city || "");
        setState(state || "");
        const cleanUrl = cleanProfileImageUrl(profileImage);
        setProfileImage(cleanUrl);
        setImageError(false);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const uri = asset.uri;
          let name = asset.fileName || `avatar_${Date.now()}.jpg`;
          if (!name.includes('.')) {
            name = `${name}.jpg`;
          }
          const mimeType = asset.mimeType || 'image/jpeg';

          setNewProfileImage({
            uri,
            name,
            mimeType,
          });
          setProfileImage(uri);
          setImageError(false);
          return;
        }
        if (result.canceled) return;
      }

      // Fallback to DocumentPicker if ImagePicker permissions not granted
      const docResult = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/jpg", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!docResult.canceled && docResult.assets && docResult.assets.length > 0) {
        const file = docResult.assets[0];
        setNewProfileImage(file);
        setProfileImage(file.uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let response: any;

      if (newProfileImage) {
        const formData = new FormData();
        formData.append('fullName', firstName.trim());
        formData.append('email', email.trim());
        formData.append('mobile', mobile.trim());
        formData.append('workStatus', status);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('state', state);

        const fileUri = newProfileImage.uri;
        let fileName = newProfileImage.name || `avatar_${Date.now()}.jpg`;
        if (!fileName.includes('.')) {
          fileName = `${fileName}.jpg`;
        }
        const fileType = newProfileImage.mimeType || 'image/jpeg';

        const cleanUri =
          Platform.OS === 'android'
            ? fileUri
            : fileUri.replace('file://', '');

        const fileObj = {
          uri: cleanUri,
          name: fileName,
          type: fileType,
        };

        // Standard backend key for profile image upload
        formData.append('profile', fileObj as any);

        response = await appService.updateUserProfile(formData);
      } else {
        // Direct clean JSON update when no image is being uploaded
        response = await appService.updateUserProfileJson({
          fullName: firstName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          workStatus: status,
          address: address,
          city: city,
          state: state,
        });
      }

      if (response?.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile updated successfully',
        });

        // Refresh data & cache to AsyncStorage
        if (response.data.data) {
          const { fullName, email: resEmail, mobile: resMobile, workStatus, profileImage: resImg, address: resAddr, city: resCity, state: resState } = response.data.data;
          setFirstName(fullName || firstName);
          setEmail(resEmail || email);
          setMobile(resMobile || mobile);
          setStatus(workStatus || status);
          setAddress(resAddr || address);
          setCity(resCity || city);
          setState(resState || state);
          const cleanUrl = cleanProfileImageUrl(resImg);
          if (cleanUrl) {
            setProfileImage(cleanUrl);
            setImageError(false);
          }
          setNewProfileImage(null);
        }
      }
    } catch (error: any) {
      console.log('Error updating profile:', error);
      const errMsg =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message ||
            error?.message ||
            'Failed to update profile';
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const statusOptions = [
    { label: "Experience", value: "Experience" },
    { label: "Student/Intership", value: "Student/Internship" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-light">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.palette.gery.darkGray}
            />
          </TouchableOpacity>

          <Text className="text-h2 font-semibold text-text-primary">
            General Information
          </Text>
        </View>

        <ScrollView
          className="px-4 pt-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className="items-center mb-6">
          <View className="relative">
            {profileImage && !imageError ? (
              <Image
                source={{ uri: profileImage }}
                className="w-28 h-28 rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-primary-light1 items-center justify-center border-2 border-primary-light2">
                <Text className="text-h1 font-bold text-primary-main">
                  {getInitials(firstName)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handlePickImage}
              className="absolute bottom-1 right-1 bg-primary-main p-2 rounded-full border-2 border-white"
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <FormLabel>Full Name</FormLabel>
          <InputComponent value={firstName} onChangeText={setFirstName} />
        </View>

        <View className="mb-4">
          <FormLabel>Email Address</FormLabel>
          <InputComponent
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
          />
        </View>

        <View className="mb-4">
          <FormLabel>Mobile Number</FormLabel>
          <InputComponent
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-4">
          <FormLabel>Work Status</FormLabel>
          <SelectComponent
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Select Status"
          />
        </View>

        <View className="mb-4">
          <FormLabel>Address</FormLabel>
          <InputComponent
            value={address}
            onChangeText={setAddress}
            placeholder="Enter Address"
          />
        </View>

        <View className="mb-4">
          <FormLabel>City</FormLabel>
          <InputComponent
            value={city}
            onChangeText={setCity}
            placeholder="Enter City"
          />
        </View>

        <View className="mb-4">
          <FormLabel>State</FormLabel>
          <InputComponent
            value={state}
            onChangeText={setState}
            placeholder="Enter State"
          />
        </View>

      </ScrollView>

      <View
        className="px-4 pt-2 mt-auto bg-gray-white border-t border-gray-light"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <ButtonComponent
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default GeneralInfo;
