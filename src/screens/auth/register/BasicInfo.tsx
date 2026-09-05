// components/register/BasicInfo.tsx
import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import SelectComponent from "@/src/components/SelectComponent";
import { useAppDispatch, useAppSelector } from "@/src/hooks/store";
import { registerUser, sendOtp } from "@/src/store/authSlice";
import { toast } from "@/src/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const basicInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  workStatus: z.string().min(1, "Please select your work status"),
  password: z.string().min(8, "Password must be at least 8 characters"),

});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

type Props = {
  onNext: (data: BasicInfoFormData) => void;
  defaultValues?: Partial<BasicInfoFormData>;
};

const workStatusOptions = [
  { label: "Experienced", value: "Experienced" },
  { label: "Student/Internship", value: "Student/Internship" },
];

const BasicInfo: React.FC<Props> = ({ onNext, defaultValues }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      workStatus: "",
      password: "",

      ...defaultValues,
    },
  });

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      // 1. Register User
      const registerResult = await dispatch(registerUser(data)).unwrap();

      // 2. Send OTP if registration successful
      if (registerResult) {
        await dispatch(sendOtp(data.email)).unwrap();
        toast.success("Account created and OTP sent successfully!");
        onNext(data);
      }
    } catch (err: any) {
      toast.error(err || "Something went wrong. Please try again.");
    }
  };

  return (
    <View className="w-full">
      <View className="gap-3">
        <View>
          <FormLabel>Full Name</FormLabel>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputComponent
                placeholder="John Doe"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                editable={!loading}
              />
            )}
          />
        </View>

        <View>
          <FormLabel>Email Address</FormLabel>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputComponent
                placeholder="john@example.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                helperText={errors.email?.message}
                editable={!loading}
              />
            )}
          />
        </View>

        <View>
          <FormLabel>Mobile Number</FormLabel>
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputComponent
                placeholder="+1 (555) 000-0000"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
                error={!!errors.mobile}
                helperText={errors.mobile?.message}
                editable={!loading}
              />
            )}
          />
        </View>

        <View>
          <FormLabel>Work Status</FormLabel>
          <Controller
            control={control}
            name="workStatus"
            render={({ field: { onChange, value } }) => (
              <SelectComponent
                placeholder="Select Work Status"
                options={workStatusOptions}
                onChange={onChange}
                value={value}
                error={!!errors.workStatus}
                helperText={errors.workStatus?.message}
                editable={!loading}
              />
            )}
          />
        </View>

        <View>
          <FormLabel>Password</FormLabel>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputComponent
                placeholder="••••••••"
                secureTextEntry
                showPasswordToggle
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.password}
                helperText={errors.password?.message}
                editable={!loading}
              />
            )}
          />
        </View>


      </View>

      <ButtonComponent
        title={loading ? "Registering..." : "Continue to Verification"}
        variant="gradient"
        className="mt-6"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
      />

      <View className="mt-4 px-2">
        <Text className="text-caption text-text-secondary text-center leading-4">
          By creating an account, you agree to our{" "}
          <Text
            className="text-primary-main font-semibold"
            onPress={() => Linking.openURL("https://app.visceraconnect.com/terms")}
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            className="text-primary-main font-semibold"
            onPress={() => Linking.openURL("https://app.visceraconnect.com/privacy")}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      <View className="flex-row justify-center items-center mt-4 gap-0.3">
        <Text className="text-body2 font-semibold">
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/auth/login/login")}>
          <Text className="text-body2 font-bold text-primary-main">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BasicInfo;
