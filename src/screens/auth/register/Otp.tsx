import ButtonComponent from "@/src/components/ButtonComponent";
import { useAppDispatch, useAppSelector } from "@/src/hooks/store";
import { sendOtp, verifyOtp } from "@/src/store/authSlice";
import { useTheme } from "@/src/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";


type Props = {
  mobile: string;
  email: string;
  onNext: (otp: string) => void;
};

const Otp: React.FC<Props> = ({ mobile, email, onNext }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorVisible, setErrorVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<TextInput[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const gradientColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ] as const;

  const handleChange = (text: string, index: number) => {
    setErrorVisible(false);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setErrorVisible(true);
      return;
    }

    try {
      await dispatch(verifyOtp({ email, enteredOtp: otpValue })).unwrap();
      toast.success("OTP verified successfully!");
      onNext(otpValue);
    } catch (err: any) {
      toast.error(err || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      await dispatch(sendOtp(email)).unwrap();
      toast.success("A new OTP has been sent to your email.");
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      toast.error(err || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <View className="w-full items-center">
      <View className="rounded-xl overflow-hidden shadonw-sm mb-6">
        <LinearGradient
          colors={gradientColors}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full items-center justify-center"
        >

          <View className="w-20 h-20 items-center justify-center rounded-xl">

            <Ionicons
              name="shield-checkmark-outline"
              size={40}
              color="#FFFFFF"
            />

          </View>
        </LinearGradient>
      </View>
      <Text className="text-h1 font-bold mb-2 text-text-primary">Verify OTP</Text>
      <Text className="text-body1 text-text-secondary ">Enter the 6-digit code sent to {email || mobile}</Text>
      <View className="flex-row justify-center gap-2 mb-2 mt-4">
        {otp.map((digit, i) => {
          const isFocused = focusedIndex === i;
          return (
            <TextInput
              key={i}
              ref={(ref: any) => (inputsRef.current[i] = ref!)}
              value={digit}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(text) => handleChange(text, i)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              editable={!loading}
              className={`w-12 h-12 text-center text-h2 border rounded-xl ${isFocused ? "border-primary-main border-2" : (errorVisible ? "border-red-500" : "border-gray-medium")
                }`}
            />
          );
        })}
      </View>
      {errorVisible && (
        <Text className="text-red-500 text-small mb-4">Please enter the complete 6-digit code</Text>
      )}
      <ButtonComponent
        title={loading ? "Verifying..." : "Verify & Continue"}
        variant="gradient"
        onPress={handleVerify}
        loading={loading}
      />
      <View className="m-4 items-center  ">
        <Text className="text-body1 font-semibold text-text-secondary">Didn&apos;t receive the code</Text>
        <TouchableOpacity
          disabled={!canResend || loading}
          onPress={handleResendOtp}
        >
          <Text className={`${!canResend || loading ? "text-gray-medium" : "text-primary-main"} text-body2 font-bold`}>
            {canResend ? "Resend OTP" : `Resend in ${timer}s`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Otp;
