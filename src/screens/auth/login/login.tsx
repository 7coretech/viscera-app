import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import { useResponsive } from "@/src/hooks/useResponsive";
import { AppDispatch, RootState } from "@/src/store";
import { loginUser } from "@/src/store/authSlice";
import { toast } from "@/src/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import Viscera_Logo from "../../../../assets/images/Viscera_Logo.png";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const router = useRouter();
  const { isTablet } = useResponsive();
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Welcome back!");
      router.push('/app/home');
    } else {
      toast.error((resultAction.payload as string) || "Invalid credentials");
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1 bg-background-default"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow justify-center items-center p-4">
          <View className={`items-center ${isTablet ? "w-[450px]" : "w-full"}`}>
            <View className={`items-center pb-10`}>
              <View
                className={`w-20 h-20 items-center justify-center rounded-xl mb-3 bg-background-default border-2 border-primary-light1 shadow-sm`}
              >
                <Image
                  source={Viscera_Logo}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
              </View>
              <View className="items-center gap-1">
                <Text className="text-h1 font-medium text-text-primary">
                  Nurse Connect
                </Text>

                <Text className="text-body1 text-text-secondary">
                  Your healthcare career starts here
                </Text>
              </View>
            </View>

            <View className="w-full">
              <View className="gap-3">
                <View>
                  <FormLabel>Email Address</FormLabel>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <InputComponent
                        placeholder="sarah.nurse@example.com"
                        leftIconName="mail"
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
                  <FormLabel>Password</FormLabel>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <InputComponent
                        type="password"
                        placeholder="••••••••••••"
                        secureTextEntry
                        showPasswordToggle={true}
                        leftIconName="lock-closed"
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
              <TouchableOpacity className="mb-4 mt-1 self-end">
                <Text className="text-primary-main text-body1 font-bold">
                  Forgot password?
                </Text>
              </TouchableOpacity>

              <ButtonComponent
                title={loading ? "Signing In..." : "Sign In"}
                variant="gradient"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
              />

              <View className="flex-row justify-center items-center mt-4 gap-0.3">
                <Text className="text-body2 font-semibold">
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/auth/register/register")}>
                  <Text className="text-body2 font-bold text-primary-main">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
