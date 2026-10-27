import ButtonComponent from "@/src/components/ButtonComponent";
import FormLabel from "@/src/components/FormLabel";
import InputComponent from "@/src/components/InputComponent";
import { useResponsive } from "@/src/hooks/useResponsive";
import { authService } from "@/src/services/authApi/authService";
import { useTheme } from "@/src/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const { isTablet } = useResponsive();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send verification code. Please try again.";
      toast.error(errMsg);
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
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend code. Please try again.";
      toast.error(errMsg);
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
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired verification code.";
      toast.error(errMsg);
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
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-default">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center items-center p-4"
        >
          <View className={`w-full ${isTablet ? "w-[450px]" : "w-full"}`}>
            {/* Top Back Nav Button */}
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-light mb-6 shadow-xs"
            >
              <Ionicons name="arrow-back" size={20} color="#1F2937" />
            </TouchableOpacity>

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <View className="w-full">
                <View className="items-center pb-8">
                  <View className="w-16 h-16 rounded-2xl bg-primary-light1 items-center justify-center mb-4 border border-primary-light2 shadow-xs">
                    <Ionicons
                      name="lock-closed"
                      size={30}
                      color={theme.palette.primary.main}
                    />
                  </View>
                  <Text className="text-h1 font-bold text-text-primary text-center">
                    Forgot Password?
                  </Text>
                  <Text className="text-body1 text-text-secondary text-center mt-2 px-4">
                    Enter your registered email address and we&apos;ll send you a
                    6-digit verification code to reset your password.
                  </Text>
                </View>

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
                <View className="items-center pb-6">
                  <View className="w-16 h-16 rounded-2xl bg-primary-light1 items-center justify-center mb-4 border border-primary-light2 shadow-xs">
                    <Ionicons
                      name="mail-unread"
                      size={30}
                      color={theme.palette.primary.main}
                    />
                  </View>
                  <Text className="text-h1 font-bold text-text-primary text-center">
                    Verify Code
                  </Text>
                  <Text className="text-body1 text-text-secondary text-center mt-2 px-4">
                    We sent a 6-digit verification code to{"\n"}
                    <Text className="font-semibold text-text-primary">
                      {email}
                    </Text>
                  </Text>
                </View>

                {/* 6 OTP Input Boxes */}
                <View className="flex-row justify-between w-full max-w-[340px] my-6">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) inputsRef.current[index] = ref;
                      }}
                      className={`w-12 h-14 border rounded-xl text-center text-h2 font-bold bg-white shadow-xs ${
                        otpError
                          ? "border-red-500 text-red-500"
                          : digit
                          ? "border-primary-main text-primary-main"
                          : "border-gray-light text-text-primary"
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
                  <Text className="text-caption text-red-500 mb-4 text-center">
                    Please enter the full 6-digit code.
                  </Text>
                )}

                <ButtonComponent
                  title={loading ? "Verifying..." : "Verify Code"}
                  variant="gradient"
                  onPress={handleVerifyOtp}
                  loading={loading}
                />

                <View className="flex-row justify-center items-center mt-6">
                  <Text className="text-body2 text-text-secondary">
                    Didn&apos;t receive the code?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={!canResend || loading}
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
              </View>
            )}

            {/* STEP 3: Set New Password */}
            {step === 3 && (
              <View className="w-full">
                <View className="items-center pb-8">
                  <View className="w-16 h-16 rounded-2xl bg-action-green/10 items-center justify-center mb-4 border border-action-green/20 shadow-xs">
                    <Ionicons
                      name="key"
                      size={30}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-h1 font-bold text-text-primary text-center">
                    Set New Password
                  </Text>
                  <Text className="text-body1 text-text-secondary text-center mt-2 px-4">
                    Your identity has been verified. Create a new strong password
                    for your account.
                  </Text>
                </View>

                <View className="gap-4 w-full">
                  <View>
                    <FormLabel>New Password</FormLabel>
                    <InputComponent
                      placeholder="Enter new password"
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
                    />
                  </View>

                  <View>
                    <FormLabel>Confirm New Password</FormLabel>
                    <InputComponent
                      placeholder="Confirm new password"
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
                    />
                  </View>

                  <ButtonComponent
                    title={loading ? "Resetting Password..." : "Reset Password"}
                    variant="gradient"
                    onPress={handleResetPassword}
                    loading={loading}
                  />

                  <View className="flex-row justify-center items-center mt-2">
                    <Text className="text-body2 text-text-secondary">
                      Back to{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/auth/login/login")}
                    >
                      <Text className="text-body2 font-bold text-primary-main">
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
