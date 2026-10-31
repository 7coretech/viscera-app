import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import { useResponsive } from "@/src/hooks/useResponsive";
import { authService } from "@/src/services/authApi/authService";
import { useTheme } from "@/src/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getErrorMessage = (err: any, fallback: string): string => {
  if (typeof err === "string" && err.trim()) return err;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return fallback;
};

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const { isTablet } = useResponsive();
  const params = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill email if passed from login screen
  useEffect(() => {
    if (params.email && typeof params.email === "string") {
      setEmail(params.email.trim());
    }
  }, [params.email]);

  // Step 2: OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<TextInput[]>([]);

  // Step 3: Reset Password State
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleBack = () => {
    if (step === 1) {
      router.push("/auth/login/login");
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // STEP 1: Request OTP
  const handleRequestOtp = async () => {
    setEmailError("");
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setEmailError("Email address is required");
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(cleanEmail);
      toast.success("Verification code sent to your email!");
      setStep(2);
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "Failed to send verification code. Please try again."
      );
      toast.error(msg);
      setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle OTP input & Resend
  const handleOtpChange = (text: string, index: number) => {
    setOtpError(false);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    try {
      setLoading(true);
      await authService.forgotPassword(email.trim().toLowerCase());
      toast.success("A new verification code has been sent!");
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "Failed to resend code. Please try again."
      );
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setOtpError(true);
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyForgotPasswordOtp({
        email: email.trim().toLowerCase(),
        otp: enteredOtp,
      });

      const token = res?.data?.data?.resetToken || res?.data?.resetToken;
      if (!token) {
        throw new Error("Verification token not received");
      }

      setResetToken(token);
      toast.success("Code verified! Set your new password.");
      setStep(3);
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "Invalid or expired verification code."
      );
      toast.error(msg);
      setOtpError(true);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    setPasswordError("");
    setConfirmError("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
      });

      toast.success("Password reset successfully! Please sign in.");
      router.push("/auth/login/login");
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "Failed to reset password. Please try again."
      );
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-default" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Top App Header with Navigation */}
        <View className="px-5 py-3 border-b border-gray-light/60 bg-white flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center border border-gray-200"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>

          <Text className="text-body1 font-bold text-text-primary">
            {step === 1
              ? "Reset Password"
              : step === 2
              ? "Verify Code"
              : "New Password"}
          </Text>

          <View className="px-2.5 py-1 rounded-full bg-primary-light1 border border-primary-light2">
            <Text className="text-[12px] font-bold text-primary-main">
              Step {step}/3
            </Text>
          </View>
        </View>

        {/* Multi-step Progress Bar */}
        <View className="w-full flex-row h-1.5 bg-gray-200">
          <View
            className={`flex-1 h-full ${
              step >= 1 ? "bg-primary-main" : "bg-transparent"
            }`}
          />
          <View
            className={`flex-1 h-full ${
              step >= 2 ? "bg-primary-main" : "bg-transparent"
            }`}
          />
          <View
            className={`flex-1 h-full ${
              step >= 3 ? "bg-primary-main" : "bg-transparent"
            }`}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center items-center p-4"
          showsVerticalScrollIndicator={false}
        >
          <View className={`w-full ${isTablet ? "w-[440px]" : "w-full"}`}>
            {/* Main Card */}
            <View className="bg-white rounded-2xl p-6 border border-gray-light/70 shadow-sm">
              {/* STEP 1: Enter Email */}
              {step === 1 && (
                <View className="w-full">
                  <View className="items-center pb-6">
                    <LinearGradient
                      colors={["#0141C5", "#3ACBE8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-sm"
                    >
                      <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
                    </LinearGradient>

                    <Text className="text-h1 font-bold text-text-primary text-center">
                      Forgot Password?
                    </Text>
                    <Text className="text-body2 text-text-secondary text-center mt-2 px-2 leading-5">
                      Enter your registered email address and we&apos;ll send a 6-digit verification code to reset your account password.
                    </Text>
                  </View>

                  {Boolean(params.email) && (
                    <View className="mb-4 p-3 rounded-xl bg-primary-light1/60 border border-primary-light2 flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={18} color={theme.palette.primary.main} />
                      <Text className="text-caption font-medium text-primary-main flex-1">
                        Email auto-filled from your login attempt.
                      </Text>
                    </View>
                  )}

                  <View className="gap-4 w-full">
                    <View>
                      <FormLabel>Email Address</FormLabel>
                      <InputComponent
                        placeholder="sarah.nurse@example.com"
                        value={email}
                        onChangeText={(val) => {
                          setEmail(val);
                          if (emailError) setEmailError("");
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={Boolean(emailError)}
                        helperText={emailError}
                        editable={!loading}
                        leftIconName="mail-outline"
                      />
                    </View>

                    <ButtonComponent
                      title={loading ? "Sending Code..." : "Send Verification Code"}
                      variant="gradient"
                      onPress={handleRequestOtp}
                      loading={loading}
                    />

                    <View className="flex-row justify-center items-center mt-2">
                      <Text className="text-body2 text-text-secondary">
                        Remember your password?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push("/auth/login/login")}
                        activeOpacity={0.7}
                      >
                        <Text className="text-body2 font-bold text-primary-main">
                          Sign In
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* STEP 2: Enter 6-digit Code */}
              {step === 2 && (
                <View className="w-full items-center">
                  <View className="items-center pb-5">
                    <LinearGradient
                      colors={["#0141C5", "#3ACBE8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-sm"
                    >
                      <Ionicons name="mail-unread" size={28} color="#FFFFFF" />
                    </LinearGradient>

                    <Text className="text-h1 font-bold text-text-primary text-center">
                      Enter Verification Code
                    </Text>
                    <Text className="text-body2 text-text-secondary text-center mt-2 px-2 leading-5">
                      We sent a 6-digit OTP code to:{"\n"}
                      <Text className="font-bold text-text-primary">
                        {email}
                      </Text>
                    </Text>
                  </View>

                  {/* 6 OTP Input Boxes */}
                  <View className="flex-row justify-between w-full max-w-[320px] my-5">
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          if (ref) inputsRef.current[index] = ref;
                        }}
                        style={{ color: digit ? "#0141C5" : "#111827", fontSize: 22, fontWeight: "bold" }}
                        selectionColor="#0141C5"
                        className={`w-11 h-13 border-2 rounded-xl text-center text-h2 font-bold bg-gray-50/80 shadow-xs ${
                          otpError
                            ? "border-red-500 text-red-500 bg-red-50/20"
                            : digit
                            ? "border-primary-main text-primary-main bg-white"
                            : "border-gray-200 text-text-primary"
                        }`}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        selectTextOnFocus
                        editable={!loading}
                      />
                    ))}
                  </View>

                  {otpError && (
                    <Text className="text-caption text-red-500 mb-4 text-center font-medium">
                      Please enter the complete 6-digit code.
                    </Text>
                  )}

                  <View className="w-full gap-3 mt-2">
                    <ButtonComponent
                      title={loading ? "Verifying..." : "Verify & Continue"}
                      variant="gradient"
                      onPress={handleVerifyOtp}
                      loading={loading}
                    />

                    <View className="flex-row justify-center items-center mt-3">
                      <Text className="text-body2 text-text-secondary">
                        Didn&apos;t receive the code?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={!canResend || loading}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-body2 font-bold ${
                            canResend ? "text-primary-main" : "text-gray-400"
                          }`}
                        >
                          {canResend ? "Resend Code" : `Resend in ${timer}s`}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => setStep(1)}
                      className="mt-1 py-1 items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-caption font-semibold text-text-secondary">
                        Wrong email? <Text className="text-primary-main">Change Email</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: Set New Password */}
              {step === 3 && (
                <View className="w-full">
                  <View className="items-center pb-6">
                    <View className="w-16 h-16 rounded-2xl bg-action-green/10 items-center justify-center mb-4 border border-action-green/30 shadow-xs">
                      <Ionicons name="key" size={28} color="#10B981" />
                    </View>

                    <Text className="text-h1 font-bold text-text-primary text-center">
                      Set New Password
                    </Text>
                    <Text className="text-body2 text-text-secondary text-center mt-2 px-2 leading-5">
                      Your verification is complete! Create a strong new password for your account.
                    </Text>
                  </View>

                  <View className="gap-4 w-full">
                    <View>
                      <FormLabel>New Password</FormLabel>
                      <InputComponent
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChangeText={(val) => {
                          setNewPassword(val);
                          if (passwordError) setPasswordError("");
                        }}
                        type="password"
                        showPasswordToggle={true}
                        error={Boolean(passwordError)}
                        helperText={passwordError}
                        editable={!loading}
                        leftIconName="lock-closed-outline"
                      />
                    </View>

                    <View>
                      <FormLabel>Confirm New Password</FormLabel>
                      <InputComponent
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChangeText={(val) => {
                          setConfirmPassword(val);
                          if (confirmError) setConfirmError("");
                        }}
                        type="password"
                        showPasswordToggle={true}
                        error={Boolean(confirmError)}
                        helperText={confirmError}
                        editable={!loading}
                        leftIconName="lock-closed-outline"
                      />
                    </View>

                    <ButtonComponent
                      title={loading ? "Updating Password..." : "Update Password & Sign In"}
                      variant="gradient"
                      onPress={handleResetPassword}
                      loading={loading}
                    />

                    <View className="flex-row justify-center items-center mt-2">
                      <TouchableOpacity
                        onPress={() => router.push("/auth/login/login")}
                        activeOpacity={0.7}
                      >
                        <Text className="text-body2 font-semibold text-text-secondary">
                          Return to <Text className="font-bold text-primary-main">Sign In</Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
